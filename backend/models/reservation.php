<?php
// backend/models/Reservation.php

class Reservation {
    private $conn;
    private $table = 'reservations';

    public function __construct($db) {
        $this->conn = $db;
    }

    // Generar código privado único y aleatorio (ej. CMP-8F3K9A)
    public function generatePrivateCode() {
        do {
            $code = 'CMP-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 6));
            $query = "SELECT id FROM " . $this->table . " WHERE codigo_privado = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("s", $code);
            $stmt->execute();
            $result = $stmt->get_result();
        } while ($result->num_rows > 0);

        return $code;
    }

    // Registrar o buscar huésped por DNI para asociarlo
    public function getOrCreateGuest($guestData) {
        $dni = $guestData['dni'];
        $query = "SELECT id FROM guests WHERE dni = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $dni);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            return $row['id'];
        }

        // Si no existe, lo creamos
        $insert = "INSERT INTO guests (nombre, apellido, dni, telefono, email, pais_localidad, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmtInsert = $this->conn->prepare($insert);
        $stmtInsert->bind_param(
            "sssssss", 
            $guestData['nombre'], 
            $guestData['apellido'], 
            $guestData['dni'], 
            $guestData['telefono'], 
            $guestData['email'], 
            $guestData['pais_localidad'], 
            $guestData['observaciones']
        );
        $stmtInsert->execute();
        return $this->conn->insert_id;
    }

    // Crear una nueva solicitud de reserva
    public function create($data) {
        // 1. Obtener o crear el huésped titular
        $guestId = $this->getOrCreateGuest($data['guest']);

        // 2. Seleccionar automáticamente una unidad disponible de forma aleatoria según el tipo solicitado
        $tipoAlojamiento = $data['tipo_alojamiento'];
        $fechaIngreso = $data['fecha_ingreso'];
        $fechaSalida = $data['fecha_salida'];

        $queryAcc = "SELECT id FROM accommodations 
                     WHERE tipo_alojamiento = ? 
                     AND estado_operativo = 'disponible'
                     AND id NOT IN (
                         SELECT accommodation_id FROM reservations 
                         WHERE estado_reserva IN ('aprobado', 'modificado', 'pago_en_proceso')
                         AND NOT (fecha_salida <= ? OR fecha_ingreso >= ?)
                     ) 
                     ORDER BY RAND() LIMIT 1";

        $stmtAcc = $this->conn->prepare($queryAcc);
        $stmtAcc->bind_param("sss", $tipoAlojamiento, $fechaIngreso, $fechaSalida);
        $stmtAcc->execute();
        $resAcc = $stmtAcc->get_result();

        if ($resAcc->num_rows === 0) {
            return ["error" => "No hay unidades disponibles para el tipo y fechas seleccionadas."];
        }

        $accommodation = $resAcc->fetch_assoc();
        $accommodationId = $accommodation['id'];

        // 3. Generar código privado y vigencia de 24 horas
        $codigoPrivado = $this->generatePrivateCode();
        $vigenciaHasta = date('Y-m-d H:i:s', strtotime('+24 hours'));

        // 4. Insertar la reserva en estado 'pendiente_pago'
        $queryRes = "INSERT INTO reservations (codigo_privado, guest_id, accommodation_id, fecha_ingreso, fecha_salida, cantidad_personas, estado_reserva, vigencia_solicitud_hasta) 
                     VALUES (?, ?, ?, ?, ?, ?, 'pendiente_pago', ?)";
        
        $stmtRes = $this->conn->prepare($queryRes);
        $stmtRes->bind_param(
            "siissss", 
            $codigoPrivado, 
            $guestId, 
            $accommodationId, 
            $fechaIngreso, 
            $fechaSalida, 
            $data['cantidad_personas'], 
            $vigenciaHasta
        );

        if ($stmtRes->execute()) {
            $reservationId = $this->conn->insert_id;

            // 5. Registrar adicionales si se solicitaron (estacionamiento o carpa)
            if (isset($data['adicionales']) && is_array($data['adicionales'])) {
                // Calcular noches de estadía
                $noches = (strtotime($fechaSalida) - strtotime($fechaIngreso)) / 86400;

                foreach ($data['adicionales'] as $add) {
                    $tipoAdicional = $add['tipo']; // 'estacionamiento' o 'alquiler_carpa'
                    $precioUnitario = $add['precio_diario'];
                    $subtotal = $precioUnitario * $noches;

                    $queryAddon = "INSERT INTO reservation_addons (reservation_id, tipo_adicional, cantidad_dias, precio_diario_unitario, subtotal) VALUES (?, ?, ?, ?, ?)";
                    $stmtAddon = $this->conn->prepare($queryAddon);
                    $stmtAddon->bind_param("isidd", $reservationId, $tipoAdicional, $noches, $precioUnitario, $subtotal);
                    $stmtAddon->execute();
                }
            }

            return [
                "status" => "success",
                "message" => "Solicitud creada correctamente",
                "codigo_privado" => $codigoPrivado,
                "reservation_id" => $reservationId,
                "vigencia_hasta" => $vigenciaHasta
            ];
        }

        return ["error" => "Error al registrar la solicitud de reserva en la base de datos."];
    }

    // Consultar reserva mediante el código privado (para el panel del huésped)
    public function getByPrivateCode($code) {
        $query = "SELECT r.*, 
                         g.nombre as guest_nombre, g.apellido as guest_apellido, g.email as guest_email, g.telefono as guest_telefono, g.dni as guest_dni, g.pais_localidad,
                         a.codigo_unidad, a.tipo_alojamiento, a.tarifa_base_diaria
                  FROM " . $this->table . " r
                  JOIN guests g ON r.guest_id = g.id
                  JOIN accommodations a ON r.accommodation_id = a.id
                  WHERE r.codigo_privado = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $code);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            return null;
        }

        $reservation = $result->fetch_assoc();

        // Obtener sus adicionales contratados
        $queryAddons = "SELECT * FROM reservation_addons WHERE reservation_id = ?";
        $stmtAddons = $this->conn->prepare($queryAddons);
        $stmtAddons->bind_param("i", $reservation['id']);
        $stmtAddons->execute();
        $addonsResult = $stmtAddons->get_result();
        $reservation['adicionales'] = $addonsResult->fetch_all(MYSQLI_ASSOC);

        return $reservation;
    }
}