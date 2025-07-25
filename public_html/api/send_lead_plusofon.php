<?php

header('Content-Type: application/json');

require_once __DIR__ . '/../../config.php';

// Путь к лог-файлу
$logFile = __DIR__ . '/../../calls_log.txt';

// Получаем данные из тела запроса
$rawInput = file_get_contents('php://input');
parse_str($rawInput, $data);

// Проверка обязательных полей
if (!isset($data['from'], $data['to'], $data['duration'], $data['hook_event'])) {
    echo json_encode(['result' => false, 'message' => 'Отсутствуют обязательные поля']);
    exit;
}

if ($data['hook_event'] !== 'channel_destroy') {
    echo json_encode(['result' => true, 'message' => 'Событие не для обработки']);
    exit;
}

// Функция оставляет только цифры
function digitsOnly($phone) {
    return preg_replace('/\D/', '', $phone);
}

// Проверка номера
$targetNumberLast10 = '9010782932';
$toNumberLast10 = mb_substr(digitsOnly($data['to']), -10);

if ($toNumberLast10 !== $targetNumberLast10) {
    echo json_encode(['result' => false, 'message' => 'Номер не совпадает']);
    exit;
}

// Проверка длительности
$duration = (int)$data['duration'];
if ($duration >= 50) {
    echo json_encode(['result' => false, 'message' => 'Звонок слишком длинный']);
    exit;
}

// Нормализация номера
$fromDigits = digitsOnly($data['from']);
$fromLast10 = mb_substr($fromDigits, -10);
$customerPhone = '+7' . $fromLast10;

// === Проверка и очистка лога ===

$now = time();
$canSend = true;
$newLog = [];

if (file_exists($logFile)) {
    $logLines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($logLines as $line) {
        [$loggedPhone, $timestamp] = explode('|', $line);
        $timestamp = (int)$timestamp;

        // Если запись моложе 15 минут — оставляем в логе
        if (($now - $timestamp) < 900) {
            $newLog[] = $line;

            // Проверка на повтор
            if ($loggedPhone === $customerPhone) {
                $canSend = false;
            }
        }
    }

    // Перезаписываем лог-файл только с актуальными записями
    file_put_contents($logFile, implode("\n", $newLog) . "\n");
}

if (!$canSend) {
    echo json_encode(['result' => false, 'message' => 'Звонок уже был недавно']);
    exit;
}

// === Отправка лида ===

$leadData = [
    'customer_phone' => $customerPhone,
    'customer_name' => 'Клиент',
    'city_id' => 39,
    'description' => "Пропущенный звонок только что\nМастер Андрей Валерьевич\nОтправлено автоматически!",
    'source_id' => 818,
];

$apiUrl = 'https://kp-lead-centre.ru/api/customer-request/create';
$authHeader = 'Authorization: Basic ' . base64_encode(API_LOGIN . ':' . API_PASSWORD);

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($leadData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [$authHeader, 'Content-Type: application/json']);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Если успешно — добавляем звонок в лог
if ($httpCode === 200 && $response) {
    file_put_contents($logFile, "{$customerPhone}|{$now}\n", FILE_APPEND);
    echo $response;
} else {
    echo json_encode([
        'result' => false,
        'message' => $error ?: 'Ошибка при обращении к API'
    ]);
}
