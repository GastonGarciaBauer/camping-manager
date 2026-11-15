-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3307
-- Tiempo de generación: 15-11-2026 a las 00:28:31
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `camping_manager`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `accommodations`
--

CREATE TABLE `accommodations` (
  `id` int(11) NOT NULL,
  `codigo_unidad` varchar(50) NOT NULL,
  `tipo_alojamiento` enum('parcela_comun','cabana_1_ambiente','cabana_2_ambientes') NOT NULL,
  `capacidad_personas` int(11) NOT NULL,
  `tarifa_base_diaria` decimal(10,2) NOT NULL,
  `estado_operativo` enum('disponible','mantenimiento','fuera_de_servicio') DEFAULT 'disponible'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `dni` varchar(20) NOT NULL,
  `telefono` varchar(30) NOT NULL,
  `direccion` text NOT NULL,
  `fecha_contratacion` date NOT NULL,
  `puesto` varchar(100) NOT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `salario` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `guests`
--

CREATE TABLE `guests` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `dni` varchar(20) NOT NULL,
  `telefono` varchar(30) NOT NULL,
  `email` varchar(150) NOT NULL,
  `pais_localidad` varchar(100) NOT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `reservation_id` int(11) NOT NULL,
  `mp_payment_id` varchar(100) DEFAULT NULL,
  `monto` decimal(10,2) NOT NULL,
  `tipo_pago` enum('inicial','diferencia','extension') DEFAULT 'inicial',
  `payment_status` enum('pendiente','aprobado','aprobado_sin_reserva','rechazado','expirado','reintegrado') DEFAULT 'pendiente',
  `bloqueo_inicio_at` datetime DEFAULT NULL,
  `bloqueo_expira_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `payment_incidents`
--

CREATE TABLE `payment_incidents` (
  `id` int(11) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `reservation_id` int(11) NOT NULL,
  `tipo_incidencia` enum('pago_aprobado_sin_reserva','reintegro_por_cancelacion') NOT NULL,
  `monto_afectado` decimal(10,2) NOT NULL,
  `estado_incidencia` enum('pendiente','resuelto') DEFAULT 'pendiente',
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservations`
--

CREATE TABLE `reservations` (
  `id` int(11) NOT NULL,
  `codigo_privado` varchar(30) NOT NULL,
  `guest_id` int(11) NOT NULL,
  `accommodation_id` int(11) NOT NULL,
  `fecha_ingreso` date NOT NULL,
  `fecha_salida` date NOT NULL,
  `cantidad_personas` int(11) NOT NULL,
  `estado_reserva` enum('pendiente_pago','pago_en_proceso','aprobado','modificado','cancelado') DEFAULT 'pendiente_pago',
  `vigencia_solicitud_hasta` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservation_addons`
--

CREATE TABLE `reservation_addons` (
  `id` int(11) NOT NULL,
  `reservation_id` int(11) NOT NULL,
  `tipo_adicional` enum('estacionamiento','alquiler_carpa') NOT NULL,
  `cantidad_dias` int(11) NOT NULL,
  `precio_diario_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `nombre_comercial` varchar(150) NOT NULL,
  `cuit` varchar(20) NOT NULL,
  `persona_contacto` varchar(100) NOT NULL,
  `telefono` varchar(30) NOT NULL,
  `email` varchar(150) NOT NULL,
  `direccion` text NOT NULL,
  `tipo_proveedor` enum('insumos','servicios') NOT NULL,
  `categoria` varchar(100) NOT NULL,
  `descripcion_servicio_insumo` text DEFAULT NULL,
  `costo_referencia` decimal(10,2) DEFAULT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `accommodations`
--
ALTER TABLE `accommodations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_unidad` (`codigo_unidad`);

--
-- Indices de la tabla `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dni` (`dni`);

--
-- Indices de la tabla `guests`
--
ALTER TABLE `guests`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_payment_reservation` (`reservation_id`);

--
-- Indices de la tabla `payment_incidents`
--
ALTER TABLE `payment_incidents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_incident_payment` (`payment_id`),
  ADD KEY `fk_incident_reservation` (`reservation_id`);

--
-- Indices de la tabla `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_privado` (`codigo_privado`),
  ADD KEY `fk_reservation_guest` (`guest_id`),
  ADD KEY `fk_reservation_accommodation` (`accommodation_id`);

--
-- Indices de la tabla `reservation_addons`
--
ALTER TABLE `reservation_addons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_addon_reservation` (`reservation_id`);

--
-- Indices de la tabla `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cuit` (`cuit`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `accommodations`
--
ALTER TABLE `accommodations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `guests`
--
ALTER TABLE `guests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `payment_incidents`
--
ALTER TABLE `payment_incidents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `reservation_addons`
--
ALTER TABLE `reservation_addons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payment_reservation` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `payment_incidents`
--
ALTER TABLE `payment_incidents`
  ADD CONSTRAINT `fk_incident_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_incident_reservation` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `fk_reservation_accommodation` FOREIGN KEY (`accommodation_id`) REFERENCES `accommodations` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reservation_guest` FOREIGN KEY (`guest_id`) REFERENCES `guests` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `reservation_addons`
--
ALTER TABLE `reservation_addons`
  ADD CONSTRAINT `fk_addon_reservation` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
