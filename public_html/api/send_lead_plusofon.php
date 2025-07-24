<?php

header('Content-Type: application/json');

require_once __DIR__ . '/../../config.php';

// Получаем сырые данные из тела запроса (Plusofon отправляет в формате application/x-www-form-urlencoded)
$rawInput = file_get_contents('php://input');
parse_str($rawInput, $data);

// Проверяем необходимые поля
if (!isset($data['from'], $data['to'], $data['duration'], $data['hook_event'])) {
    echo json_encode([
        'result' => false,
        'message' => 'Отсутствуют обязательные поля'
    ]);
    exit;
}

// Обрабатываем только событие завершения звонка
if ($data['hook_event'] !== 'channel_destroy') {
    echo json_encode(['result' => true, 'message' => 'Событие не для обработки']);
    exit;
}

// Функция для оставления только цифр
function digitsOnly($phone) {
    return preg_replace('/\D/', '', $phone);
}

// Целевой номер — последние 10 цифр
$targetNumberLast10 = '9010782932';

// Получаем последние 10 цифр поля to
$toNumberDigits = digitsOnly($data['to']);
$toNumberLast10 = mb_substr($toNumberDigits, -10);

// Проверяем номер
if ($toNumberLast10 !== $targetNumberLast10) {
    echo json_encode([
        'result' => false,
        'message' => 'Номер не совпадает с нужным (по последним 10 цифрам)'
    ]);
    exit;
}

// Проверяем длительность звонка
$duration = (int)$data['duration'];
if ($duration >= 50) {
    echo json_encode([
        'result' => false,
        'message' => 'Длительность звонка больше или равна 50 секунд'
    ]);
    exit;
}

// Формируем номер звонящего с +7 и последние 10 цифр
$fromNumberDigits = digitsOnly($data['from']);
$fromNumberLast10 = mb_substr($fromNumberDigits, -10);
$customerPhone = '+7' . $fromNumberLast10;

// Формируем данные для отправки лида
$leadData = [
    'customer_phone' => $customerPhone,
    'customer_name' => 'КЛ',
    'city_id' => 39,
    'description' => 'Пропущенный, Мастер Андрей Валерьевич',
    'call_duration' => $duration,
    'source' => 'plusofon_webhook'
];

// URL и авторизация
$apiUrl = 'https://kp-lead-centre.ru/api/customer-request/create';

// Авторизация из конфига
$authHeader = 'Authorization: Basic ' . base64_encode(API_LOGIN . ':' . API_PASSWORD);

$ch = curl_init($apiUrl);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($leadData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    $authHeader,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($httpCode === 200 && $response) {
    echo $response;
} else {
    echo json_encode([
        'result' => false,
        'message' => $error ?: 'Ошибка при обращении к API'
    ]);
}
