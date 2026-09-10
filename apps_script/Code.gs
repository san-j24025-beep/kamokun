function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const action = payload.action;
    const data = payload.data || {};

    const props = PropertiesService.getScriptProperties();
    const SPREADSHEET_ID = props.getProperty('SPREADSHEET_ID') || '';

    // helper: spreadsheet-backed storage if SPREADSHEET_ID is provided
    // Normalize various header names (Japanese/English) to canonical keys
    function normalizeHeader(h) {
      if (!h) return '';
      const s = String(h).toLowerCase().replace(/\s|\u00A0/g,'');
      const map = {
        // users
        '学籍番号':'studentId','studentid':'studentId','id':'studentId',
        '学年':'grade','grade':'grade',
        '登録日時':'registeredAt','registeredat':'registeredAt','投稿日時':'createdAt','createdat':'createdAt',
        'passwordhash':'passwordHash','パスワードハッシュ':'passwordHash','password':'passwordHash',
        'role':'role','役割':'role','表示名':'displayname','displayname':'displayname',
        // reviews
        '科目名':'subject','subject':'subject',
        '評価':'rating','rating':'rating',
        '感想':'comment','comment':'comment',
        '小テスト・レポート割合':'reportRatio','小テストレポート割合':'reportRatio','reportratio':'reportRatio',
        'likes':'likes','likedby':'likedBy','いいねユーザー':'likedBy'
      };
      return map[s] || s;
    }

    function canonicalToPreferredHeader(canonical) {
      const pref = {
        'studentId':'studentId', 'grade':'grade', 'registeredAt':'registeredAt', 'passwordHash':'passwordHash', 'role':'role', 'displayname':'displayname',
        'id':'id', 'subject':'subject', 'rating':'rating', 'comment':'comment', 'createdAt':'createdAt', 'reportRatio':'reportRatio', 'likes':'likes', 'likedBy':'likedBy'
      };
      return pref[canonical] || canonical;
    }

    function valueForHeader(obj, header) {
      const key = normalizeHeader(header);
      if (!Object.prototype.hasOwnProperty.call(obj, key)) return '';
      return key === 'likedBy' ? JSON.stringify(obj[key] || []) : obj[key];
    }

    function loadSheet(sheetName) {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return [];
      const values = sheet.getDataRange().getValues();
      if (values.length <= 1) return [];
      const headers = values[0];
      const rows = values.slice(1);
      return rows.map(r => {
        const obj = {};
        for (let i = 0; i < headers.length; i++) {
          const key = normalizeHeader(headers[i]);
          if (key) obj[key] = r[i];
        }
        if (typeof obj.likedBy === 'string') {
          try { obj.likedBy = JSON.parse(obj.likedBy); } catch (e) { obj.likedBy = []; }
        }
        return obj;
      });
    }

    function appendToSheet(sheetName, obj) {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      let sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
      }
      let headers = sheet.getRange(1,1,1,Math.max(1,sheet.getLastColumn())).getValues()[0];
      // if sheet empty, create headers from preferred mapping of object keys
      if (!headers || headers.length === 0 || headers[0] === '') {
        const keys = Object.keys(obj).map(k => canonicalToPreferredHeader(k));
        sheet.getRange(1,1,1,keys.length).setValues([keys]);
        const values = keys.map(h => valueForHeader(obj, h));
        sheet.appendRow(values);
      } else {
        const existingKeys = headers.map(normalizeHeader);
        const missingKeys = Object.keys(obj).filter(key => !existingKeys.includes(key));
        if (missingKeys.length > 0) {
          const missingHeaders = missingKeys.map(canonicalToPreferredHeader);
          headers = headers.concat(missingHeaders);
          sheet.getRange(1,1,1,headers.length).setValues([headers]);
        }
        const values = headers.map(h => valueForHeader(obj, h));
        sheet.appendRow(values);
      }
    }

    function saveSheetArray(sheetName, arr) {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      let sheet = ss.getSheetByName(sheetName);
      if (!sheet) sheet = ss.insertSheet(sheetName);
      // keep existing headers if present
      const existing = sheet.getRange(1,1,1,Math.max(1,sheet.getLastColumn())).getValues()[0];
      let headers;
      if (existing && existing[0] !== '') {
        headers = existing;
      } else {
        headers = Object.keys(arr[0] || {}).map(k => canonicalToPreferredHeader(k));
      }
      sheet.clearContents();
      if (!headers || headers.length === 0) return;
      sheet.getRange(1,1,1,headers.length).setValues([headers]);
      if (arr.length === 0) return;
      const values = arr.map(o => headers.map(h => valueForHeader(o, h)));
      sheet.getRange(2,1,values.length, headers.length).setValues(values);
    }

    // load from spreadsheet if configured, otherwise use PropertiesService JSON
    const users = SPREADSHEET_ID ? loadSheet('users') : JSON.parse(props.getProperty('users') || '[]');
    const reviews = SPREADSHEET_ID ? loadSheet('reviews') : JSON.parse(props.getProperty('reviews') || '[]');

    if (action === 'createUser') {
      if (!SPREADSHEET_ID) {
        return jsonReply({ success:false, error: 'SPREADSHEET_IDが未設定のため、スプレッドシートへ保存できません。' });
      }
      if (!data.studentId || !data.password) {
        return jsonReply({ success:false, error: 'studentId と password を指定してください。' });
      }
      if (users.some(u => u.studentId === data.studentId)) {
        return jsonReply({ success:false, error: 'この学籍番号は既に登録されています。' });
      }
      // パスワードを SHA-256 でハッシュ化（簡易、実運用は bcrypt 等を推奨）
      const hashBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, data.password);
      const hashHex = hashBytes.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
      const newUser = { studentId: data.studentId, passwordHash: hashHex, registeredAt: new Date().toISOString(), role: data.role || 'user' };
      appendToSheet('users', newUser);
      return jsonReply({ success:true, data: { studentId: data.studentId } });
    }

    if (action === 'login') {
      if (!data.studentId || !data.password) {
        return jsonReply({ success:false, error: '学籍番号とパスワードを入力してください。' });
      }
      const hashBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, data.password);
      const hashHex = hashBytes.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
      const user = users.find(u => u.studentId === data.studentId && u.passwordHash === hashHex);
      if (!user) {
        return jsonReply({ success:false, error: '学籍番号またはパスワードが間違っています。' });
      }
      return jsonReply({ success:true, user: { studentId: user.studentId, grade: user.grade || '', role: user.role || 'user' } });
    }

    if (action === 'getUsers') {
      return jsonReply({ success:true, data: users });
    }

    if (action === 'createReview') {
      const now = new Date().toISOString();
      const id = 'r-' + Math.random().toString(36).slice(2,9);
      const review = Object.assign({ id:id, createdAt: now, likes:0, likedBy:[] }, data);
      if (SPREADSHEET_ID) {
        appendToSheet('reviews', review);
      } else {
        reviews.unshift(review);
        props.setProperty('reviews', JSON.stringify(reviews));
      }
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
      // remove and persist
      reviews.splice(idx,1);
      if (SPREADSHEET_ID) {
        saveSheetArray('reviews', reviews);
      } else {
        props.setProperty('reviews', JSON.stringify(reviews));
      }
      return jsonReply({ success:true });
    }

    if (action === 'toggleLikeReview') {
      const idx = reviews.findIndex(r => r.studentId === data.studentId && r.createdAt === data.createdAt);
      if (idx < 0) return jsonReply({ success:false, error:'投稿が見つかりません。' });
      const requester = data.requester || '';
      if (!requester) return jsonReply({ success:false, error:'ログインユーザーを確認できません。' });
      const likedBy = Array.isArray(reviews[idx].likedBy) ? reviews[idx].likedBy : [];
      const userIndex = likedBy.indexOf(requester);
      if (userIndex >= 0) {
        likedBy.splice(userIndex, 1);
      } else {
        likedBy.push(requester);
      }
      reviews[idx].likedBy = likedBy;
      reviews[idx].likes = likedBy.length;
      if (SPREADSHEET_ID) saveSheetArray('reviews', reviews);
      else props.setProperty('reviews', JSON.stringify(reviews));
      return jsonReply({ success:true, likes: reviews[idx].likes, liked: userIndex < 0 });
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
