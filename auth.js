function getStoredUser() {
    try {
        const sessionUser = sessionStorage.getItem('currentUser');
        if (sessionUser) {
            const parsed = JSON.parse(sessionUser);
            if (parsed && parsed.studentId) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('セッションストレージの読み取りに失敗しました。', e);
    }

    try {
        const localUser = localStorage.getItem('currentUser');
        if (localUser) {
            const parsed = JSON.parse(localUser);
            if (parsed && parsed.studentId) {
                sessionStorage.setItem('currentUser', JSON.stringify(parsed));
                return parsed;
            }
        }
    } catch (e) {
        console.warn('ローカルストレージの読み取りに失敗しました。', e);
    }

    return null;
}

function saveCurrentUser(user, isAnonymous = false) {
    const normalizedUser = user && user.studentId ? { 
        studentId: user.studentId,
        isAnonymous: isAnonymous || false
    } : { 
        studentId: 'ゲスト',
        isAnonymous: false
    };
    sessionStorage.setItem('currentUser', JSON.stringify(normalizedUser));
    localStorage.setItem('currentUser', JSON.stringify(normalizedUser));
    return normalizedUser;
}

function clearAuth() {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('currentUser');
}

function requireAuth() {
    const user = getStoredUser();
    if (!user) {
        window.location.replace('login.html');
        return null;
    }
    return user;
}

function logout() {
    clearAuth();
    window.location.replace('login.html');
}
