<?php
require_once 'Database.php';

class Review {
    private $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    // レビューの報告
    public function add($subject, $user, $difficulty, $reportRate, $testRate, $allowed, $comment) {
        if (($reportRate + $testRate) !== 100) {
            return ['success' => false, 'message' => '配点割合の合計（レポート+試験）を100%にしてください。'];
        }

        $stmt = $this->db->prepare("INSERT INTO reviews (subject, user, difficulty, report_rate, test_rate, allowed, comment) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([trim($subject), $user, $difficulty, $reportRate, $testRate, $allowed, trim($comment)]);
        return ['success' => true, 'message' => 'レビューを報告しました！'];
    }

    // 科目ごとのレビュー件数を集計して取得
    public function getSubjectsSummary() {
        $stmt = $this->db->query("SELECT subject, COUNT(*) as count FROM reviews GROUP BY subject ORDER BY subject ASC");
        return $stmt->fetchAll();
    }

    // 特定の科目のレビューをすべて取得
    public function getBySubject($subject) {
        $stmt = $this->db->prepare("SELECT * FROM reviews WHERE subject = ? ORDER BY created_at DESC");
        $stmt->execute([$subject]);
        return $stmt->fetchAll();
    }
}