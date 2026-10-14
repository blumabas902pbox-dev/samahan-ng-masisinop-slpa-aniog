<?php
// Send SMS via Semaphore API
$ch = curl_init();
$parameters = array(
    'apikey' => 'YOUR_SEMAPHORE_API_KEY', // Registered Semaphore API Key
    'number' => $_POST['contact_number'],  // e.g., 09071128654
    'message' => "Thank you for your inquiry! Your message was sent to Samahan ng Masisinop SLPA Officer. We'll get in touch soon.",
    'sendername' => 'SEMAPHORE' // Registered Brand Name
);

curl_setopt($ch, CURLOPT_URL, 'https://api.semaphore.co/api/v4/messages');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($parameters));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$output = curl_exec($ch);
curl_close($ch);
?>