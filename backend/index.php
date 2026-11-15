<?php
// backend/index.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/controllers/AccommodationController.php';
require_once __DIR__ . '/controllers/ReservationController.php';

// Detectar endpoint
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

if (empty($endpoint)) {
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $parts = explode('/', trim($uri, '/'));
    $index = array_search('backend', $parts);
    if ($index !== false && isset($parts[$index + 1])) {
        $endpoint = $parts[$index + 1];
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$db = getDBConnection();

switch ($endpoint) {
    case 'test':
        echo json_encode([
            "status" => "success",
            "message" => "¡Conexión exitosa entre el Backend PHP y la Base de Datos MySQL!",
            "database" => DB_NAME
        ]);
        break;

    case 'accommodations':
        $controller = new AccommodationController($db);
        $controller->handleRequest($method);
        break;
    
    case 'reservations':
        $controller = new ReservationController($db);
        $controller->handleRequest($method);
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Endpoint no encontrado en la API de Camping Manager"]);
        break;
}

$db->close();