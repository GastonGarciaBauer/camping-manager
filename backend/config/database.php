<?php
// backend/config/database.php

date_default_timezone_set('America/Argentina/Buenos_Aires');

define('DB_HOST', 'localhost');
define('DB_USER', 'root');      // Cambiar según tu entorno local (ej. XAMPP/WAMP)
define('DB_PASS', '');          // Contraseña de tu MySQL local
define('DB_NAME', 'camping_manager');
define('DB_PORT', '3307');

function getDBConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
    
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(["error" => "Error de conexión a la base de datos: " . $conn->connect_error]);
        exit();
    }
    
    $conn->set_charset("utf8mb4");
    $conn->query("SET time_zone = '-03:00'");
    return $conn;
}