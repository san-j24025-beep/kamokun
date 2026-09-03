function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const action = payload.action;
    const data = payload.data || {};

    const props = PropertiesService.getScriptProperties();
    const users = JSON.parse(props.getProperty('users') || '[]');
    const reviews = JSON.parse(props.getProperty('reviews') || '[]');

    if (action === 'createUser') {
      if (!data.studentId || !data.password) {
        return jsonReply({ success:false, error: 'studentId と password を指定してください。' });
      }
      if (users.some(u => u.studentId === data.studentId)) {
        return jsonReply({ success:false, error: 'この学籍番号は既に登録されています。' });
      }
      // パスワードを SHA-256 でハッシュ化（簡易、実運用は bcrypt 等を推奨）
      const hashBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, data.password);
      const hashHex = hashBytes.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
      users.push({ studentId: data.studentId, passwordHash: hashHex });
      props.setProperty('users', JSON.stringify(users));
      return jsonReply({ success:true, data: { studentId: data.studentId } });
    }

    if (action === 'getUsers') {
      return jsonReply({ success:true, data: users });
    }

    if (action === 'createReview') {
      const now = new Date().toISOString();
      const id = 'r-' + Math.random().toString(36).slice(2,9);
      const review = Object.assign({ id:id, createdAt: now, likes:0 }, data);
      reviews.unshift(review);
      props.setProperty('reviews', JSON.stringify(reviews));
      return jsonReply({ success:true, data: review });
    }

    if (action === 'getAllReviews') {
      return jsonReply({ success:true, data: reviews });
    }

    if (action === 'deleteReview') {
      const idx = reviews.findIndex(r => r.studentId === data.studentId && r.createdAt === data.createdAt);
      if (idx < 0) return jsonReply({ success:false, error:'投稿が見つかりません。' });
      const requester = data.requester || '';
      if (requester !== reviews[idx].studentId && requester !== 'J24025') {
        return jsonReply({ success:false, error:'削除権限がありません。' });
      }
      reviews.splice(idx,1);
      props.setProperty('reviews', JSON.stringify(reviews));
      return jsonReply({ success:true });
    }

    if (action === 'toggleLikeReview') {
      const idx = reviews.findIndex(r => r.studentId === data.studentId && r.createdAt === data.createdAt);
      if (idx < 0) return jsonReply({ success:false, error:'投稿が見つかりません。' });
      if (data.isLiked) reviews[idx].likes = Math.max(0, (reviews[idx].likes||0)-1);
      else reviews[idx].likes = (reviews[idx].likes||0)+1;
      props.setProperty('reviews', JSON.stringify(reviews));
      return jsonReply({ success:true, likes: reviews[idx].likes });
    }

    return jsonReply({ success:false, error: '未対応のアクション: ' + action });
  } catch (err) {
    return jsonReply({ success:false, error: String(err) });
  }
}

function doGet(e) {
  return ContentService.createTextOutput('kamokun GAS endpoint').setMimeType(ContentService.MimeType.TEXT);
}

function jsonReply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
