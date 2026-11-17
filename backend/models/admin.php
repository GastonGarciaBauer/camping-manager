<?php
// backend/models/Admin.php

class Admin {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Obtener estadísticas generales para los KPIs del Dashboard (blindado contra tablas vacías)
    public function getDashboardStats() {
        $resTotal = 0;
        $resAprobadas = 0;
        $resPendientes = 0;
        $resIngresos = 0;

        // 1. Total de reservas
        $queryTotal = $this->conn->query("SELECT COUNT(*) as total FROM reservations");
        if ($queryTotal && $row = $queryTotal->fetch_assoc()) {
            $resTotal = (int)$row['total'];
        }

        // 2. Reservas aprobadas
        $queryAprobadas = $this->conn->query("SELECT COUNT(*) as total FROM reservations WHERE estado_reserva = 'aprobado'");
        if ($queryAprobadas && $row = $queryAprobadas->fetch_assoc()) {
            $resAprobadas = (int)$row['total'];
        }

        // 3. Reservas pendientes
        $queryPendientes = $this->conn->query("SELECT COUNT(*) as total FROM reservations WHERE estado_reserva IN ('pendiente_pago', 'pago_en_proceso')");
        if ($queryPendientes && $row = $queryPendientes->fetch_assoc()) {
            $resPendientes = (int)$row['total'];
        }

        // 4. Ingresos totales calculados desde la tabla payments
        $queryIngresos = $this->conn->query("SELECT SUM(monto) as total FROM payments WHERE payment_status = 'aprobado'");
        if ($queryIngresos && $row = $queryIngresos->fetch_assoc()) {
            $resIngresos = (float)($row['total'] ?? 0);
        }

        // Devolvemos ambas variantes (pending_reservations y pending_payments) para evitar conflictos con React
        return [
            "total_reservations" => $resTotal,
            "approved_reservations" => $resAprobadas,
            "pending_reservations" => $resPendientes,
            "pending_payments" => $resPendientes,
            "total_revenue" => $resIngresos
        ];
    }

    // Listar todas las reservas con datos del huésped y unidad asignada
    public function getAllReservations() {
        $query = "SELECT r.*, 
                         g.nombre as guest_nombre, g.apellido as guest_apellido, g.dni as guest_dni, g.telefono as guest_telefono,
                         a.codigo_unidad, a.tipo_alojamiento 
                  FROM reservations r 
                  JOIN guests g ON r.guest_id = g.id 
                  JOIN accommodations a ON r.accommodation_id = a.id 
                  ORDER BY r.id DESC";
        
        $result = $this->conn->query($query);
        return $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
    }

    // Actualizar manualmente el estado de una reserva (Ej: Aprobar o Cancelar desde el backoffice)
    public function updateReservationStatus($reservationId, $nuevoEstado) {
        $query = "UPDATE reservations SET estado_reserva = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("si", $nuevoEstado, $reservationId);
        return $stmt->execute();
    }
}