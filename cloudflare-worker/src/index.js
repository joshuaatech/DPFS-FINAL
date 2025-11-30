/**
 * Cloudflare Worker - Disease Prediction API
 * Production-ready worker that proxies requests to external ML service
 * and serves the frontend application
 * 
 * Features:
 * - CORS support
 * - Request validation
 * - Error handling
 * - Health checks
 * - Request timeouts
 */

/**
 * Main request handler
 */
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return handleCORS();
      }

      // API routes
      if (path.startsWith('/api/')) {
        return await handleAPI(request, env);
      }

      // Serve frontend
      return await serveFrontend(request, env);
    } catch (error) {
      console.error('Worker error:', error);
      return createErrorResponse('Internal Server Error', 500, error.message);
    }
  }
};

/**
 * Handle API requests - proxy to ML service
 */
async function handleAPI(request, env) {
  const mlServiceUrl = env.ML_SERVICE_URL;
  const apiTimeout = parseInt(env.API_TIMEOUT) || 30000;

  if (!mlServiceUrl) {
    return createErrorResponse(
      'ML Service Not Configured',
      500,
      'ML_SERVICE_URL environment variable is not set. Configure it in Cloudflare Dashboard.',
      { configuration: 'missing' }
    );
  }

  const url = new URL(request.url);
  const path = url.pathname;

  // Health check endpoint
  if (path === '/api/' || path === '/api') {
    return await healthCheck(mlServiceUrl);
  }

  // Proxy API requests
  return await proxyRequest(request, mlServiceUrl, path, apiTimeout);
}

/**
 * Health check for the API
 */
async function healthCheck(mlServiceUrl) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${mlServiceUrl}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeout);
    const healthData = await response.json();

    return new Response(
      JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        worker: {
          environment: 'production',
          version: '1.0.0',
          region: 'cloudflare-edge'
        },
        ml_service: {
          url: mlServiceUrl,
          status: response.ok ? 'connected' : 'error',
          health: healthData
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...getCORSHeaders(),
          'Cache-Control': 'no-cache'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'degraded',
        timestamp: new Date().toISOString(),
        worker: {
          environment: 'production',
          version: '1.0.0',
          region: 'cloudflare-edge'
        },
        ml_service: {
          url: mlServiceUrl,
          status: 'disconnected',
          error: error.message
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...getCORSHeaders(),
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
}

/**
 * Proxy request to ML service
 */
async function proxyRequest(request, mlServiceUrl, path, timeout) {
  try {
    const url = new URL(request.url);
    const apiPath = path.replace('/api', '');
    const queryString = url.search;
    const targetUrl = `${mlServiceUrl}${apiPath}${queryString}`;

    // Get request body if present
    let body = null;
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
      body = await request.text();
      
      // Validate JSON if present
      if (body) {
        try {
          JSON.parse(body);
        } catch (e) {
          return createErrorResponse('Invalid JSON', 400, 'Request body must be valid JSON');
        }
      }
    }

    // Setup abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Forward request to ML service
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CloudflareWorker/1.0'
      },
      body: body,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Get response data
    const responseData = await response.text();

    // Return response with CORS headers
    return new Response(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        ...getCORSHeaders()
      }
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      return createErrorResponse(
        'Request Timeout',
        504,
        'ML service took too long to respond'
      );
    }
    return createErrorResponse(
      'Service Connection Error',
      502,
      `Failed to connect to ML service: ${error.message}`
    );
  }
}

/**
 * Serve frontend application
 */
async function serveFrontend(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  // For single-page app, serve index.html for root and unknown routes
  if (path === '/' || path === '/index.html' || !path.includes('.')) {
    // Try to serve index.html from public directory if using Cloudflare Pages
    // For now, return welcome page with API information
    return serveWelcomePage(env);
  }

  // For static assets (if deployed together), would be served here
  return new Response('Not Found', {
    status: 404,
    headers: getCORSHeaders()
  });
}

/**
 * Serve welcome page with API information
 */
