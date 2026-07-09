<?php
class Database {
    private static $pdo = null;

    public static function getConnection() {
        if (self::$pdo === null) {
            try {
                // 同じフォルダ内にデータベースファイルを作成
                self::$pdo = new PDO('sqlite:' . __DIR__ . '/database.sqlite');
                self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                self::initializeTables();
            } catch (PDOException $e) {
                die("データベース接続失敗: " . $e->getMessage());
            }
        }
        return self::$pdo;
    }

    private static function initializeTables() {
        // users テーブルの作成 (学籍番号が主キー)
        self::$pdo->exec("CREATE TABLE IF NOT EXISTS users (
            student_id TEXT PRIMARY KEY,
            grade INTEGER NOT NULL
        )");

        // reviews テーブルの作成
        self::$pdo->exec("CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT NOT NULL,
            user TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            report_rate INTEGER NOT NULL,
            test_rate INTEGER NOT NULL,
            allowed TEXT NOT NULL,
            comment TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");
    }
}