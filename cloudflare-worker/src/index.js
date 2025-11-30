/**
 * Cloudflare Worker - Disease Prediction API
 * Lightweight proxy that calls external ML service
 */

// ML Service URL from environment variable
const ML_SERVICE_URL = '';

/**
 * Main request handler
 */
export default {
  async fetch(request, env, ctx) {
    // Get ML service URL from environment or default
    const mlServiceUrl = env.ML_SERVICE_URL || ML_SERVICE_URL;
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route requests
      if (path.startsWith('/api/')) {
        return handleAPI(request, mlServiceUrl, path);
      } else if (path === '/' || path === '/index.html') {
        return serveFrontend(env);
      } else {
        return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: 'Internal Server Error', 
          message: error.message 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json', ...getCORSHeaders() }
        }
      );
    }
  }
};

/**
 * Handle API requests - proxy to ML service
 */
async function handleAPI(request, mlServiceUrl, path) {
  if (!mlServiceUrl) {
    return new Response(
      JSON.stringify({
        error: 'ML_SERVICE_URL not configured',
        message: 'Please set ML_SERVICE_URL in Cloudflare Worker environment variables'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...getCORSHeaders() }
      }
    );
  }

  // Health check endpoint
  if (path === '/api/' || path === '/api') {
    try {
      const healthResponse = await fetch(`${mlServiceUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const healthData = await healthResponse.json();
      
      return new Response(
        JSON.stringify({
          status: 'ok',
          message: 'Cloudflare Worker API is running',
          ml_service: {
            url: mlServiceUrl,
            status: healthResponse.ok ? 'connected' : 'disconnected',
            health: healthData
          }
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...getCORSHeaders() }
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          status: 'ok',
          message: 'Cloudflare Worker API is running',
          ml_service: {
            url: mlServiceUrl,
            status: 'disconnected',
            error: error.message
          }
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...getCORSHeaders() }
        }
      );
    }
  }

  // Proxy other API requests to ML service
  const apiPath = path.replace('/api', '');
  const targetUrl = `${mlServiceUrl}${apiPath}${request.url.split('?')[1] ? '?' + request.url.split('?')[1] : ''}`;

  try {
    // Get request body if present
    let body = null;
    if (request.method === 'POST' || request.method === 'PUT') {
      body = await request.text();
    }

    // Forward request to ML service
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(request.headers.entries())
      },
      body: body
    });

    // Get response data
    const data = await response.text();
    
    // Return response with CORS headers
    return new Response(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders()
      }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to connect to ML service',
        message: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...getCORSHeaders() }
      }
    );
  }
}

/**
 * Serve frontend HTML
 * For Cloudflare Workers, frontend should be deployed separately on Cloudflare Pages
 * This function redirects to the Pages deployment or serves a simple message
 */
async function serveFrontend(env) {
  // Option 1: Redirect to Cloudflare Pages frontend (if deployed separately)
  const pagesUrl = env.PAGES_URL || '';
  if (pagesUrl) {
    return Response.redirect(pagesUrl, 302);
  }
  
  // Option 2: Return simple message with instructions
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Disease Prediction API</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      color: white;
    }
    .container {
      background: rgba(26, 26, 26, 0.9);
      padding: 40px;
      border-radius: 20px;
      max-width: 600px;
      text-align: center;
    }
    h1 { margin: 0 0 20px 0; }
    p { line-height: 1.6; margin: 15px 0; }
    .api-link {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 24px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🏥 Disease Prediction API</h1>
    <p><strong>API is running!</strong></p>
    <p>This is the API endpoint. The frontend should be deployed separately on Cloudflare Pages.</p>
    <p>API endpoints:</p>
    <ul style="text-align: left; display: inline-block;">
      <li><code>GET /api/</code> - Health check</li>
      <li><code>GET /api/symptoms</code> - Get symptoms</li>
      <li><code>POST /api/predict</code> - Predict disease</li>
    </ul>
    <a href="/api/" class="api-link">Test API →</a>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      ...getCORSHeaders()
    }
  });
}

/**
 * Handle CORS preflight
 */
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: getCORSHeaders()
  });
}

/**
 * Get CORS headers
 */
function getCORSHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };
}

