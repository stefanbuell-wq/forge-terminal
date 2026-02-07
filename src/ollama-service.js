// ── Ollama Service Layer ─────────────────────────────────────────
// Communicates with the Ollama REST API at localhost:11434

const http = require('http');

const OLLAMA_BASE = 'http://127.0.0.1:11434';
const DEFAULT_MODEL = 'codellama:7b';
const COMPLETION_TIMEOUT = 3000; // 3s max for autocomplete

class OllamaService {
  constructor() {
    this.baseUrl = OLLAMA_BASE;
    this.model = DEFAULT_MODEL;
    this.available = false;
    this.models = [];
  }

  // ── HTTP helper ─────────────────────────────────────────────────
  _request(method, path, body = null, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method,
        headers: { 'Content-Type': 'application/json' },
        timeout,
      };

      const req = http.request(options, (res) => {
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

      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  // ── Streaming helper for /api/generate ──────────────────────────
  _streamGenerate(body, timeout = COMPLETION_TIMEOUT) {
    return new Promise((resolve, reject) => {
      const url = new URL('/api/generate', this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeout,
      };

      let result = '';
      const req = http.request(options, (res) => {
        res.on('data', (chunk) => {
          const lines = chunk.toString().split('\n').filter(Boolean);
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.response) result += parsed.response;
              if (parsed.done) {
                resolve(result);
              }
            } catch { /* skip malformed lines */ }
          }
        });
        res.on('end', () => resolve(result));
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(result); // return partial result on timeout
      });

      req.on('error', (err) => reject(err));
      req.write(JSON.stringify(body));
      req.end();
    });
  }

  // ── Health Check ────────────────────────────────────────────────
  async checkHealth() {
    try {
      const res = await this._request('GET', '/api/tags', null, 3000);
      if (res.status === 200) {
        this.available = true;
        this.models = (res.data.models || []).map((m) => ({
          name: m.name,
          size: m.size,
          modified: m.modified_at,
        }));
        return { available: true, models: this.models };
      }
    } catch {
      this.available = false;
      this.models = [];
    }
    return { available: false, models: [] };
  }

  // ── Set Model ───────────────────────────────────────────────────
  setModel(model) {
    this.model = model;
  }

  // ── Generate Completion (for autocomplete) ──────────────────────
  async complete(prompt, options = {}) {
    if (!this.available) return null;

    try {
      const result = await this._streamGenerate({
        model: options.model || this.model,
        prompt,
        stream: true,
        options: {
          temperature: options.temperature ?? 0.1,
          top_p: options.top_p ?? 0.9,
          num_predict: options.maxTokens ?? 50,
          stop: options.stop || ['\n', '\r', '```'],
        },
      }, options.timeout || COMPLETION_TIMEOUT);

      return result.trim();
    } catch {
      return null;
    }
  }

  // ── Chat (for explanations, NL-to-shell, etc.) ──────────────────
  async chat(messages, options = {}) {
    if (!this.available) return null;

    try {
      const res = await this._request('POST', '/api/chat', {
        model: options.model || this.model,
        messages,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.3,
          num_predict: options.maxTokens ?? 200,
        },
      }, options.timeout || 10000);

      if (res.status === 200 && res.data.message) {
        return res.data.message.content;
      }
    } catch { /* silent fail */ }

    return null;
  }

  // ── Status info ─────────────────────────────────────────────────
  getStatus() {
    return {
      available: this.available,
      model: this.model,
      models: this.models,
      baseUrl: this.baseUrl,
    };
  }
}

module.exports = new OllamaService();
