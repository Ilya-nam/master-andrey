<?php

if ($_SERVER['HTTP_X_REQUESTED_WITH'] !== 'XMLHttpRequest') {
    http_response_code(403);
    exit('Access denied');
}

header('Content-Type: application/json');

require_once __DIR__ . '/../../config.php'; 

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!isset($data['message']) || empty($data['message'])) {
    echo json_encode(['result' => false, 'message' => 'Нет сообщения']);
    exit;
}

$token = TELEGRAM_BOT_TOKEN;    
$chatId = TELEGRAM_CHAT_ID;     
$message = $data['message'];

$url = "https://api.telegram.org/bot{$token}/sendMessage";

$postFields = [
    'chat_id' => $chatId,
    'text' => $message,
    'parse_mode' => 'HTML',
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postFields));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo json_encode(['result' => true]);
} else {
    echo json_encode(['result' => false, 'message' => 'Ошибка отправки в Telegram']);
}
