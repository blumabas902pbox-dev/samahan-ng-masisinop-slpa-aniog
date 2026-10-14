<?php
// process_contact.php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

$mail = new PHPMailer(true);

try {
    // Server settings for Gmail SMTP
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'slpa.aniog@gmail.com';
    $mail->Password   = 'YOUR_GMAIL_APP_PASSWORD'; // Generated from Google Account App Passwords
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    // Recipients
    $mail->setFrom('slpa.aniog@gmail.com', 'Samahan ng Masisinop');
    $mail->addAddress($_POST['email'], $_POST['fullName']); // Send confirmation to user
    $mail->addReplyTo('slpa.aniog@gmail.com', 'Samahan ng Masisinop');

    // Content
    $mail->isHTML(true);
    $mail->Subject = 'Inquiry Received - Samahan ng Masisinop';
    $mail->Body    = "Dear " . htmlspecialchars($_POST['fullName']) . ",<br><br>" .
                     "Thank you for your inquiry! Your message was sent to Samahan ng Masisinop SLPA Officer. We'll get in touch soon.<br><br>" .
                     "<i>This is an official system notification. You can reply directly to this email if you have follow-up questions.</i>";

    $mail->send();
    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $mail->ErrorInfo]);
}
?>