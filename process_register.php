<?php
// process_register.php - the ONE API endpoint for USWAG
//   action "register"   -> create a Buyer or Seller account
//   action "login"      -> get a fresh session token
//   action "sync_sales" -> save the offline sales queue (Sellers only)

// ---------- CORS (must run before anything else) ----------
$origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ($origin === 'https://blumabas902pbox-dev.github.io')
        || preg_match('#^http://(localhost|127\.0\.0\.1)(:\d+)?$#', $origin);
if ($allowed) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=utf-8');

function respond(int $code, array $body): void {
    http_response_code($code);
    echo json_encode($body);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { respond(405, ['error' => 'POST only.']); }

$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) { respond(400, ['error' => 'Invalid JSON.']); }

require_once __DIR__ . '/db.php';

switch ($in['action'] ?? '') {
    case 'register':   register($pdo, $in);   break;
    case 'login':      login($pdo, $in);      break;