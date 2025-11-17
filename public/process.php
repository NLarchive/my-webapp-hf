<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = isset($_POST['name']) ? htmlspecialchars($_POST['name']) : 'Guest';
    
    $response = [
        'success' => true,
        'greeting' => "Hello, {$name}! Your form was processed by PHP.",
        'timestamp' => date('Y-m-d H:i:s'),
        'name_length' => strlen($name)
    ];
} else {
    $response = [
        'success' => false,
        'error' => 'Only POST requests are accepted'
    ];
}

echo json_encode($response);
?>
