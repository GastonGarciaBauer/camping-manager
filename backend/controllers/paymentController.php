<?php
// backend/controllers/PaymentController.php
require_once __DIR__ . '/../config/mercadopago.php';
require_once __DIR__ . '/../models/payment.php';
require_once __DIR__ . '/../models/reservation.php';

class PaymentController {
    private $paymentModel;
    private $db;

    public function __construct($db) {
        $this->db = $db;
        $this->paymentModel = new Payment($db);
    }

    public function handleRequest($method) {
        switch ($method) {
            case 'POST':
                $inputData = json_decode(file_get_contents('php://input'), true);

                if (!isset($inputData['reservation_id'])) {
                    http_response_code(400);
                    echo json_encode(["error" => "Falta el ID de la reserva para procesar el pago."]);
                    return;
                }

                $reservationId = $inputData['reservation_id'];

                // 1. Consultar los datos de la reserva y la tarifa base de la unidad
                $reservationModel = new Reservation($this->db);
                $query = "SELECT r.*, a.tarifa_base_diaria FROM reservations r 
                          JOIN accommodations a ON r.accommodation_id = a.id 
                          WHERE r.id = ?";
                $stmt = $this->db->prepare($query);
                $stmt->bind_param("i", $reservationId);
                $stmt->execute();
                $resData = $stmt->get_result()->fetch_assoc();

                if (!$resData) {
                    http_response_code(404);
                    echo json_encode(["error" => "Reserva no encontrada."]);
                    return;
                }

                // Calcular noches de estadía y monto base
                $noches = (strtotime($resData['fecha_salida']) - strtotime($resData['fecha_ingreso'])) / 86400;
                $montoBase = $resData['tarifa_base_diaria'] * ($noches > 0 ? $noches : 1);

                // Sumar adicionales si los hay
                $queryAddons = "SELECT SUM(subtotal) as total_adicionales FROM reservation_addons WHERE reservation_id = ?";
                $stmtAdd = $this->db->prepare($queryAddons);
                $stmtAdd->bind_param("i", $reservationId);
                $stmtAdd->execute();
                $addonsData = $stmtAdd->get_result()->fetch_assoc();
                $montoAdicionales = $addonsData['total_adicionales'] ?? 0;

                $montoTotal = $montoBase + $montoAdicionales;

                // 2. Crear la Preferencia real en la API de Mercado Pago usando el SDK
                $preference = new MercadoPago\Preference();

                $item = new MercadoPago\Item();
                $item->title = "Reserva de Alojamiento - Camping & Cabañas";
                $item->quantity = 1;
                $item->unit_price = (float)$montoTotal;
                
                $preference->items = array($item);

                // URLs de retorno configuradas hacia el Portal del Huésped en React
                $preference->back_urls = array(
                    "success" => "http://localhost:5173/?status=success&code=" . $resData['codigo_privado'],
                    "failure" => "http://localhost:5173/?status=failure&code=" . $resData['codigo_privado'],
                    "pending" => "http://localhost:5173/?status=pending&code=" . $resData['codigo_privado']
                );
                $preference->auto_return = "approved";
                $preference->external_reference = (string)$reservationId;

                $preference->save();

                // 3. Registrar o actualizar el intento de pago pendiente en la base de datos local
                $response = $this->paymentModel->createLockAndPayment($reservationId, $montoTotal);

                if (isset($response['error'])) {
                    http_response_code(400);
                } else {
                    // Devolver el init_point real generado por Mercado Pago
                    $response['mp_init_point'] = $preference->init_point;
                }

                echo json_encode($response);
                break;

            default:
                http_response_code(405);
                echo json_encode(["error" => "Método HTTP no permitido"]);
                break;
        }
    }
}