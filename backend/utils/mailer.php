<?php
// backend/utils/Mailer.php

class Mailer {

    // Enviar código privado y enlace directo cuando se crea la solicitud de reserva
    public static function sendPrivateCode($toEmail, $nombre, $codigoPrivado, $fechaIngreso, $fechaSalida) {
        $subject = "Tu Solicitud de Reserva - Tierra Adentro";
        
        // Definimos la URL base de tu frontend en desarrollo (ajustar si cambia el puerto)
        $frontendUrl = "http://localhost:5173";
        $portalLink = $frontendUrl . "/portal/" . urlencode($codigoPrivado);

        $message = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
                .code-box { background: #e8f5e9; border: 2px dashed #2e7d32; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; color: #1b5e20; margin: 20px 0; border-radius: 6px; }
                .btn { display: inline-block; background-color: #e9b957; color: #18231e; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 30px; margin: 20px 0; }
                .footer { font-size: 12px; color: #777; text-align: center; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <h2>¡Hola, {$nombre}!</h2>
                <p>Hemos recibido correctamente tu solicitud de reserva en <strong>Tierra Adentro</strong> para las fechas del <strong>{$fechaIngreso}</strong> al <strong>{$fechaSalida}</strong>.</p>
                <p>Tu código privado para consultar el estado y realizar el pago online es:</p>
                
                <div class='code-box'>
                    {$codigoPrivado}
                </div>

                <div style='text-align: center;'>
                    <a href='{$portalLink}' class='btn'>Acceder al Portal del Huésped ↗</a>
                </div>

                <p style='font-size: 13px; color: #555;'>Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br><a href='{$portalLink}' style='color: #3d5b50;'>{$portalLink}</a></p>

                <p>Recuerda que tu solicitud tiene una vigencia inicial de 24 horas para ser abonada y asegurar tu lugar.</p>
                
                <div class='footer'>
                    <p>Tierra Adentro — Camping · Naturaleza · Encuentro</p>
                </div>
            </div>
        </body>
        </html>
        ";

        // Cabeceras obligatorias para correos en formato HTML
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: no-reply@tierraadentro.com" . "\r\n";

        // Enviamos el correo
        $mailEnviado = mail($toEmail, $subject, $message, $headers, "-fno-reply@tierraadentro.com");

        if (!$mailEnviado) {
            error_log("Fallo al enviar correo mediante mail()");
        }
    }
}