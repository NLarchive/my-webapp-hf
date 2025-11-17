<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$response = [
    'message' => 'PHP is working correctly! ✓',
    'timestamp' => date('Y-m-d H:i:s'),
    'random' => rand(1, 1000),
    'php_version' => phpversion(),
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
];

echo json_encode($response);
?>
