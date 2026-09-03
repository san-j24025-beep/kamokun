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
        '学籍番号':'studentid','studentid':'studentid','id':'studentid',
        '学年':'grade','grade':'grade',
        '登録日時':'registeredat','registeredat':'registeredat','投稿日時':'createdat','createdat':'createdat',
        'passwordhash':'passwordhash','パスワードハッシュ':'passwordhash','password':'passwordhash',
        'role':'role','役割':'role','表示名':'displayname','displayname':'displayname',
        // reviews
        '科目名':'subject','subject':'subject',
        '評価':'rating','rating':'rating',
        '感想':'comment','comment':'comment',
        '小テスト・レポート割合':'reportratio','小テストレポート割合':'reportratio','reportratio':'reportratio',
        'likes':'likes'
      };
      return map[s] || s;
    }

    function canonicalToPreferredHeader(canonical) {
      const pref = {
        'studentid':'学籍番号', 'grade':'学年', 'registeredat':'登録日時', 'passwordhash':'passwordHash', 'role':'役割', 'displayname':'表示名',
        'id':'id', 'subject':'科目名', 'rating':'評価', 'comment':'感想', 'createdat':'投稿日時', 'reportratio':'小テスト・レポート割合', 'likes':'likes'
      };
      return pref[canonical] || canonical;
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
        return obj;
      });
    }

    function appendToSheet(sheetName, obj) {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      let sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
      }
      const headers = sheet.getRange(1,1,1,Math.max(1,sheet.getLastColumn())).getValues()[0];
      // if sheet empty, create headers from preferred mapping of object keys
      if (!headers || headers.length === 0 || headers[0] === '') {
        const keys = Object.keys(obj).map(k => canonicalToPreferredHeader(k));
        sheet.getRange(1,1,1,keys.length).setValues([keys]);
        const values = keys.map(h => obj[normalizeHeader(h)] || obj[h] || '');
        sheet.appendRow(values);
      } else {
        const values = headers.map(h => obj[normalizeHeader(h)] || obj[h] || '');
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
      const values = arr.map(o => headers.map(h => o[normalizeHeader(h)] || o[h] || ''));
      sheet.getRange(2,1,values.length, headers.length).setValues(values);
    }

    // load from spreadsheet if configured, otherwise use PropertiesService JSON
    const users = SPREADSHEET_ID ? loadSheet('users') : JSON.parse(props.getProperty('users') || '[]');
    const reviews = SPREADSHEET_ID ? loadSheet('reviews') : JSON.parse(props.getProperty('reviews') || '[]');

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
      const newUser = { studentId: data.studentId, passwordHash: hashHex, registeredAt: new Date().toISOString(), role: data.role || 'user' };
      if (SPREADSHEET_ID) {
        appendToSheet('users', newUser);
      } else {
        users.push(newUser);
        props.setProperty('users', JSON.stringify(users));
      }
      return jsonReply({ success:true, data: { studentId: data.studentId } });
    }

    if (action === 'getUsers') {
      return jsonReply({ success:true, data: users });
    }

    if (action === 'createReview') {
      const now = new Date().toISOString();
      const id = 'r-' + Math.random().toString(36).slice(2,9);
      const review = Object.assign({ id:id, createdAt: now, likes:0 }, data);
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
      if (data.isLiked) reviews[idx].likes = Math.max(0, (reviews[idx].likes||0)-1);
      else reviews[idx].likes = (reviews[idx].likes||0)+1;
      if (SPREADSHEET_ID) saveSheetArray('reviews', reviews);
      else props.setProperty('reviews', JSON.stringify(reviews));
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
