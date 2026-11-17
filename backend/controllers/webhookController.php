<?php
// backend/controllers/WebhookController.php
require_once __DIR__ . '/../config/mercadopago.php';
require_once __DIR__ . '/../models/Payment.php';

class WebhookController {
    private $paymentModel;
    private $db;

    public function __construct($db) {
        $this->db = $db;
        $this->paymentModel = new Payment($db);
    }

    public function handleRequest() {
        $body = json_decode(file_get_contents('php://input'), true);

        // Mercado Pago envía notificaciones de tipo 'payment' (también puede venir en $_GET['id'] según el tipo de notificación)
        $topic = isset($_GET['topic']) ? $_GET['topic'] : (isset($body['type']) ? $body['type'] : null);
        $id = isset($_GET['id']) ? $_GET['id'] : (isset($body['data']['id']) ? $body['data']['id'] : null);

        if ($topic === 'payment' && $id) {
            try {
                // Consultar el estado real del pago a la API de Mercado Pago con el SDK
                $paymentInfo = MercadoPago\Payment::find_by_id($id);

                if ($paymentInfo && $paymentInfo->status === 'approved') {
                    // La external_reference que guardamos al crear la preferencia es el ID de la reserva
                    $reservationId = $paymentInfo->external_reference;

                    if ($reservationId) {
                        // 1. Actualizar el estado del pago a 'aprobado' en la base de datos
                        $updatePayment = "UPDATE payments SET payment_status = 'aprobado' WHERE reservation_id = ?";
                        $stmtPay = $this->db->prepare($updatePayment);
                        $stmtPay->bind_param("i", $reservationId);
                        $stmtPay->execute();

                        // 2. Aprobar definitivamente la reserva
                        $updateReservation = "UPDATE reservations SET estado_reserva = 'aprobado' WHERE id = ?";
                        $stmtRes = $this->db->prepare($updateReservation);
                        $stmtRes->bind_param("i", $reservationId);
                        $stmtRes->execute();
                    }
                }
            } catch (Exception $e) {
                // Registrar el error de consulta a la API de MP si ocurriera
                error_log("Error en Webhook Mercado Pago: " . $e->getMessage());
            }
        }

        // Siempre responder 200 OK a Mercado Pago para confirmar la recepción del webhook
        http_response_code(200);
        echo json_encode(["status" => "received"]);
    }
}