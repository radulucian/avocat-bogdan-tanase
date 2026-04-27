<?php
declare(strict_types=1);

/*
 * Contact form mail handler for avocatbogdantanase.ro
 *
 * Receives a POST from the contact form, validates the input, then sends
 * the message via the server's local mail transport (PHP mail()).
 *
 * Configuration: edit the constants below before deploying.
 */

// ----- Configuration -----------------------------------------------------

// Where the form messages are delivered.
const MAIL_TO = 'lucianradu.work@gmail.com';

// Visible "From" address shown in the recipient's inbox.
// IMPORTANT: this MUST be an address on the same domain as the server,
// otherwise most mail providers (Gmail, Outlook, etc.) will reject the
// message as spoofed. For production, use noreply@avocatbogdantanase.ro.
const MAIL_FROM_ADDRESS = 'noreply@avocatbogdantanase.ro';
const MAIL_FROM_NAME    = 'Site avocatbogdantanase.ro';

// Subject of the email you receive.
const MAIL_SUBJECT = 'Solicitare noua de pe avocatbogdantanase.ro';

// Allowed origins for CORS. Leave empty to disable CORS handling
// (recommended when send.php and the form are on the same domain).
const ALLOWED_ORIGINS = [];

// -------------------------------------------------------------------------

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond(int $status, array $payload): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function clean_header_value(string $v): string {
    return trim(preg_replace('/[\r\n]+/', ' ', $v) ?? '');
}

if (!empty(ALLOWED_ORIGINS)) {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin && in_array($origin, ALLOWED_ORIGINS, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Accept');
    }
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        respond(204, []);
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['success' => false, 'message' => 'Metoda nepermisa.']);
}

if (!empty($_POST['website'] ?? '')) {
    respond(200, ['success' => true]);
}

$nume    = trim((string)($_POST['nume']    ?? ''));
$telefon = trim((string)($_POST['telefon'] ?? ''));
$email   = trim((string)($_POST['email']   ?? ''));
$mesaj   = trim((string)($_POST['mesaj']   ?? ''));
$consimt = !empty($_POST['consimtamant'] ?? '');

$errors = [];
if (mb_strlen($nume) < 2) {
    $errors[] = 'Numele este obligatoriu.';
}
if (!preg_match('/^[0-9 +().\-]{6,}$/u', $telefon)) {
    $errors[] = 'Telefonul este invalid.';
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Adresa de email este invalida.';
}
if (mb_strlen($mesaj) < 10) {
    $errors[] = 'Mesajul este prea scurt.';
}
if (!$consimt) {
    $errors[] = 'Lipseste consimtamantul pentru prelucrarea datelor.';
}

if (mb_strlen($nume) > 200 || mb_strlen($telefon) > 50 || mb_strlen($email) > 200 || mb_strlen($mesaj) > 5000) {
    $errors[] = 'Datele transmise depasesc lungimea permisa.';
}

if ($errors) {
    respond(422, ['success' => false, 'message' => implode(' ', $errors)]);
}

$ip   = $_SERVER['REMOTE_ADDR']     ?? 'necunoscut';
$ua   = $_SERVER['HTTP_USER_AGENT'] ?? 'necunoscut';
$when = date('Y-m-d H:i:s');

$bodyLines = [
    'Solicitare noua trimisa prin formularul de contact.',
    '',
    'Nume:    ' . $nume,
    'Telefon: ' . $telefon,
];
if ($email !== '') {
    $bodyLines[] = 'Email:   ' . $email;
}
$bodyLines[] = '';
$bodyLines[] = 'Mesaj:';
$bodyLines[] = $mesaj;
$bodyLines[] = '';
$bodyLines[] = str_repeat('-', 40);
$bodyLines[] = 'Consimtamant prelucrare date: DA';
$bodyLines[] = 'Data:    ' . $when;
$bodyLines[] = 'IP:      ' . $ip;
$bodyLines[] = 'Browser: ' . substr($ua, 0, 200);

$body = implode("\r\n", $bodyLines);

$fromAddress = clean_header_value(MAIL_FROM_ADDRESS);
$fromName    = clean_header_value(MAIL_FROM_NAME);
$replyTo     = $email !== '' ? clean_header_value($email) : $fromAddress;

$headers = [
    'From: ' . sprintf('%s <%s>', $fromName, $fromAddress),
    'Reply-To: ' . $replyTo,
    'X-Mailer: avocatbogdantanase.ro contact form',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
];

$encodedSubject = '=?UTF-8?B?' . base64_encode(MAIL_SUBJECT) . '?=';
$envelopeFrom   = '-f' . $fromAddress;

$ok = @mail(
    MAIL_TO,
    $encodedSubject,
    $body,
    implode("\r\n", $headers),
    $envelopeFrom
);

if (!$ok) {
    error_log('[contact-form] mail() failed for submission from ' . $ip);
    respond(500, [
        'success' => false,
        'message' => 'Mesajul nu a putut fi trimis. Va rog incercati din nou sau sunati direct.'
    ]);
}

respond(200, ['success' => true]);
