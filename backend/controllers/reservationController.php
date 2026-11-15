<?php
// backend/controllers/ReservationController.php
require_once __DIR__ . '/../models/Reservation.php';

class ReservationController {
    private $reservationModel;

    public function __construct($db) {
        $this->reservationModel = new Reservation($db);
    }

    public function handleRequest($method) {
        switch ($method) {
            case 'POST':
                // Crear nueva solicitud de reserva desde la Landing
                $inputData = json_decode(file_get_contents('php://input'), true);
                
                if (!isset($inputData['guest']) || !isset($inputData['fecha_ingreso']) || !isset($inputData['fecha_salida']) || !isset($inputData['tipo_alojamiento'])) {
                    http_response_code(400);
                    echo json_encode(["error" => "Faltan datos obligatorios para procesar la solicitud."]);
                    return;
                }

                $response = $this->reservationModel->create($inputData);
                if (isset($response['error'])) {
                    http_response_code(400);
                }
                echo json_encode($response);
                break;

            case 'GET':
                // Consultar reserva mediante código privado (?codigo=CMP-XXXXXX)
                if (isset($_GET['codigo'])) {
                    $codigo = $_GET['codigo'];
                    $reservation = $this->reservationModel->getByPrivateCode($codigo);

                    if ($reservation) {
                        echo json_encode([
                            "status" => "success",
                            "data" => $reservation
                        ]);
                    } else {
                        http_response_code(404);
                        echo json_encode(["error" => "Código de reserva inválido o no encontrado."]);
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(["error" => "Debe proporcionar un código privado de reserva."]);
                }
                break;

            default:
                http_response_code(405);
                echo json_encode(["error" => "Método HTTP no permitido"]);
                break;
        }
    }
}