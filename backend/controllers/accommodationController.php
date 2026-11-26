<?php
// backend/controllers/accommodationController.php
require_once __DIR__ . '/../models/accommodation.php';

class AccommodationController {
    private $accommodationModel;

    public function __construct($db) {
        $this->accommodationModel = new Accommodation($db);
    }

    // Manejar las peticiones de alojamientos
    public function handleRequest($method) {
        switch ($method) {
            case 'GET':
                // Si pasan parámetros de fechas y tipo, consultamos disponibilidad específica
                if (isset($_GET['tipo']) && isset($_GET['ingreso']) && isset($_GET['salida'])) {
                    $disponibles = $this->accommodationModel->getAvailableByType(
                        $_GET['tipo'], 
                        $_GET['ingreso'], 
                        $_GET['salida']
                    );
                    echo json_encode([
                        "status" => "success",
                        "count" => count($disponibles),
                        "data" => $disponibles
                    ]);
                } else {
                    // Si no, devolvemos todo el listado general
                    $all = $this->accommodationModel->getAll();
                    echo json_encode([
                        "status" => "success",
                        "data" => $all
                    ]);
                }
                break;

            default:
                http_response_code(405);
                echo json_encode(["error" => "Método HTTP no permitido"]);
                break;
        }
    }
}