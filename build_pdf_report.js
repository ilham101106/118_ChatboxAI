const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectDir = __dirname;
const htmlPath = path.join(projectDir, 'public', 'index.html');
const appJsPath = path.join(projectDir, 'public', 'app.js');
const serverJsPath = path.join(projectDir, 'server.js');
const chatImgPath = path.join(projectDir, 'screenshots', 'preview-chat.png');
const settingsImgPath = path.join(projectDir, 'screenshots', 'preview-settings.png');
const pdfOutputPath = path.join(projectDir, 'Laporan_Praktikum_10_Ilham_Saputra_20240140118.pdf');

// Read source files
const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');
const serverJsContent = fs.readFileSync(serverJsPath, 'utf8');

function getBase64Image(filePath) {
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath);
    return `data:image/png;base64,${fileData.toString('base64')}`;
  }
  return '';
}

const chatImgBase64 = getBase64Image(chatImgPath);
const settingsImgBase64 = getBase64Image(settingsImgPath);

// Escape HTML
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Generate CodeSnap-style Window HTML with line numbers
function renderCodeSnap(filename, language, codeText) {
  const lines = codeText.split('\n');
  const numberedLines = lines.map((line, index) => {
    const lineNum = String(index + 1).padStart(3, ' ');
    return `<span class="line-num">${lineNum}</span>  ${escapeHtml(line)}`;
  }).join('\n');

  return `
    <div class="codesnap-container">
      <div class="codesnap-header">
        <div class="mac-controls">
          <span class="mac-btn close"></span>
          <span class="mac-btn minimize"></span>
          <span class="mac-btn maximize"></span>
        </div>
        <div class="codesnap-title"><i class="file-icon">📄</i> ${filename}</div>
        <div class="codesnap-lang">${language}</div>
      </div>
      <div class="codesnap-body">
        <pre><code>${numberedLines}</code></pre>
      </div>
    </div>
  `;
}

const reportHtmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Laporan Praktikum 10 Web Service - Ilham Saputra</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.6;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }

    /* Natural Cover & Identity Header */
    .report-header {
      border-bottom: 3px solid #4f46e5;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .report-title {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 6px 0;
      text-transform: uppercase;
      letter-spacing: -0.5px;
    }
    .report-subtitle {
      font-size: 14px;
      color: #475569;
      margin: 0 0 16px 0;
      font-weight: 500;
    }
    
    .identity-table {
      width: 100%;
      border-collapse: collapse;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      margin-top: 12px;
    }
    .identity-table td {
      padding: 10px 14px;
      font-size: 13px;
      border-bottom: 1px solid #e2e8f0;
    }
    .identity-table tr:last-child td {
      border-bottom: none;
    }
    .identity-table td.label {
      width: 170px;
      font-weight: 600;
      color: #334155;
      background: #f1f5f9;
    }
    .identity-table td.value {
      color: #0f172a;
      font-weight: 500;
    }
    .repo-url {
      color: #2563eb;
      font-weight: bold;
      text-decoration: underline;
      word-break: break-all;
    }

    /* Section Styling */
    .section {
      margin-top: 28px;
      margin-bottom: 20px;
    }
    .section-heading {
      font-size: 16px;
      font-weight: 700;
      color: #1e1b4b;
      background: #e0e7ff;
      padding: 8px 14px;
      border-left: 4px solid #4f46e5;
      border-radius: 0 6px 6px 0;
      margin-bottom: 14px;
    }

    /* Screenshots Grid */
    .screenshot-box {
      margin-bottom: 22px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    }
    .screenshot-caption {
      background: #0f172a;
      color: #f8fafc;
      padding: 10px 16px;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .screenshot-box img {
      width: 100%;
      height: auto;
      display: block;
    }

    /* Easy CodeSnap / Carbon Window Style */
    .codesnap-container {
      background: #111827;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.1);
      margin: 18px 0;
      overflow: hidden;
    }
    .codesnap-header {
      background: #1f2937;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .mac-controls {
      display: flex;
      gap: 6px;
      width: 60px;
    }
    .mac-btn {
      width: 11px;
      height: 11px;
      border-radius: 50%;
    }
    .mac-btn.close { background: #ef4444; }
    .mac-btn.minimize { background: #f59e0b; }
    .mac-btn.maximize { background: #10b981; }

    .codesnap-title {
      color: #9ca3af;
      font-family: 'Consolas', 'Fira Code', monospace;
      font-size: 12px;
      font-weight: 500;
    }
    .codesnap-lang {
      font-size: 10px;
      background: rgba(255, 255, 255, 0.1);
      color: #a5b4fc;
      padding: 2px 8px;
      border-radius: 4px;
      font-family: monospace;
    }
    .codesnap-body {
      padding: 14px 16px;
      overflow-x: auto;
    }
    .codesnap-body pre {
      margin: 0;
      font-family: 'Consolas', 'Fira Code', monospace;
      font-size: 10.5px;
      line-height: 1.45;
      color: #e5e7eb;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .line-num {
      color: #4b5563;
      user-select: none;
      display: inline-block;
      width: 28px;
      text-align: right;
    }
  </style>
</head>
<body>

  <!-- Cover Header -->
  <div class="report-header">
    <div class="report-title">Laporan Praktikum 10 - Pengembangan Web Service</div>
    <div class="report-subtitle">Implementasi Express.js AI Chatbot Menggunakan Model Liquid LFM 2.5 (OpenRouter API)</div>
    
    <table class="identity-table">
      <tr>
        <td class="label">Nama Mahasiswa</td>
        <td class="value">Ilham Saputra</td>
      </tr>
      <tr>
        <td class="label">NIM</td>
        <td class="value">20240140118</td>
      </tr>
      <tr>
        <td class="label">Praktikum / Matkul</td>
        <td class="value">Pengembangan Web Service (Praktikum 10)</td>
      </tr>
      <tr>
        <td class="label">Link Repositori GitHub</td>
        <td class="value"><a href="https://github.com/ilham101106/118_ChatboxAI.git" class="repo-url">https://github.com/ilham101106/118_ChatboxAI.git</a></td>
      </tr>
    </table>
  </div>

  <!-- Section 1: Ringkasan & Deskripsi -->
  <div class="section">
    <div class="section-heading">1. Deskripsi Pengerjaan Tugas</div>
    <p style="font-size: 13px; color: #334155; margin-top: 6px;">
      Pada praktikum 10 ini, saya membuat aplikasi web chatbox interaktif berbasis <strong>Node.js & Express.js</strong>. 
      Server Express bertindak sebagai backend penyedia API yang menghubungkan aplikasi web ke model AI <strong>Liquid LFM 2.5 2.6B Free</strong> (<code>liquid/lfm-2.5-2.6b:free</code>) melalui OpenRouter API. 
      Antarmuka dibuat responsif dengan fitur <i>collapsible drawer settings</i>, Markdown formatting, serta rendering blok kode interaktif.
    </p>
  </div>

  <!-- Section 2: Screenshot UI Hasil Chatbox -->
  <div class="section">
    <div class="section-heading">2. Hasil Tangkapan Layar (Screenshots UI & Chat AI)</div>
    
    <div class="screenshot-box">
      <div class="screenshot-caption">
        <span>A. Tampilan Percakapan Aktif dengan AI (Liquid LFM 2.5)</span>
        <span style="font-weight: normal; font-size: 11px;">Status: Response OK</span>
      </div>
      <img src="${chatImgBase64}" alt="Screenshot Percakapan UI Chatbot">
    </div>

    <div class="screenshot-box">
      <div class="screenshot-caption">
        <span>B. Panel Pengaturan API Key & Model (Collapsible Settings Drawer)</span>
        <span style="font-weight: normal; font-size: 11px;">Status: API Key Connected</span>
      </div>
      <img src="${settingsImgBase64}" alt="Screenshot Panel Pengaturan">
    </div>
  </div>

  <div style="page-break-before: always;"></div>

  <!-- Section 3: Easy CodeSnap Code Preview -->
  <div class="section">
    <div class="section-heading">3. Kode Program Utama (Easy CodeSnap Style)</div>
    <p style="font-size: 12.5px; color: #475569; margin-bottom: 10px;">
      Berikut adalah potongan source code program yang disusun dengan format CodeSnap:
    </p>

    <!-- CodeSnap HTML -->
    ${renderCodeSnap('public/index.html', 'HTML5', htmlContent)}

    <!-- CodeSnap Express Server -->
    ${renderCodeSnap('server.js', 'Node.js / Express', serverJsContent)}

    <!-- CodeSnap Client Script -->
    ${renderCodeSnap('public/app.js', 'JavaScript (ES6+)', appJsContent)}
  </div>

</body>
</html>`;

const reportHtmlPath = path.join(projectDir, 'Laporan_Praktikum_10_Ilham_Saputra.html');
fs.writeFileSync(reportHtmlPath, reportHtmlContent, 'utf8');

console.log('HTML Report dengan Easy CodeSnap berhasil disusun:', reportHtmlPath);

// Convert HTML to PDF using MS Edge Headless
const edgeExe = '"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"';
const cmd = `${edgeExe} --headless --disable-gpu --print-to-pdf="${pdfOutputPath}" "${reportHtmlPath}"`;

try {
  execSync(cmd);
  console.log('PDF Report 95%+ Sukses Dibuat:', pdfOutputPath);
} catch (err) {
  console.error('Error konversi PDF:', err.message);
}
