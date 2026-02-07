// ── Hugging Face Inference API Service Layer ────────────────────
// Uses the OpenAI-compatible /v1/chat/completions endpoint on router.huggingface.co
// Requires a free API token from https://huggingface.co/settings/tokens

const https = require('https');

const HF_HOST = 'router.huggingface.co';
const DEFAULT_MODEL = 'Qwen/Qwen2.5-Coder-32B-Instruct';
const COMPLETION_TIMEOUT = 5000;

class HuggingFaceService {
  constructor() {
    this.host = HF_HOST;
    this.model = DEFAULT_MODEL;
    this.apiKey = '';
    this.available = false;
    this.rateLimited = false;
  }

  // ── Set API Key ─────────────────────────────────────────────────
  setApiKey(key) {
    this.apiKey = (key || '').trim();
    this.available = false;
  }

  // ── HTTPS helper ──────────────────────────────────────────────
  _request(body, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify(body);
      const options = {
        hostname: this.host,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout,
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, data });
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.on('error', (err) => reject(err));

      req.write(payload);
      req.end();
    });
  }

  // ── Health Check ──────────────────────────────────────────────
  async checkHealth() {
    if (!this.apiKey) {
      this.available = false;
      return { available: false, noKey: true, model: this.model };
    }

    try {
      const res = await this._request({
        model: this.model,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 1,
      }, 5000);

      if (res.status === 200) {
        this.available = true;
        this.rateLimited = false;
        return { available: true, model: this.model };
      }

      if (res.status === 401) {
        this.available = false;
        return { available: false, unauthorized: true, model: this.model };
      }

      if (res.status === 429) {
        this.available = false;
        this.rateLimited = true;
        return { available: false, rateLimited: true, model: this.model };
      }

      if (res.status === 503) {
        this.available = false;
        return { available: false, loading: true, model: this.model };
      }

      this.available = false;
      return { available: false, model: this.model };
    } catch {
      this.available = false;
      this.rateLimited = false;
    }
    return { available: false, model: this.model };
  }

  // ── Set Model ─────────────────────────────────────────────────
  setModel(model) {
    this.model = model;
    this.available = false;
  }

  // ── Generate Completion (for autocomplete) ────────────────────
  async complete(prompt, options = {}) {
    if (!this.available || !this.apiKey) return null;

    try {
      const res = await this._request({
        model: options.model || this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a shell command autocomplete engine. Output ONLY the completion text, nothing else. No explanation, no markdown, no quotes.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: options.maxTokens ?? 40,
        temperature: options.temperature ?? 0.1,
        top_p: options.top_p ?? 0.9,
      }, options.timeout || COMPLETION_TIMEOUT);

      if (res.status === 429) {
        this.rateLimited = true;
        return null;
      }

      this.rateLimited = false;

      if (res.status === 200 && res.data.choices && res.data.choices.length > 0) {
        let text = res.data.choices[0].message?.content || '';
        // Apply stop sequences
        const stops = options.stop || ['\n', '\r', '```'];
        for (const stop of stops) {
          const idx = text.indexOf(stop);
          if (idx !== -1) text = text.substring(0, idx);
        }
        return text.trim();
      }
    } catch { /* silent fail */ }

    return null;
  }

  // ── Status info ───────────────────────────────────────────────
  getStatus() {
    return {
      available: this.available,
      rateLimited: this.rateLimited,
      model: this.model,
      host: this.host,
      hasKey: !!this.apiKey,
    };
  }
}

module.exports = new HuggingFaceService();
