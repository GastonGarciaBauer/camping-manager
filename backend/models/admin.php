<?php
// backend/models/admin.php

class Admin {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Garantiza que exista el usuario administrador de prueba 'admin' / 'admin' con bcrypt
    public function ensureDefaultAdmin() {
        $defaultEmail = 'admin';
        $stmt = $this->conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
        $stmt->bind_param("s", $defaultEmail);
        $stmt->execute();
        $res = $stmt->get_result();
        $exists = $res && $res->num_rows > 0;
        $stmt->close();

        if (!$exists) {
            $hash = password_hash('admin', PASSWORD_BCRYPT);
            $ins = $this->conn->prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)");
            $ins->bind_param("ss", $defaultEmail, $hash);
            $ins->execute();
            $ins->close();
        }
    }

    // Validar login de administrador
    public function loginAdmin($email, $password) {
        $this->ensureDefaultAdmin();

        $cleanEmail = strtolower(trim((string)$email));
        $plainPassword = (string)$password;

        if ($cleanEmail === '' || $plainPassword === '') {
            return ["error" => "Completá el email/usuario y la contraseña."];
        }

        $stmt = $this->conn->prepare("SELECT id, email, password_hash FROM users WHERE LOWER(email) = ? LIMIT 1");
        $stmt->bind_param("s", $cleanEmail);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result ? $result->fetch_assoc() : null;
        $stmt->close();

        if (!$user || !password_verify($plainPassword, $user['password_hash'])) {
            return ["error" => "Credenciales incorrectas."];
        }

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_user_id'] = (int)$user['id'];
        $_SESSION['admin_email'] = $user['email'];

        return [
            "status" => "success",
            "message" => "Sesión iniciada correctamente.",
            "user" => [
                "id" => (int)$user['id'],
                "email" => $user['email']
            ]
        ];
    }

    // Registrar un nuevo administrador con contraseña hasheada en bcrypt
    public function registerAdmin($email, $password, $repeatPassword) {
        $this->ensureDefaultAdmin();

        $cleanEmail = strtolower(trim((string)$email));
        $pass = (string)$password;
        $repeat = (string)$repeatPassword;

        if ($cleanEmail === '' || $pass === '' || $repeat === '') {
            return ["error" => "Completá todos los campos."];
        }

        if ($pass !== $repeat) {
            return ["error" => "Las contraseñas no coinciden."];
        }

        if (strlen($pass) < 4) {
            return ["error" => "La contraseña debe tener al menos 4 caracteres."];
        }

        $stmtCheck = $this->conn->prepare("SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1");
        $stmtCheck->bind_param("s", $cleanEmail);
        $stmtCheck->execute();
        $exists = $stmtCheck->get_result()->num_rows > 0;
        $stmtCheck->close();

        if ($exists) {
            return ["error" => "Ya existe un administrador registrado con ese email o usuario."];
        }

        $passwordHash = password_hash($pass, PASSWORD_BCRYPT);
        $stmtInsert = $this->conn->prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)");
        $stmtInsert->bind_param("ss", $cleanEmail, $passwordHash);

        if (!$stmtInsert->execute()) {
            $stmtInsert->close();
            return ["error" => "No se pudo guardar el administrador en la base de datos."];
        }

        $newId = (int)$this->conn->insert_id;
        $stmtInsert->close();

        return [
            "status" => "success",
            "message" => "Administrador agregado correctamente.",
            "user" => [
                "id" => $newId,
                "email" => $cleanEmail
            ]
        ];
    }

    // Obtener estadísticas generales para los KPIs del Dashboard (blindado contra tablas vacías)
    public function getDashboardStats() {
        $resTotal = 0;
        $resAprobadas = 0;
        $resPendientes = 0;
        $resIngresos = 0;

        $queryTotal = $this->conn->query("SELECT COUNT(*) as total FROM reservations");
        if ($queryTotal && $row = $queryTotal->fetch_assoc()) {
            $resTotal = (int)$row['total'];
        }

        $queryAprobadas = $this->conn->query("SELECT COUNT(*) as total FROM reservations WHERE estado_reserva = 'aprobado'");
        if ($queryAprobadas && $row = $queryAprobadas->fetch_assoc()) {
            $resAprobadas = (int)$row['total'];
        }

        $queryPendientes = $this->conn->query("SELECT COUNT(*) as total FROM reservations WHERE estado_reserva IN ('pendiente_pago', 'pago_en_proceso')");
        if ($queryPendientes && $row = $queryPendientes->fetch_assoc()) {
            $resPendientes = (int)$row['total'];
        }

        $queryIngresos = $this->conn->query("SELECT SUM(monto) as total FROM payments WHERE payment_status = 'aprobado'");
        if ($queryIngresos && $row = $queryIngresos->fetch_assoc()) {
            $resIngresos = (float)($row['total'] ?? 0);
        }

        return [
            "total_reservations" => $resTotal,
            "approved_reservations" => $resAprobadas,
            "pending_reservations" => $resPendientes,
            "pending_payments" => $resPendientes,
            "total_revenue" => $resIngresos
        ];
    }

    // Payload completo para la sección Resumen
    public function getResumenData($period = '7d') {
        $today = date('Y-m-d');

        return [
            "date" => $today,
            "kpis" => $this->getResumenKpis($today),
            "income_chart" => $this->getIncomeChart($period),
            "occupancy" => $this->getOccupancySummary($today),
            "movements" => $this->getDailyMovements($today),
            "tasks" => $this->getResumenTasks($today),
        ];
    }

    private function getResumenKpis($today) {
        $stmt = $this->conn->prepare("
            SELECT
                COALESCE(SUM(CASE
                    WHEN r.estado_reserva IN ('aprobado', 'pago_en_proceso', 'modificado')
                     AND r.estado_estadia = 'alojado'
                    THEN r.cantidad_personas ELSE 0
                END), 0) AS current_guests,

                COALESCE(SUM(CASE
                    WHEN r.fecha_ingreso = ?
                     AND r.estado_reserva IN ('aprobado', 'pago_en_proceso', 'modificado')
                    THEN 1 ELSE 0
                END), 0) AS checkins_today,

                COALESCE(SUM(CASE
                    WHEN r.fecha_salida = ?
                     AND r.estado_reserva IN ('aprobado', 'pago_en_proceso', 'modificado')
                    THEN 1 ELSE 0
                END), 0) AS checkouts_today,

                COALESCE(SUM(CASE
                    WHEN DATE(r.created_at) = ?
                     AND r.estado_reserva <> 'cancelado'
                    THEN 1 ELSE 0
                END), 0) AS reservations_today,

                COALESCE(SUM(CASE
                    WHEN r.estado_reserva IN ('pendiente_pago', 'pago_en_proceso')
                    THEN 1 ELSE 0
                END), 0) AS pending_payments_count
            FROM reservations r
        ");
        $stmt->bind_param("sss", $today, $today, $today);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc() ?: [];
        $stmt->close();

        $stmtIncome = $this->conn->prepare("
            SELECT COALESCE(SUM(monto), 0) AS income_today
            FROM payments
            WHERE payment_status = 'aprobado'
              AND DATE(COALESCE(pagado_at, bloqueo_inicio_at)) = ?
        ");
        $stmtIncome->bind_param("s", $today);
        $stmtIncome->execute();
        $incomeRow = $stmtIncome->get_result()->fetch_assoc() ?: [];
        $stmtIncome->close();

        return [
            "current_guests" => (int)($row['current_guests'] ?? 0),
            "checkins_today" => (int)($row['checkins_today'] ?? 0),
            "checkouts_today" => (int)($row['checkouts_today'] ?? 0),
            "income_today" => (float)($incomeRow['income_today'] ?? 0),
            "reservations_today" => (int)($row['reservations_today'] ?? 0),
            "pending_payments" => (int)($row['pending_payments_count'] ?? 0),
        ];
    }

    private function getIncomeChart($period) {
        $today = new DateTime();
        $endDate = $today->format('Y-m-d');

        if ($period === '30d') {
            $startDt = (clone $today)->modify('-29 days');
            $startDate = $startDt->format('Y-m-d');
            $label = 'Últimos 30 días';
        } elseif ($period === 'month') {
            $startDate = $today->format('Y-m-01');
            $label = 'Este mes';
        } else {
            $period = '7d';
            $startDt = (clone $today)->modify('-6 days');
            $startDate = $startDt->format('Y-m-d');
            $label = 'Últimos 7 días';
        }

        $stmt = $this->conn->prepare("
            SELECT
                DATE(COALESCE(pagado_at, bloqueo_inicio_at)) AS dia,
                COALESCE(SUM(monto), 0) AS total
            FROM payments
            WHERE payment_status = 'aprobado'
              AND DATE(COALESCE(pagado_at, bloqueo_inicio_at)) BETWEEN ? AND ?
            GROUP BY DATE(COALESCE(pagado_at, bloqueo_inicio_at))
            ORDER BY dia ASC
        ");
        $stmt->bind_param("ss", $startDate, $endDate);
        $stmt->execute();
        $res = $stmt->get_result();

        $totalsByDay = [];
        while ($r = $res->fetch_assoc()) {
            $totalsByDay[$r['dia']] = (float)$r['total'];
        }
        $stmt->close();

        $cursor = new DateTime($startDate);
        $endCursor = new DateTime($endDate);
        $series = [];
        $periodTotal = 0.0;

        while ($cursor <= $endCursor) {
            $key = $cursor->format('Y-m-d');
            $amount = $totalsByDay[$key] ?? 0.0;
            $periodTotal += $amount;

            $series[] = [
                "date" => $key,
                "label" => $cursor->format('d/m'),
                "is_today" => ($key === $endDate),
                "amount" => $amount,
            ];

            $cursor->modify('+1 day');
        }

        return [
            "period" => $period,
            "label" => $label,
            "total" => $periodTotal,
            "days" => $series,
        ];
    }

    private function getOccupancySummary($today) {
        $stmt = $this->conn->prepare("
            SELECT
                a.id,
                a.codigo_unidad,
                a.tipo_alojamiento,
                a.estado_operativo,
                CASE
                    WHEN a.estado_operativo IN ('mantenimiento', 'fuera_de_servicio') THEN 'mantenimiento'
                    WHEN EXISTS (
                        SELECT 1
                        FROM reservations r
                        WHERE r.accommodation_id = a.id
                          AND r.fecha_ingreso <= ?
                          AND r.fecha_salida > ?
                          AND r.estado_reserva IN ('aprobado', 'pago_en_proceso', 'modificado')
                          AND r.estado_estadia <> 'finalizada'
                    ) THEN 'ocupada'
                    ELSE 'disponible'
                END AS estado_actual
            FROM accommodations a
        ");
        $stmt->bind_param("ss", $today, $today);
        $stmt->execute();
        $res = $stmt->get_result();

        $total = 0;
        $occupied = 0;
        $available = 0;
        $maintenance = 0;

        while ($row = $res->fetch_assoc()) {
            $total++;
            if ($row['estado_actual'] === 'ocupada') {
                $occupied++;
            } elseif ($row['estado_actual'] === 'mantenimiento') {
                $maintenance++;
            } else {
                $available++;
            }
        }
        $stmt->close();

        $pct = $total > 0 ? (int)round(($occupied / $total) * 100) : 0;

        return [
            "total_units" => $total,
            "occupied" => $occupied,
            "available" => $available,
            "maintenance" => $maintenance,
            "occupancy_pct" => $pct,
        ];
    }

    private function getDailyMovements($today) {
        $stmt = $this->conn->prepare("
            SELECT
                r.id,
                r.codigo_privado,
                r.fecha_ingreso,
                r.fecha_salida,
                r.cantidad_personas,
                r.estado_reserva,
                r.estado_estadia,
                g.nombre AS guest_nombre,
                g.apellido AS guest_apellido,
                a.codigo_unidad,
                a.tipo_alojamiento
            FROM reservations r
            JOIN guests g ON r.guest_id = g.id
            JOIN accommodations a ON r.accommodation_id = a.id
            WHERE r.estado_reserva <> 'cancelado'
              AND (
                  r.fecha_ingreso = ?
                  OR r.fecha_salida = ?
                  OR (r.fecha_ingreso <= ? AND r.fecha_salida > ? AND r.estado_estadia = 'alojado')
              )
            ORDER BY r.id DESC
        ");
        $stmt->bind_param("ssss", $today, $today, $today, $today);
        $stmt->execute();
        $res = $stmt->get_result();

        $movements = [];
        while ($row = $res->fetch_assoc()) {
            $fullName = trim($row['guest_nombre'] . ' ' . $row['guest_apellido']);
            $parts = preg_split('/\s+/', $fullName);
            $initials = count($parts) >= 2
                ? strtoupper(substr($parts[0], 0, 1) . substr($parts[1], 0, 1))
                : strtoupper(substr($fullName ?: 'G', 0, 2));

            $categories = ['todos'];
            if ($row['fecha_ingreso'] === $today && $row['estado_estadia'] === 'programada') {
                $categories[] = 'llegadas';
            }
            if ($row['fecha_salida'] === $today && $row['estado_estadia'] !== 'finalizada') {
                $categories[] = 'salidas';
            }
            if ($row['estado_estadia'] === 'alojado') {
                $categories[] = 'alojados';
            }

            $statusLabel = 'Confirmada';
            $statusType = 'confirmed';
            $action = 'checkin';

            if ($row['estado_estadia'] === 'alojado') {
                $statusLabel = 'Alojada';
                $statusType = 'hosted';
                $action = 'checkout';
            } elseif ($row['estado_estadia'] === 'finalizada') {
                $statusLabel = 'Finalizada';
                $statusType = 'done';
                $action = 'done';
            }

            $unitLabel = $row['codigo_unidad'] . ' · ' . str_replace('_', ' ', $row['tipo_alojamiento']);
            $dateRange = date('d/m', strtotime($row['fecha_ingreso'])) . ' → ' . date('d/m', strtotime($row['fecha_salida']));

            $movements[] = [
                "id" => (int)$row['id'],
                "initials" => $initials,
                "guest" => $fullName,
                "code" => '#' . $row['codigo_privado'],
                "stay" => $unitLabel,
                "dates" => $dateRange,
                "categories" => array_values(array_unique($categories)),
                "status" => $statusLabel,
                "statusType" => $statusType,
                "action" => $action,
            ];
        }
        $stmt->close();

        return $movements;
    }

    private function getResumenTasks($today) {
        $stmt = $this->conn->prepare("
            SELECT id, titulo, sector, prioridad, estado, fecha_programada
            FROM tasks
            WHERE estado = 'pendiente' OR DATE(completada_at) = ?
            ORDER BY FIELD(estado, 'pendiente', 'completada'), FIELD(prioridad, 'alta', 'media', 'baja'), id DESC
        ");
        $stmt->bind_param("s", $today);
        $stmt->execute();
        $res = $stmt->get_result();

        $tasks = [];
        while ($row = $res->fetch_assoc()) {
            $tasks[] = [
                "id" => (int)$row['id'],
                "title" => $row['titulo'],
                "sector" => $row['sector'],
                "priority" => ucfirst($row['prioridad']),
                "done" => ($row['estado'] === 'completada'),
            ];
        }
        $stmt->close();

        return $tasks;
    }

    public function getAllTasks() {
        $query = "
            SELECT id, titulo, sector, prioridad, estado, fecha_programada
            FROM tasks
            ORDER BY FIELD(estado, 'pendiente', 'completada'), FIELD(prioridad, 'alta', 'media', 'baja'), id DESC
        ";
        $result = $this->conn->query($query);
        if (!$result) {
            return [];
        }

        $tasks = [];
        while ($row = $result->fetch_assoc()) {
            $tasks[] = [
                "id" => (int)$row['id'],
                "title" => $row['titulo'],
                "sector" => $row['sector'],
                "zone" => $row['sector'],
                "priority" => ucfirst($row['prioridad']),
                "priorityLevel" => strtolower($row['prioridad']),
                "done" => ($row['estado'] === 'completada'),
            ];
        }

        return $tasks;
    }

    public function createTask($title, $sector = 'Sector común', $priority = 'media') {
        $cleanTitle = trim((string)$title);
        $cleanSector = trim((string)$sector) ?: 'Sector común';

        $normalizedPriority = strtolower(trim((string)$priority));
        $allowedPriorities = ['baja', 'media', 'alta'];
        $dbPriority = in_array($normalizedPriority, $allowedPriorities, true) ? $normalizedPriority : 'media';

        if ($cleanTitle === '') {
            return null;
        }

        $today = date('Y-m-d');
        $stmt = $this->conn->prepare("
            INSERT INTO tasks (titulo, sector, prioridad, estado, fecha_programada)
            VALUES (?, ?, ?, 'pendiente', ?)
        ");
        $stmt->bind_param("ssss", $cleanTitle, $cleanSector, $dbPriority, $today);
        $ok = $stmt->execute();
        $newId = (int)$this->conn->insert_id;
        $stmt->close();

        if (!$ok) {
            return null;
        }

        return [
            "id" => $newId,
            "title" => $cleanTitle,
            "sector" => $cleanSector,
            "zone" => $cleanSector,
            "priority" => ucfirst($dbPriority),
            "priorityLevel" => $dbPriority,
            "done" => false,
        ];
    }

    public function updateMovementStay($reservationId, $movementAction) {
        $reservationId = (int)$reservationId;
        if ($movementAction === 'checkin') {
            $stmt = $this->conn->prepare("
                UPDATE reservations
                SET estado_estadia = 'alojado',
                    checkin_real_at = NOW()
                WHERE id = ?
            ");
        } elseif ($movementAction === 'checkout') {
            $stmt = $this->conn->prepare("
                UPDATE reservations
                SET estado_estadia = 'finalizada',
                    checkout_real_at = NOW()
                WHERE id = ?
            ");
        } else {
            return false;
        }

        $stmt->bind_param("i", $reservationId);
        $ok = $stmt->execute();
        $stmt->close();
        return $ok;
    }

    public function toggleTaskStatus($taskId) {
        $taskId = (int)$taskId;
        $stmt = $this->conn->prepare("
            UPDATE tasks
            SET estado = IF(estado = 'completada', 'pendiente', 'completada'),
                completada_at = IF(estado = 'completada', NULL, NOW())
            WHERE id = ?
        ");
        $stmt->bind_param("i", $taskId);
        $ok = $stmt->execute();
        $stmt->close();
        return $ok;
    }

    public function getAccommodationsStatus() {
        $today = date('Y-m-d');
        $stmt = $this->conn->prepare("
            SELECT
                a.id,
                a.codigo_unidad,
                a.tipo_alojamiento,
                a.capacidad_personas,
                a.tarifa_base_diaria,
                a.estado_operativo,
                a.observacion_operativa,
                r.id AS active_reservation_id,
                r.fecha_salida AS active_checkout,
                g.nombre AS guest_nombre,
                g.apellido AS guest_apellido
            FROM accommodations a
            LEFT JOIN reservations r
                ON r.accommodation_id = a.id
               AND r.fecha_ingreso <= ?
               AND r.fecha_salida > ?
               AND r.estado_reserva IN ('aprobado', 'pago_en_proceso', 'modificado')
               AND r.estado_estadia <> 'finalizada'
            LEFT JOIN guests g
                ON g.id = r.guest_id
            ORDER BY a.tipo_alojamiento ASC, a.codigo_unidad ASC
        ");
        $stmt->bind_param("ss", $today, $today);
        $stmt->execute();
        $res = $stmt->get_result();

        $units = [];
        while ($row = $res->fetch_assoc()) {
            $status = 'Disponible';
            $guest = null;
            $checkout = null;
            $note = $row['observacion_operativa'] ?: 'Lista para recibir huéspedes';

            if (in_array($row['estado_operativo'], ['mantenimiento', 'fuera_de_servicio'], true)) {
                $status = 'Mantenimiento';
                $note = $row['observacion_operativa'] ?: 'En revisión / mantenimiento';
            } elseif (!empty($row['active_reservation_id'])) {
                $status = 'Ocupada';
                $guest = trim(($row['guest_nombre'] ?? '') . ' ' . ($row['guest_apellido'] ?? '')) ?: 'Huésped asignado';
                $checkout = !empty($row['active_checkout'])
                    ? 'Check-out ' . date('d/m', strtotime($row['active_checkout']))
                    : 'Estadía en curso';
            }

            $tipoLabel = str_replace('_', ' ', $row['tipo_alojamiento']);
            $units[] = [
                "id" => (int)$row['id'],
                "name" => $row['codigo_unidad'],
                "subtitle" => ucfirst($tipoLabel) . ' · Cap. ' . (int)$row['capacidad_personas'],
                "status" => $status,
                "guest" => $guest,
                "checkout" => $checkout,
                "note" => $note,
            ];
        }
        $stmt->close();

        return $units;
    }

    public function updateAccommodationOperationalStatus($accommodationId, $newStatus, $note = null) {
        $accommodationId = (int)$accommodationId;

        if ($newStatus === 'Mantenimiento') {
            $dbStatus = 'mantenimiento';
            $dbNote = $note ?: 'En revisión / mantenimiento';
        } else {
            $dbStatus = 'disponible';
            $dbNote = $note ?: 'Lista para recibir huéspedes';
        }

        $stmt = $this->conn->prepare("
            UPDATE accommodations
            SET estado_operativo = ?,
                observacion_operativa = ?
            WHERE id = ?
        ");
        $stmt->bind_param("ssi", $dbStatus, $dbNote, $accommodationId);
        $ok = $stmt->execute();
        $stmt->close();
        return $ok;
    }

    public function getPendingPayments() {
        $today = date('Y-m-d');
        $query = "
            SELECT
                r.id,
                r.codigo_privado,
                r.fecha_ingreso,
                r.fecha_salida,
                r.cantidad_personas,
                r.estado_reserva,
                r.estado_estadia,
                g.nombre AS guest_nombre,
                g.apellido AS guest_apellido,
                a.codigo_unidad,
                a.tarifa_base_diaria,
                COALESCE((
                    SELECT SUM(ra.subtotal)
                    FROM reservation_addons ra
                    WHERE ra.reservation_id = r.id
                ), 0) AS total_addons,
                COALESCE((
                    SELECT SUM(p.monto)
                    FROM payments p
                    WHERE p.reservation_id = r.id
                      AND p.payment_status = 'aprobado'
                ), 0) AS total_pagado
            FROM reservations r
            JOIN guests g ON r.guest_id = g.id
            JOIN accommodations a ON r.accommodation_id = a.id
            WHERE r.estado_reserva <> 'cancelado'
            ORDER BY r.id DESC
        ";

        $result = $this->conn->query($query);
        if (!$result) {
            return [];
        }

        $pending = [];
        while ($row = $result->fetch_assoc()) {
            $noches = (strtotime($row['fecha_salida']) - strtotime($row['fecha_ingreso'])) / 86400;
            $noches = $noches > 0 ? $noches : 1;

            $montoTotal = ((float)$row['tarifa_base_diaria'] * $noches) + (float)$row['total_addons'];
            $saldoPendiente = max(0, round($montoTotal - (float)$row['total_pagado'], 2));

            if ($saldoPendiente <= 0) {
                continue;
            }

            $fullName = trim(($row['guest_nombre'] ?? '') . ' ' . ($row['guest_apellido'] ?? ''));
            $parts = preg_split('/\s+/', $fullName);
            $initials = count($parts) >= 2
                ? strtoupper(substr($parts[0], 0, 1) . substr($parts[1], 0, 1))
                : strtoupper(substr($fullName ?: 'CB', 0, 2));

            $categories = ['todos'];
            if ($row['fecha_ingreso'] === $today && ($row['estado_estadia'] ?? 'programada') === 'programada') {
                $categories[] = 'llegadas';
            }
            if ($row['fecha_salida'] === $today && ($row['estado_estadia'] ?? '') !== 'finalizada') {
                $categories[] = 'salidas';
            }
            if (($row['estado_estadia'] ?? '') === 'alojado') {
                $categories[] = 'alojados';
            }

            $pending[] = [
                "id" => (int)$row['id'],
                "initials" => $initials,
                "guest" => $fullName,
                "code" => '#' . $row['codigo_privado'],
                "guestsCount" => (int)$row['cantidad_personas'],
                "stay" => $row['codigo_unidad'],
                "dates" => date('d/m', strtotime($row['fecha_ingreso'])) . ' → ' . date('d/m', strtotime($row['fecha_salida'])),
                "categories" => $categories,
                "balance" => $saldoPendiente,
                "paid" => false,
            ];
        }

        return $pending;
    }

    public function collectReservationPayment($reservationId, $monto = null, $metodoPago = 'efectivo') {
        $reservationId = (int)$reservationId;

        $stmt = $this->conn->prepare("
            SELECT
                r.id,
                r.fecha_ingreso,
                r.fecha_salida,
                a.tarifa_base_diaria,
                COALESCE((SELECT SUM(ra.subtotal) FROM reservation_addons ra WHERE ra.reservation_id = r.id), 0) AS total_addons,
                COALESCE((SELECT SUM(p.monto) FROM payments p WHERE p.reservation_id = r.id AND p.payment_status = 'aprobado'), 0) AS total_pagado
            FROM reservations r
            JOIN accommodations a ON r.accommodation_id = a.id
            WHERE r.id = ?
        ");
        $stmt->bind_param("i", $reservationId);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$row) {
            return false;
        }

        $noches = (strtotime($row['fecha_salida']) - strtotime($row['fecha_ingreso'])) / 86400;
        $noches = $noches > 0 ? $noches : 1;
        $montoTotal = ((float)$row['tarifa_base_diaria'] * $noches) + (float)$row['total_addons'];
        $saldoActual = max(0, round($montoTotal - (float)$row['total_pagado'], 2));

        $aCobrar = ($monto !== null && (float)$monto > 0) ? min((float)$monto, $saldoActual) : $saldoActual;
        if ($aCobrar <= 0) {
            return true;
        }

        $allowedMethods = ['mercadopago', 'efectivo', 'transferencia', 'tarjeta'];
        $metodo = in_array($metodoPago, $allowedMethods, true) ? $metodoPago : 'efectivo';

        $stmtPay = $this->conn->prepare("
            INSERT INTO payments (reservation_id, monto, tipo_pago, metodo_pago, payment_status, pagado_at)
            VALUES (?, ?, 'inicial', ?, 'aprobado', NOW())
        ");
        $stmtPay->bind_param("ids", $reservationId, $aCobrar, $metodo);
        $ok = $stmtPay->execute();
        $stmtPay->close();

        if (!$ok) {
            return false;
        }

        $nuevoPagado = (float)$row['total_pagado'] + $aCobrar;
        if ($nuevoPagado >= $montoTotal - 0.01) {
            $stmtRes = $this->conn->prepare("
                UPDATE reservations
                SET estado_reserva = 'aprobado'
                WHERE id = ?
            ");
            $stmtRes->bind_param("i", $reservationId);
            $stmtRes->execute();
            $stmtRes->close();
        }

        return true;
    }

    public function getAllReservations() {
        $today = date('Y-m-d');
        $query = "SELECT r.*, 
                         g.nombre as guest_nombre, g.apellido as guest_apellido, g.dni as guest_dni, g.telefono as guest_telefono,
                         a.codigo_unidad, a.tipo_alojamiento 
                  FROM reservations r 
                  JOIN guests g ON r.guest_id = g.id 
                  JOIN accommodations a ON r.accommodation_id = a.id 
                  ORDER BY r.id DESC";
        
        $result = $this->conn->query($query);
        if (!$result) {
            return [];
        }

        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $fullName = trim(($row['guest_nombre'] ?? '') . ' ' . ($row['guest_apellido'] ?? ''));
            $parts = preg_split('/\s+/', $fullName);
            $initials = count($parts) >= 2
                ? strtoupper(substr($parts[0], 0, 1) . substr($parts[1], 0, 1))
                : strtoupper(substr($fullName ?: 'RS', 0, 2));

            $estadoEstadia = $row['estado_estadia'] ?? 'programada';
            $estadoReserva = $row['estado_reserva'] ?? 'pendiente_pago';

            $categories = ['todos'];
            if ($estadoReserva !== 'cancelado') {
                if (($row['fecha_ingreso'] ?? '') === $today && $estadoEstadia === 'programada') {
                    $categories[] = 'llegadas';
                }
                if (($row['fecha_salida'] ?? '') === $today && $estadoEstadia !== 'finalizada') {
                    $categories[] = 'salidas';
                }
                if ($estadoEstadia === 'alojado') {
                    $categories[] = 'alojados';
                }
            }

            $statusLabel = 'Confirmada';
            $statusType = 'confirmed';
            $action = 'checkin';

            if ($estadoReserva === 'cancelado') {
                $statusLabel = 'Cancelada';
                $statusType = 'done';
                $action = 'done';
            } elseif ($estadoEstadia === 'alojado') {
                $statusLabel = 'Alojada';
                $statusType = 'hosted';
                $action = 'checkout';
            } elseif ($estadoEstadia === 'finalizada') {
                $statusLabel = 'Finalizada';
                $statusType = 'done';
                $action = 'done';
            } elseif ($estadoReserva === 'pendiente_pago' || $estadoReserva === 'pago_en_proceso') {
                $statusLabel = 'Pendiente pago';
                $statusType = 'confirmed';
            }

            $cantPersonas = (int)($row['cantidad_personas'] ?? 1);
            $unitLabel = ($row['codigo_unidad'] ?? '') . ' · ' . str_replace('_', ' ', $row['tipo_alojamiento'] ?? '');
            $dateRange = date('d/m', strtotime($row['fecha_ingreso'])) . ' → ' . date('d/m', strtotime($row['fecha_salida']));

            $row['id'] = (int)$row['id'];
            $row['initials'] = $initials;
            $row['guest'] = $fullName;
            $row['code'] = '#' . ($row['codigo_privado'] ?? '') . ' · ' . $cantPersonas . ($cantPersonas === 1 ? ' huésped' : ' huéspedes');
            $row['stay'] = $unitLabel;
            $row['dates'] = $dateRange;
            $row['categories'] = $categories;
            $row['status'] = $statusLabel;
            $row['statusType'] = $statusType;
            $row['action'] = $action;

            $rows[] = $row;
        }

        return $rows;
    }

    public function updateReservationStatus($reservationId, $nuevoEstado) {
        $query = "UPDATE reservations SET estado_reserva = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("si", $nuevoEstado, $reservationId);
        return $stmt->execute();
    }
}