<?php
// backend/controllers/AdminController.php
require_once __DIR__ . '/../models/Admin.php';

class AdminController {
    private $adminModel;

    public function __construct($db) {
        $this->adminModel = new Admin($db);
    }

    public function handleRequest($method) {
        $action = isset($_GET['action']) ? $_GET['action'] : 'stats';

        switch ($method) {
            case 'GET':
                if ($action === 'stats') {
                    $stats = $this->adminModel->getDashboardStats();
                    
                    // Devolvemos el objeto directamente para que React lo lea sin .data
                    echo json_encode($stats ? $stats : [
                        "total_reservations" => 0,
                        "pending_payments" => 0,
                        "approved_reservations" => 0,
                        "total_revenue" => 0
                    ]);
                } elseif ($action === 'reservations') {
                    $reservations = $this->adminModel->getAllReservations();
                    echo json_encode($reservations ? $reservations : []);
                } else {
                    http_response_code(400);
                    echo json_encode(["error" => "Acción no válida"]);
                }
                break;

            case 'POST':
            case 'PUT':
                $input = json_decode(file_get_contents('php://input'), true);
                if (isset($input['reservation_id']) && isset($input['estado'])) {
                    $success = $this->adminModel->updateReservationStatus($input['reservation_id'], $input['estado']);
                    if ($success) {
                        echo json_encode(["status" => "success", "message" => "Estado actualizado correctamente"]);
                    } else {
                        http_response_code(500);
                        echo json_encode(["error" => "No se pudo actualizar el estado"]);
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(["error" => "Faltan parámetros obligatorios"]);
                }
                break;

            default:
                http_response_code(405);
                echo json_encode(["error" => "Método HTTP no permitido"]);
                break;
        }
    }
}