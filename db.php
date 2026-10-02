<?php
// db.php - Database connection for USWAG (works on any PHP + MySQL host, no WAMP needed)
// Real credentials live in config.php, which is NOT committed to GitHub.
$cfg = require __DIR__ . '/config.php';

$dsn = "mysql:host={$cfg['host']};dbname={$cfg['db']};charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], $options);
} catch (PDOException $e) {
    error_log('USWAG DB connection failed: ' . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database connection failed.']);
    exit;
}