function serveWelcomePage(env) {
  const mlServiceUrl = env.ML_SERVICE_URL || 'Not configured';
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Disease Prediction System - API</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: #1a1a1a;
      border-radius: 20px;
      padding: 40px;
      max-width: 700px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      color: #fff;
    }
    h1 {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 20px;
      font-size: 2.5em;
    }
    .status {
      padding: 15px;
      background: #2a2a2a;
      border-radius: 10px;
      margin: 20px 0;
      border-left: 4px solid #667eea;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 12px;
      background: #667eea;
      border-radius: 20px;
      font-size: 0.9em;
      margin-right: 10px;
    }
    .endpoints {
      margin: 30px 0;
    }
    .endpoint {
      padding: 15px;
      background: #2a2a2a;
      border-radius: 10px;
      margin: 10px 0;
      border-left: 3px solid #764ba2;
    }
    .method {
      display: inline-block;
      padding: 4px 8px;
      background: #667eea;
      border-radius: 4px;
      font-weight: bold;
      font-size: 0.85em;
      margin-right: 10px;
    }
    code {
      background: #0a0a0a;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Monaco', 'Courier New', monospace;
      color: #aaa;
    }
    a {
      color: #667eea;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      margin-top: 20px;
      border: none;
      cursor: pointer;
      font-size: 1em;
    }
    .button:hover {
      opacity: 0.9;
    }
    .deployment-info {
      margin-top: 30px;
      padding: 15px;
      background: #2a2a2a;
      border-radius: 10px;
      border-left: 4px solid #764ba2;
    }
    .ml-service-status {
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🏥 Disease Prediction API</h1>
    
    <div class="status">
      <span class="status-badge">✓ API Active</span>
      Cloudflare Worker is running and ready to serve requests.
    </div>

    <p>Welcome to the Disease Prediction System API running on Cloudflare Workers!</p>

    <h2 style="margin-top: 30px; color: #667eea;">API Endpoints</h2>
    <div class="endpoints">
      <div class="endpoint">
        <div><span class="method">GET</span> <code>/api/</code></div>
        <p style="margin-top: 8px; color: #aaa;">Health check - Returns status of API and ML service</p>
      </div>
      <div class="endpoint">
        <div><span class="method">GET</span> <code>/api/symptoms</code></div>
        <p style="margin-top: 8px; color: #aaa;">Get list of all available symptoms</p>
      </div>
      <div class="endpoint">
        <div><span class="method">POST</span> <code>/api/predict</code></div>
        <p style="margin-top: 8px; color: #aaa;">Predict disease based on symptoms (requires model)</p>
      </div>
      <div class="endpoint">
        <div><span class="method">GET</span> <code>/api/models</code></div>
        <p style="margin-top: 8px; color: #aaa;">Get list of available prediction models</p>
      </div>
    </div>

    <button class="button" onclick="testAPI()">Test API Health</button>

    <div class="deployment-info">
      <h3 style="color: #667eea; margin-bottom: 15px;">Deployment Information</h3>
      <p><strong>Backend ML Service:</strong></p>
      <p style="word-break: break-all; color: #aaa; margin-top: 8px;">${mlServiceUrl}</p>
      
      <p style="margin-top: 15px;"><strong>Frontend:</strong></p>
      <p style="color: #aaa; margin-top: 8px;">Deploy the frontend separately to Cloudflare Pages</p>
      
      <p style="margin-top: 15px;"><strong>Documentation:</strong></p>
      <p style="color: #aaa; margin-top: 8px;"><a href="/api/">View API Status</a></p>
    </div>
  </div>

  <script>
    async function testAPI() {
      try {
        const response = await fetch('/api/');
        const data = await response.json();
        alert('✓ API Health Check Passed\\n\\n' + JSON.stringify(data, null, 2));
      } catch (error) {
        alert('✗ API Health Check Failed\\n\\n' + error.message);
      }
    }
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
      ...getCORSHeaders()
    }
  });
}

/**
 * Handle CORS preflight requests
 */
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: getCORSHeaders()
  });
}

/**
 * Get CORS headers for responses
 */
function getCORSHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };
}

/**
 * Create standardized error response
 */
function createErrorResponse(message, status = 500, details = '', extra = {}) {
  return new Response(
    JSON.stringify({
      error: message,
      status: status,
      details: details,
      timestamp: new Date().toISOString(),
      ...extra
    }),
    {
      status: status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...getCORSHeaders()
      }
    }
  );
}

