const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectDir = __dirname;
const htmlPath = path.join(projectDir, 'public', 'index.html');
const chatImgPath = path.join(projectDir, 'screenshots', 'preview-chat.png');
const settingsImgPath = path.join(projectDir, 'screenshots', 'preview-settings.png');
const pdfOutputPath = path.join(projectDir, 'Laporan_Praktikum_10_Ilham_Saputra_20240140118.pdf');

// Read files
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

function getBase64Image(filePath) {
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath);
    return `data:image/png;base64,${fileData.toString('base64')}`;
  }
  return '';
}

const chatImgBase64 = getBase64Image(chatImgPath);
const settingsImgBase64 = getBase64Image(settingsImgPath);

// Escape HTML for code display
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const reportHtmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Laporan Praktikum 10 - Ilham Saputra (20240140118)</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 15mm 15mm 15mm;
    }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #1e293b;
      line-height: 1.6;
      background: #ffffff;
      padding: 0;
      margin: 0;
    }
    .header-card {
      background: linear-gradient(135deg, #1e1b4b, #4338ca);
      color: #ffffff;
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 24px;
    }
    .header-card h1 {
      margin: 0 0 8px 0;
      font-size: 22px;
      color: #ffffff;
    }
    .header-card h2 {
      margin: 0 0 16px 0;
      font-size: 15px;
      font-weight: 400;
      color: #c7d2fe;
    }
    .identity-box {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 8px;
      padding: 14px 18px;
      font-size: 14px;
    }
    .identity-box p {
      margin: 5px 0;
    }
    .repo-link {
      display: inline-block;
      margin-top: 6px;
      color: #fef08a;
      font-weight: bold;
      word-break: break-all;
      text-decoration: underline;
    }
    .section-title {
      font-size: 17px;
      font-weight: bold;
      color: #312e81;
      border-bottom: 2px solid #6366f1;
      padding-bottom: 6px;
      margin-top: 24px;
      margin-bottom: 16px;
    }
    .screenshot-grid {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 24px;
    }
    .screenshot-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .screenshot-card h4 {
      background: #f8fafc;
      margin: 0;
      padding: 10px 16px;
      font-size: 14px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    .screenshot-card img {
      width: 100%;
      height: auto;
      display: block;
    }
    .code-block {
      background: #0f172a;
      color: #e2e8f0;
      padding: 16px;
      border-radius: 8px;
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 11px;
      line-height: 1.45;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
  </style>
</head>
<body>

  <div class="header-card">
    <h1>LAPORAN PRAKTIKUM 10 - PENGEMBANGAN WEB SERVICE</h1>
    <h2>Pembuatan Projek Express AI Chatbox (Model liquid/lfm-2.5-2.6b:free)</h2>
    
    <div class="identity-box">
      <p><strong>Nama Mahasiswa:</strong> Ilham Saputra</p>
      <p><strong>NIM:</strong> 20240140118</p>
      <p><strong>Mata Kuliah:</strong> Pengembangan Web Service (Praktikum 10)</p>
      <p><strong>URL Repositori GitHub:</strong> <span class="repo-link">https://github.com/ilham101106/118_ChatboxAI.git</span></p>
    </div>
  </div>

  <div class="section-title">📷 1. Tangkapan Layar Hasil Chatbox & UI Aplikasi</div>

  <div class="screenshot-grid">
    <div class="screenshot-card">
      <h4>A. Tampilan Utama Percakapan Chatbot (Visual UI)</h4>
      <img src="${chatImgBase64}" alt="Screenshot Percakapan Chatbot">
    </div>

    <div class="screenshot-card">
      <h4>B. Panel Pengaturan API Key & Model (Collapsible Settings Drawer)</h4>
      <img src="${settingsImgBase64}" alt="Screenshot Pengaturan API Key">
    </div>
  </div>

  <div style="page-break-before: always;"></div>

  <div class="section-title">💻 2. Kode Source HTML (public/index.html)</div>
  <p style="font-size: 13px; color: #64748b;">Berikut adalah keseluruhan source code HTML5 yang digunakan untuk membangun antarmuka web Express AI Chatbox:</p>

  <div class="code-block">${escapeHtml(htmlContent)}</div>

</body>
</html>`;

const reportHtmlPath = path.join(projectDir, 'Laporan_Praktikum_10_Ilham_Saputra.html');
fs.writeFileSync(reportHtmlPath, reportHtmlContent, 'utf8');

console.log('HTML Report berhasil dibuat:', reportHtmlPath);

// Convert HTML to PDF using MS Edge Headless
const edgeExe = '"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"';
const cmd = `${edgeExe} --headless --disable-gpu --print-to-pdf="${pdfOutputPath}" "${reportHtmlPath}"`;

try {
  execSync(cmd);
  console.log('PDF Report berhasil dibuat:', pdfOutputPath);
} catch (err) {
  console.error('Error saat konversi PDF:', err.message);
}
