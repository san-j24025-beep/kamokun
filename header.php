<?php
require_once 'User.php';
if (session_status() == PHP_SESSION_NONE) { session_start(); }
$isLoggedIn = User::isLoggedIn();
$current_page = basename($_SERVER['PHP_SELF']);
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>単位ナビ - 大学単位取得支援アプリ</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <div class="header">
            <?php if ($isLoggedIn && $current_page !== 'index.php'): ?>
                <a href="index.php" class="btn-back">◀</a>
            <?php endif; ?>
            <h1>単位ナビ</h1>
            <?php if ($isLoggedIn): ?>
                <a href="logout.php" class="btn-logout">ログアウト</a>
            <?php endif; ?>
        </div>
        <div class="content">