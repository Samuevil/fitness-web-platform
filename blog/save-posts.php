<?php
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$AUTH_PASS = 'shape2026';
$LOG_FILE = __DIR__ . '/log.txt';
$POSTS_FILE = __DIR__ . '/posts-data.json';

function write_log($message) {
    global $LOG_FILE;
    @file_put_contents($LOG_FILE, date('Y-m-d H:i:s') . ' - ' . $message . PHP_EOL, FILE_APPEND);
}

function respond($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function normalize_utf8($value) {
    if (is_array($value)) {
        foreach ($value as $key => $item) {
            $value[$key] = normalize_utf8($item);
        }
        return $value;
    }

    if (!is_string($value)) {
        return $value;
    }

    if (mb_check_encoding($value, 'UTF-8')) {
        return $value;
    }

    $converted = @mb_convert_encoding($value, 'UTF-8', 'UTF-8, ISO-8859-1, Windows-1252');
    if ($converted !== false) {
        return $converted;
    }

    return iconv('UTF-8', 'UTF-8//IGNORE', $value);
}

write_log('Requisicao recebida');

$input = file_get_contents('php://input');
if ($input === false || trim($input) === '') {
    write_log('Corpo vazio');
    respond(['success' => false, 'error' => 'Requisição vazia.'], 400);
}

$data = json_decode($input, true);
if (!is_array($data)) {
    write_log('JSON invalido: ' . json_last_error_msg());
    respond(['success' => false, 'error' => 'JSON inválido enviado ao servidor.'], 400);
}

if (!isset($data['auth']) || $data['auth'] !== $AUTH_PASS) {
    write_log('Acesso nao autorizado');
    respond(['success' => false, 'error' => 'Acesso não autorizado.'], 403);
}

if (!isset($data['posts']) || !is_array($data['posts'])) {
    write_log('Estrutura de posts invalida');
    respond(['success' => false, 'error' => 'Dados de posts inválidos.'], 400);
}

$payload = [
    'posts' => normalize_utf8($data['posts'])
];

$json = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
if ($json === false) {
    write_log('Falha no json_encode: ' . json_last_error_msg());
    respond(['success' => false, 'error' => 'Falha ao preparar os dados para salvar.'], 500);
}

$saved = @file_put_contents($POSTS_FILE, $json);
if ($saved === false) {
    write_log('Falha ao escrever posts-data.json');
    respond(['success' => false, 'error' => 'Erro ao salvar. Verifique permissões do arquivo.'], 500);
}

write_log('Posts salvos com sucesso: ' . count($payload['posts']));
respond([
    'success' => true,
    'message' => 'Posts salvos com sucesso.',
    'count' => count($payload['posts'])
]);
?>
