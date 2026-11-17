<?php
// backend/utils/Mailer.php

class Mailer {

    // Enviar código privado cuando se crea la solicitud de reserva
    public static function sendPrivateCode($toEmail, $nombre, $codigoPrivado, $fechaIngreso, $fechaSalida) {
        $subject = "Tu Solicitud de Reserva - Camping Manager";
        
        $message = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
                .code-box { background: #e8f5e9; border: 2px dashed #2e7d32; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; color: #1b5e20; margin: 20px 0; border-radius: 6px; }
                .footer { font-size: 12px; color: #777; text-align: center; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <h2>¡Hola, {$nombre}!</h2>
                <p>Hemos recibido correctamente tu solicitud de reserva en <strong>Camping & Cabañas Solares</strong> para las fechas del <strong>{$fechaIngreso}</strong> al <strong>{$fechaSalida}</strong>.</p>
                <p>Tu código privado para consultar el estado y realizar el pago online es:</p>
                
                <div class='code-box'>
                    {$codigoPrivado}
                </div>

                <p>Recuerda que tu solicitud tiene una vigencia inicial de 24 horas para ser abonada y asegurar tu lugar.</p>
                
                <div class='footer'>
                    <p>Camping Manager — Sistema de Gestión</p>
                </div>
            </div>
        </body>
        </html>
        ";

        // Cabeceras obligatorias para correos en formato HTML
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: no-reply@campingmanager.com" . "\r\n";

        // Enviamos el correo (sin la arroba para detectar si PHP rechaza la conexión SMTP)
        // El 5to parámetro "-f..." fuerza al sistema de Windows a rutear correctamente el remitente hacia Mailpit
        $mailEnviado = mail($toEmail, $subject, $message, $headers, "-fno-reply@campingmanager.com");

        if (!$mailEnviado) {
            error_log("Fallo al enviar correo mediante mail()");
        }
    }
}