<?php
// backend/models/payment.php

class Payment {
    private $conn;
    private $table = 'payments';

    public function __construct($db) {
        $this->conn = $db;
    }

    // Iniciar bloqueo temporal de 15 minutos e intento de pago
    public function createLockAndPayment($reservationId, $monto) {
        // Verificar estado actual de la reserva
        $queryRes = "SELECT r.*, a.tarifa_base_diaria FROM reservations r 
                     JOIN accommodations a ON r.accommodation_id = a.id 
                     WHERE r.id = ? AND r.estado_reserva IN ('pendiente_pago', 'cancelado') AND r.vigencia_solicitud_hasta > NOW()";
        
        $stmt = $this->conn->prepare($queryRes);
        $stmt->bind_param("i", $reservationId);
        $stmt->execute();
        $res = $stmt->get_result();

        if ($res->num_rows === 0) {
            return ["error" => "La solicitud no existe, ya fue pagada, venció su plazo de 24 hs o no está disponible para pago."];
        }

        $reservation = $res->fetch_assoc();
        $accommodationId = $reservation['accommodation_id'];
        $fechaIngreso = $reservation['fecha_ingreso'];
        $fechaSalida = $reservation['fecha_salida'];

        // Verificar si la unidad fue ocupada por otro proceso en este preciso instante (Concurrencia)
        $queryCheck = "SELECT id FROM reservations 
                       WHERE accommodation_id = ? 
                       AND estado_reserva IN ('aprobado', 'modificado', 'pago_en_proceso')
                       AND id != ?
                       AND NOT (fecha_salida <= ? OR fecha_ingreso >= ?)";
        
        $stmtCheck = $this->conn->prepare($queryCheck);
        $stmtCheck->bind_param("iiss", $accommodationId, $reservationId, $fechaIngreso, $fechaSalida);
        $stmtCheck->execute();
        if ($stmtCheck->get_result()->num_rows > 0) {
            return ["error" => "Lo sentimos, el alojamiento acaba de ser tomado temporalmente o reservado por otro usuario."];
        }
        
        // Aplicar bloqueo temporal por 15 minutos
        $bloqueoInicio = date('Y-m-d H:i:s');
        $bloqueoExpira = date('Y-m-d H:i:s', strtotime('+15 minutes'));

        // Actualizar estado de la reserva a 'pago_en_proceso'
        $updateRes = "UPDATE reservations SET estado_reserva = 'pago_en_proceso' WHERE id = ?";
        $stmtUp = $this->conn->prepare($updateRes);
        $stmtUp->bind_param("i", $reservationId);
        $stmtUp->execute();

        // Registrar o actualizar el intento en la tabla payments
        $insertPay = "INSERT INTO payments (reservation_id, monto, tipo_pago, payment_status, bloqueo_inicio_at, bloqueo_expira_at) 
                      VALUES (?, ?, 'inicial', 'pendiente', ?, ?)";
        $stmtPay = $this->conn->prepare($insertPay);
        $stmtPay->bind_param("dss", $reservationId, $monto, $bloqueoInicio, $bloqueoExpira);
        $stmtPay->execute();
        $paymentId = $this->conn->insert_id;

        return [
            "status" => "success",
            "payment_id" => $paymentId,
            "bloqueo_expira_at" => $bloqueoExpira,
            "monto" => $monto
        ];
    }
    // Agrega este método dentro de tu clase Payment en backend/models/Payment.php

    public function processWebhookApproval($externalReference) {
        // externalReference puede ser el ID del pago o de la reserva que enviamos al crear la preferencia
        // Asumiremos que pasamos el reservation_id o payment_id para identificarlo
        
        $query = "SELECT p.*, r.id as reservation_id FROM payments p
                  JOIN reservations r ON p.reservation_id = r.id
                  WHERE p.id = ? AND p.payment_status = 'pendiente'";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $externalReference);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            return false; // Ya fue procesado o no existe
        }

        $payment = $result->fetch_assoc();
        $reservationId = $payment['reservation_id'];

        // 1. Actualizar el estado del pago a 'aprobado'
        $updatePay = "UPDATE payments SET payment_status = 'aprobado' WHERE id = ?";
        $stmtUpPay = $this->conn->prepare($updatePay);
        $stmtUpPay->bind_param("i", $payment['id']);
        $stmtUpPay->execute();

        // 2. Actualizar el estado de la reserva a 'aprobado' y limpiar fecha de bloqueo temporal
        $updateRes = "UPDATE reservations SET estado_reserva = 'aprobado' WHERE id = ?";
        $stmtUpRes = $this->conn->prepare($updateRes);
        $stmtUpRes->bind_param("i", $reservationId);
        $stmtUpRes->execute();

        return true;
    }
}