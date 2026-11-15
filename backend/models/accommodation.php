<?php
// backend/models/Accommodation.php

class Accommodation {
    private $conn;
    private $table = 'accommodations';

    public function __construct($db) {
        $this->conn = $db;
    }

    // Obtener todos los alojamientos activos/disponibles
    public function getAll() {
        $query = "SELECT * FROM " . $this->table . " ORDER BY tipo_alojamiento, codigo_unidad";
        $result = $this->conn->query($query);
        return $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
    }

    // Verificar disponibilidad por tipo de alojamiento y rango de fechas
    public function getAvailableByType($tipo, $fechaIngreso, $fechaSalida) {
        // Busca unidades de ese tipo que NO tengan reservas aprobadas o activas superpuestas en las fechas
        $query = "SELECT * FROM " . $this->table . " 
                  WHERE tipo_alojamiento = ? 
                  AND estado_operativo = 'disponible'
                  AND id NOT IN (
                      SELECT accommodation_id FROM reservations 
                      WHERE estado_reserva IN ('aprobado', 'modificado', 'pago_en_proceso')
                      AND NOT (fecha_salida <= ? OR fecha_ingreso >= ?)
                  )";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("sss", $tipo, $fechaIngreso, $fechaSalida);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }
}