<?php
require_once 'Database.php';

class User {
    private $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    // アカウント新規登録
    public function register($studentId, $grade) {
        $studentId = strtoupper(trim($studentId));
        if (empty($studentId) || empty($grade)) {
            return ['success' => false, 'message' => '学籍番号と学年を入力してください。'];
        }
        if (strpos($studentId, 'J') !== 0) {
            return ['success' => false, 'message' => '学籍番号は J から始めて入力してください。'];
        }

        // 重複チェック
        $stmt = $this->db->prepare("SELECT * FROM users WHERE student_id = ?");
        $stmt->execute([$studentId]);
        if ($stmt->fetch()) {
            return ['success' => false, 'message' => 'この学籍番号は既に登録されています。'];
        }

        // 登録実行
        $stmt = $this->db->prepare("INSERT INTO users (student_id, grade) VALUES (?, ?)");
        $stmt->execute([$studentId, $grade]);
        return ['success' => true, 'message' => 'アカウント登録が完了しました！'];
    }

    // ログイン処理
    public function login($studentId, $grade) {
        $studentId = strtoupper(trim($studentId));
        $stmt = $this->db->prepare("SELECT * FROM users WHERE student_id = ? AND grade = ?");
        $stmt->execute([$studentId, $grade]);
        $user = $stmt->fetch();

        if ($user) {
            if (session_status() == PHP_SESSION_NONE) { session_start(); }
            $_SESSION['student_id'] = $user['student_id'];
            $_SESSION['grade'] = $user['grade'];
            return ['success' => true, 'message' => 'ログインに成功しました。'];
        } else {
            return ['success' => false, 'message' => '学籍番号または学年が間違っているか、登録されていません。'];
        }
    }

    // ログイン状態チェック
    public static function isLoggedIn() {
        if (session_status() == PHP_SESSION_NONE) { session_start(); }
        return isset($_SESSION['student_id']);
    }

    // ログアウト処理
    public static function logout() {
        if (session_status() == PHP_SESSION_NONE) { session_start(); }
        $_SESSION = array();
        session_destroy();
    }
}