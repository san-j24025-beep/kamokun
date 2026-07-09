<?php
require_once 'User.php';

if (User::isLoggedIn()) {
    header('Location: index.php');
    exit;
}

$error = '';
$success = '';
$mode = $_POST['mode'] ?? 'login'; // 'login' または 'register'

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userClass = new User();
    $studentId = $_POST['student_id'] ?? '';
    $grade = $_POST['grade'] ?? '';

    if ($mode === 'register') {
        $res = $userClass->register($studentId, $grade);
        if ($res['success']) {
            $success = $res['message'] . ' ログインしてください。';
            $mode = 'login'; 
        } else { $error = $res['message']; }
    } else {
        $res = $userClass->login($studentId, $grade);
        if ($res['success']) {
            header('Location: index.php');
            exit;
        } else { $error = $res['message']; }
    }
}

require_once 'header.php';
?>

<h2 id="auth-title"><?= $mode === 'register' ? '新規アカウント登録' : 'ログイン' ?></h2>

<?php if ($error): ?><div class="alert alert-danger"><?= htmlspecialchars($error) ?></div><?php endif; ?>
<?php if ($success): ?><div class="alert alert-success"><?= htmlspecialchars($success) ?></div><?php endif; ?>

<form action="login.php" method="POST" id="auth-form">
    <input type="hidden" name="mode" id="auth-mode" value="<?= htmlspecialchars($mode) ?>">
    
    <div class="form-group">
        <label for="student_id">学籍番号</label>
        <input type="text" name="student_id" id="student_id" class="form-control" placeholder="J25001" maxlength="10" style="text-transform: uppercase;" value="<?= htmlspecialchars($_POST['student_id'] ?? '') ?>" required>
    </div>
    <div class="form-group">
        <label for="grade">学年</label>
        <select name="grade" id="grade" class="form-control" required>
            <option value="">選択してください</option>
            <?php for($i=1; $i<=4; $i++): ?>
                <option value="<?= $i ?>" <?= (isset($_POST['grade']) && $_POST['grade'] == $i) ? 'selected' : '' ?>><?= $i ?>年</option>
            <?php endfor; ?>
        </select>
    </div>
    <button type="submit" class="btn"><?= $mode === 'register' ? '新規登録してログイン' : 'ログイン' ?></button>
</form>

<div class="btn-toggle-auth" onclick="toggleMode()">
    <?= $mode === 'register' ? '既にアカウントをお持ちの方はこちら' : '新規アカウント登録はこちら' ?>
</div>

<script>
function toggleMode() {
    const modeInput = document.getElementById('auth-mode');
    const title = document.getElementById('auth-title');
    const btn = document.querySelector('#auth-form .btn');
    const toggleDiv = document.querySelector('.btn-toggle-auth');
    
    if (modeInput.value === 'login') {
        modeInput.value = 'register';
        title.textContent = '新規アカウント登録';
        btn.textContent = '新規登録してログイン';
        toggleDiv.textContent = '既にアカウントをお持ちの方はこちら';
    } else {
        modeInput.value = 'login';
        title.textContent = 'ログイン';
        btn.textContent = 'ログイン';
        toggleDiv.textContent = '新規アカウント登録はこちら';
    }
}
</script>

<?php require_once 'footer.php'; ?>