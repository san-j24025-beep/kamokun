<?php
require_once 'User.php';
require_once 'Review.php';

if (!User::isLoggedIn()) {
    header('Location: login.php');
    exit;
}

$reviewClass = new Review();
$subjectsSummary = $reviewClass->getSubjectsSummary();

$selectedSubject = $_GET['subject'] ?? '';
$subjectReviews = [];
if (!empty($selectedSubject)) {
    $subjectReviews = $reviewClass->getBySubject($selectedSubject);
}

require_once 'header.php';
?>

<h2>レビュー閲覧</h2>

<?php if (empty($selectedSubject)): ?>
    <!-- 1. 科目一覧・検索画面 -->
    <div class="form-group">
        <input type="text" id="search-input" class="form-control" placeholder="科目を検索..." oninput="filterSubjects()">
    </div>
    
    <div class="subject-list">
        <?php if (empty($subjectsSummary)): ?>
            <div class="no-data">まだレビューが報告されていません。</div>
        <?php else: ?>
            <?php foreach ($subjectsSummary as $row): ?>
                <a href="view.php?subject=<?= urlencode($row['subject']) ?>" class="subject-item" data-name="<?= htmlspecialchars($row['subject']) ?>" style="text-decoration: none; color: inherit;">
                    <span class="subject-name"><?= htmlspecialchars($row['subject']) ?></span>
                    <span class="review-count"><?= htmlspecialchars($row['count']) ?> 件</span>
                </a>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>

    <script>
    function filterSubjects() {
        const query = document.getElementById('search-input').value.toLowerCase();
        document.querySelectorAll('.subject-item').forEach(item => {
            const name = item.getAttribute('data-name').toLowerCase();
            item.style.display = name.includes(query) ? 'flex' : 'none';
        });
    }
    </script>

<?php else: ?>
    <!-- 2. 特定科目の口コミ詳細画面 -->
    <div style="margin-bottom: 15px;">
        <a href="view.php" class="btn" style="display:inline-block; width:auto; padding: 8px 15px; font-size:14px; margin:0;">◀ 科目一覧に戻る</a>
    </div>
    
    <h3 style="font-size: 16px; margin-bottom: 15px; color: var(--primary-color);">「<?= htmlspecialchars($selectedSubject) ?>」のレビュー一覧</h3>
    
    <div id="reviews-container">
        <?php if (empty($subjectReviews)): ?>
            <div class="no-data">該当するレビューがありません。</div>
        <?php else: ?>
            <?php foreach ($subjectReviews as $r): ?>
                <?php
                $badgeClass = strpos($r['difficulty'], '楽単') !== false ? 'badge-easy' : (strpos($r['difficulty'], 'エグ単') !== false ? 'badge-hard' : 'badge-normal');
                
                // 🔒 プライバシー保護：学籍番号の下3桁を隠す (例: J25001 -> J25***)
                $maskedUser = $r['user'];
                if (strlen($maskedUser) > 3) {
                    $maskedUser = substr($maskedUser, 0, -3) . '***';
                }
                ?>
                <div class="review-card">
                    <div class="review-header">
                        <span>投稿者: <?= htmlspecialchars($maskedUser) ?></span>
                        <span class="badge <?= $badgeClass ?>"><?= htmlspecialchars($r['difficulty']) ?></span>
                    </div>
                    <div class="review-meta">
                        <strong>配点:</strong> レポート <?= htmlspecialchars($r['report_rate']) ?>% / 試験 <?= htmlspecialchars($r['test_rate']) ?>%<br>
                        <strong>持ち込み:</strong> <?= htmlspecialchars($r['allowed']) ?>
                    </div>
                    <div class="review-comment"><?= nl2br(htmlspecialchars($r['comment'])) ?></div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
<?php endif; ?>

<?php require_once 'footer.php'; ?>