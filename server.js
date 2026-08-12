const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// OpenRouter Base Endpoint
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'liquid/lfm-2.5-2.6b:free';

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    defaultModel: DEFAULT_MODEL,
    hasServerApiKey: Boolean(process.env.OPENROUTER_API_KEY)
  });
});

// Chat API Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, apiKey: clientApiKey, model, systemPrompt } = req.body;

    // Prioritaskan API Key dari Client UI (Opsi 2), jika tidak ada baru gunakan process.env
    const apiKey = clientApiKey || process.env.OPENROUTER_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
      return res.status(400).json({
        error: {
          message: 'OpenRouter API Key belum diatur. Silakan masukkan API Key Anda di menu Pengaturan (UI) atau di file .env.'
        }
      });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: {
          message: 'Format pesan tidak valid atau kosong.'
        }
      });
    }

    // Susun payload pesan dengan System Prompt jika ada
    const formattedMessages = [];
    if (systemPrompt && systemPrompt.trim() !== '') {
      formattedMessages.push({
        role: 'system',
        content: systemPrompt.trim()
      });
    }
    
    // Tambahkan percakapan user & assistant
    messages.forEach((msg) => {
      formattedMessages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    const activeModel = model || DEFAULT_MODEL;

    // Kirim request ke OpenRouter API
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: activeModel,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 2048
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'HTTP-Referer': `http://localhost:${PORT}`,
          'X-Title': 'Express AI Chatbox App',
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 seconds timeout
      }
    );

    // Ambil jawaban AI dari response OpenRouter
    const choice = response.data?.choices?.[0];
    const aiMessage = choice?.message?.content || 'Tidak ada balasan dari model AI.';

    return res.json({
      success: true,
      message: aiMessage,
      model: activeModel,
      usage: response.data?.usage || null
    });

  } catch (error) {
    console.error('Error saat menghubungi OpenRouter API:', error.response?.data || error.message);

    const statusCode = error.response?.status || 500;
    let errorMessage = error.response?.data?.error?.message || 
                         error.response?.data?.message || 
                         error.message || 
                         'Terjadi kesalahan internal pada server.';

    // Penanganan khusus jika API key salah / tidak terdaftar di OpenRouter
    if (errorMessage.includes('User not found') || statusCode === 401) {
      errorMessage = 'API Key OpenRouter tidak valid atau tidak ditemukan. Pastikan Anda menyalin key dari https://openrouter.ai/keys (format diawali dengan `sk-or-v1-...`).';
    }

    return res.status(statusCode).json({
      error: {
        message: errorMessage,
        status: statusCode
      }
    });
  }
});

// Fallback route untuk SPA/HTML
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Express AI Chatbox Server berjalan di port ${PORT}`);
  console.log(`🔗 Buka di browser: http://localhost:${PORT}`);
  console.log(`🤖 Model Default: ${DEFAULT_MODEL}`);
  console.log(`===================================================`);
});
