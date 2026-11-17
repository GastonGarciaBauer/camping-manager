<?php
// backend/config/mercadopago.php

// 1. Cargar el autoloader de Composer desde la raíz del proyecto
require_once __DIR__ . '/../../vendor/autoload.php';

// 2. Importar y configurar el SDK moderno de Mercado Pago (v3)
use MercadoPago\MercadoPagoConfig;

// Configura tu Access Token de pruebas
MercadoPagoConfig::setAccessToken("APP_USR-tu-access-token-de-prueba-aqui");