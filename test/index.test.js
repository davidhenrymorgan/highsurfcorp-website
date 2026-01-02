import { describe, it, expect, vi, beforeEach } from 'vitest';
import worker from '../src/index.js';

// Mock sanitize-html
vi.mock('sanitize-html', () => {
  const sanitize = (str) => str.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "");
  sanitize.defaults = {
    allowedTags: ['img', 'p', 'br'],
    allowedAttributes: {}
  };
  return { default: sanitize };
});

describe('High Surf Corp Worker', () => {
  let env;
  let ctx;

  beforeEach(() => {
    env = {
      DB: {
        prepare: vi.fn(() => ({
          bind: vi.fn(() => ({
            first: vi.fn(),
            all: vi.fn(),
          })),
          first: vi.fn(),
          all: vi.fn(),
        })),
      },
      ASSETS: {
        fetch: vi.fn(),
      },
      RESEND_API_KEY: 'test-key',
      TURNSTILE_SECRET_KEY: 'test-secret',
      TURNSTILE_SITE_KEY: 'test-site-key', 
    };
    ctx = {
      waitUntil: vi.fn(),
      passThroughOnException: vi.fn(),
    };
    
    // Reset global fetch mock
    global.fetch = vi.fn();
    
    // Mock caches
    global.caches = {
      default: {
        match: vi.fn(),
        put: vi.fn(),
      }
    };
  });

  describe('Security Headers', () => {
    it('should set strict CSP headers on HTML responses', async () => {
      const request = new Request('https://highsurfcorp.com/blog');
      
      // Mock DB response for blog index
      const mockStmt = {
        bind: vi.fn().mockReturnThis(),
        all: vi.fn().mockResolvedValue({ results: [] }),
      };
      env.DB.prepare.mockReturnValue(mockStmt);

      const response = await worker.fetch(request, env, ctx);
      
      expect(response.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
      expect(response.headers.get('Content-Security-Policy')).toContain("script-src");
    });
    
    it('should set strict CORS on API responses', async () => {
       // We can test this via a mocked failed contact form submission (easier to trigger)
       const formData = new FormData(); // Empty form
       const request = new Request('https://highsurfcorp.com/api/contact', {
         method: 'POST',
         body: formData
       });
       
       const response = await worker.fetch(request, env, ctx);
       expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://highsurfcorp.com');
    });
  });

  describe('Contact Form (Turnstile)', () => {
    it('should reject submission without Turnstile token', async () => {
      const formData = new FormData();
      formData.append('name', 'Test');
      formData.append('email', 'test@example.com');
      formData.append('phone', '1234567890');
      
      const request = new Request('https://highsurfcorp.com/api/contact', {
        method: 'POST',
        body: formData
      });

      const response = await worker.fetch(request, env, ctx);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toContain('security check');
    });

    it('should validate Turnstile token', async () => {
      const formData = new FormData();
      formData.append('name', 'Test');
      formData.append('email', 'test@example.com');
      formData.append('phone', '1234567890');
      formData.append('cf-turnstile-response', 'valid-token');

      // Mock Turnstile validation success
      global.fetch.mockResolvedValueOnce({
        json: async () => ({ success: true })
      });
      
      // Mock Resend success
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'email-id' })
      });

      const request = new Request('https://highsurfcorp.com/api/contact', {
        method: 'POST',
        body: formData
      });

      const response = await worker.fetch(request, env, ctx);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        expect.any(Object)
      );
    });
  });

  describe('Blog Sanitization', () => {
    it('should sanitize blog post body', async () => {
      const request = new Request('https://highsurfcorp.com/blog/test-post');
      
      const maliciousBody = '<p>Safe</p><script>alert("XSS")</script>';
      
      // Mock DB response
      const mockPost = {
        title: 'Test',
        slug: 'test-post',
        body: maliciousBody,
        published_at: '2026-01-01'
      };
      
      const mockStmt = {
        bind: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(mockPost),
        all: vi.fn().mockResolvedValue({ results: [] }) // for related posts
      };
      env.DB.prepare.mockReturnValue(mockStmt);

      const response = await worker.fetch(request, env, ctx);
      const html = await response.text();
      
      expect(html).toContain('<p>Safe</p>');
      expect(html).not.toContain('<script>alert("XSS")</script>');
    });
  });

  describe('Static Page Caching', () => {
    it('should use Cache API for transformed pages', async () => {
      const request = new Request('https://highsurfcorp.com/legal/privacy-policy');
      
      // Mock asset fetch
      env.ASSETS.fetch.mockResolvedValue(new Response('<html><head></head><body>Privacy</body></html>', {
        headers: { 'Content-Type': 'text/html' }
      }));

      // 1. First request: Cache miss
      global.caches.default.match.mockResolvedValue(null);
      
      await worker.fetch(request, env, ctx);
      
      expect(global.caches.default.match).toHaveBeenCalled();
      expect(global.caches.default.put).toHaveBeenCalled();

      // 2. Second request: Cache hit
      global.caches.default.match.mockResolvedValue(new Response('Cached Content'));
      
      const response2 = await worker.fetch(request, env, ctx);
      const text2 = await response2.text();
      
      expect(text2).toBe('Cached Content');
    });
  });
});
