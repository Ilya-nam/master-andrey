<?php

if ($_SERVER['HTTP_X_REQUESTED_WITH'] !== 'XMLHttpRequest') {
    http_response_code(403);
    exit('Access denied');
}

header('Content-Type: application/json');

require_once __DIR__ . '/../../config.php';

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data || !isset($data['phones']) || !isset($data['name'])) {
    echo json_encode([
        'result' => false,
        'message' => 'Некорректные данные'
    ]);
    exit;
}

$apiUrl = NEWAPI_URL; 

$ch = curl_init($apiUrl);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if (($httpCode === 204 || $httpCode === 202) && $response !== false) {
    echo json_encode([
        'result' => true,
        'status_code' => $httpCode,
        'message' => $httpCode === 204 ? 'Заявка принята' : 'Заявка уже была отправлена ранее',
    ]);
} else {
    echo json_encode([
        'result' => false,
        'message' => $error ?: 'Ошибка при обращении к API',
        'http_code' => $httpCode,
        'response' => $response,
    ]);
}
