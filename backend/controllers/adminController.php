<?php
// backend/controllers/adminController.php
require_once __DIR__ . '/../models/admin.php';

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
                    echo json_encode($stats ? $stats : [
                        "total_reservations" => 0,
                        "pending_payments" => 0,
                        "approved_reservations" => 0,
                        "total_revenue" => 0
                    ]);
                } elseif ($action === 'resumen') {
                    $period = isset($_GET['period']) ? $_GET['period'] : '7d';
                    $data = $this->adminModel->getResumenData($period);
                    echo json_encode($data);
                } elseif ($action === 'reservations') {
                    $reservations = $this->adminModel->getAllReservations();
                    echo json_encode($reservations ? $reservations : []);
                } elseif ($action === 'accommodations') {
                    $units = $this->adminModel->getAccommodationsStatus();
                    echo json_encode($units ? $units : []);
                } elseif ($action === 'pending_payments') {
                    $payments = $this->adminModel->getPendingPayments();
                    echo json_encode($payments ? $payments : []);
                } elseif ($action === 'tasks') {
                    $tasks = $this->adminModel->getAllTasks();
                    echo json_encode($tasks ? $tasks : []);
                } else {
                    http_response_code(400);
                    echo json_encode(["error" => "Acción no válida"]);
                }
                break;

            case 'POST':
            case 'PUT':
                $input = json_decode(file_get_contents('php://input'), true) ?: [];
                $postAction = $input['action'] ?? '';

                if ($postAction === 'login') {
                    $username = $input['user'] ?? ($input['email'] ?? '');
                    $result = $this->adminModel->loginAdmin(
                        $username,
                        $input['password'] ?? ''
                    );
                    if (isset($result['error'])) {
                        http_response_code(401);
                    }
                    echo json_encode($result);
                } elseif ($postAction === 'movement' && isset($input['reservation_id'], $input['movement_action'])) {
                    $success = $this->adminModel->updateMovementStay(
                        $input['reservation_id'],
                        $input['movement_action']
                    );
                    if ($success) {
                        echo json_encode(["status" => "success", "message" => "Movimiento actualizado correctamente"]);
                    } else {
                        http_response_code(400);
                        echo json_encode(["error" => "No se pudo actualizar el movimiento"]);
                    }
                } elseif ($postAction === 'toggle_task' && isset($input['task_id'])) {
                    $success = $this->adminModel->toggleTaskStatus($input['task_id']);
                    if ($success) {
                        echo json_encode(["status" => "success", "message" => "Estado de tarea actualizado"]);
                    } else {
                        http_response_code(500);
                        echo json_encode(["error" => "No se pudo actualizar la tarea"]);
                    }
                } elseif ($postAction === 'create_task' && isset($input['title'])) {
                    $created = $this->adminModel->createTask(
                        $input['title'],
                        $input['sector'] ?? 'Sector común',
                        $input['priority'] ?? 'media'
                    );
                    if ($created) {
                        echo json_encode([
                            "status" => "success",
                            "message" => "Tarea creada correctamente",
                            "task" => $created
                        ]);
                    } else {
                        http_response_code(400);
                        echo json_encode(["error" => "No se pudo crear la tarea"]);
                    }
                } elseif ($postAction === 'update_accommodation' && isset($input['accommodation_id'], $input['status'])) {
                    $success = $this->adminModel->updateAccommodationOperationalStatus(
                        $input['accommodation_id'],
                        $input['status'],
                        $input['note'] ?? null
                    );
                    if ($success) {
                        echo json_encode(["status" => "success", "message" => "Estado del alojamiento actualizado"]);
                    } else {
                        http_response_code(500);
                        echo json_encode(["error" => "No se pudo actualizar el alojamiento"]);
                    }
                } elseif ($postAction === 'collect_payment' && isset($input['reservation_id'])) {
                    $success = $this->adminModel->collectReservationPayment(
                        $input['reservation_id'],
                        $input['monto'] ?? null,
                        $input['metodo_pago'] ?? 'efectivo'
                    );
                    if ($success) {
                        echo json_encode(["status" => "success", "message" => "Cobro registrado correctamente"]);
                    } else {
                        http_response_code(500);
                        echo json_encode(["error" => "No se pudo registrar el cobro"]);
                    }
                } elseif (isset($input['reservation_id']) && isset($input['estado'])) {
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