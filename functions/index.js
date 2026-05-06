const functions = require('firebase-functions');
const { google } = require('googleapis');
const path = require('path');

const SPREADSHEET_ID = '1HNCoNKpPoD_NQ7GzKL2Krz0IWd8dJP3ws0ZoCjxeNPo';
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive'
];

function getAuth() {
  return new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'service-account.json'),
    scopes: SCOPES
  });
}

exports.api = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const action = req.method === 'GET' ? req.query.action : req.body.action;

  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });

    if (action === 'getInitData') {
      const result = await getInitData(sheets);
      res.json(result);
    } else if (action === 'submitOrder') {
      const result = await submitOrder(sheets, req.body.data);
      res.json(result);
    } else if (action === 'uploadSlip') {
      const result = await uploadSlip(sheets, drive, req.body.data);
      res.json(result);
    } else if (action === 'getStatus') {
      const result = await getOrderStatus(sheets, req.query.orderNumber);
      res.json(result);
    } else {
      res.json({ error: 'Invalid action' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

async function getInitData(sheets) {
  const [optRes, pkgRes, gamesRes, fieldsRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Options!A:B' }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Packages!A:C' }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Games!A:B' }),
    sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Fields!A:Z' })
  ]);

  const options = {};
  (optRes.data.values || []).slice(1).forEach(([field, option]) => {
    if (!field || !option) return;
    if (!options[field]) options[field] = [];
    options[field].push(option);
  });

  const packages = {};
  (pkgRes.data.values || []).slice(1).forEach(([game, pkg, price]) => {
    if (!game || !pkg) return;
    if (!packages[game]) packages[game] = [];
    packages[game].push({ pkg, price: Number(price) });
  });

  const games = {};
  (gamesRes.data.values || []).slice(1).forEach(([game, url]) => {
    if (game && url) games[game] = url;
  });

  const fieldsRows = fieldsRes.data.values || [];
  const headers = fieldsRows[0] || [];
  const fields = fieldsRows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i] || ''; });
    return obj;
  });

  return { options, packages, games, fields };
}

async function generateOrderNumber(sheets) {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `KM-${dd}${mm}-`;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Main!B:B'
  });

  const values = res.data.values || [];
  let maxRun = 0;
  values.forEach(([val]) => {
    if (val && String(val).startsWith(prefix)) {
      const run = parseInt(String(val).replace(prefix, '')) || 0;
      if (run > maxRun) maxRun = run;
    }
  });

  return prefix + String(maxRun + 1).padStart(4, '0');
}

async function submitOrder(sheets, data) {
  const orderNumber = await generateOrderNumber(sheets);
  const now = new Date().toISOString();

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Main!A:T',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[
        now, orderNumber, data.orderFrom, data.game,
        data.platform, data.customerType, data.customerName,
        data.loginForm, data.emailId, data.pass, data.charName,
        data.level, data.server, data.uid, data.packageSummary,
        data.totalPrice, now, '', '', 'Prepare'
      ]]
    }
  });

  return { success: true, orderNumber };
}

async function getOrderStatus(sheets, orderNumber) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Main!A:T'
  });

  const rows = res.data.values || [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === orderNumber) {
      return {
        success: true,
        orderNumber: rows[i][1],
        game: rows[i][3],
        package: rows[i][14],
        totalPrice: rows[i][15],
        status: rows[i][19]
      };
    }
  }
  return { success: false, message: 'ไม่พบออเดอร์นี้' };
}

async function uploadSlip(sheets, drive, data) {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rootFolderId = '1ZM_OU5yKU3zDspuyPEj9NhKEn2s-Sy2r';

  async function getOrCreateFolder(name, parentId) {
    const res = await drive.files.list({
      q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id)'
    });
    if (res.data.files.length > 0) return res.data.files[0].id;
    const folder = await drive.files.create({
      resource: { name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] },
      fields: 'id'
    });
    return folder.data.id;
  }

  const monthFolderId = await getOrCreateFolder(mm, rootFolderId);
  const dayFolderId = await getOrCreateFolder(dd, monthFolderId);

  const ext = data.mimeType.split('/')[1];
  const fileRes = await drive.files.create({
    resource: { name: `${data.orderNumber}.${ext}`, parents: [dayFolderId] },
    media: { mimeType: data.mimeType, body: Buffer.from(data.fileBase64, 'base64') },
    fields: 'id, webViewLink'
  });

  const fileUrl = fileRes.data.webViewLink;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID, range: 'Main!B:B'
  });
  const rows = res.data.values || [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.orderNumber) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Main!R${i + 1}:S${i + 1}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [[data.slipAmount, fileUrl]] }
      });
      break;
    }
  }

  return { success: true, fileUrl };
}
