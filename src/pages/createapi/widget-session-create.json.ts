// Widget Session Creation API - Following existing createapi pattern
// Creates widget sessions for external clients

import type { APIRoute } from 'astro';
import { createSession } from '../../lib/stores/persistent-session-store.js';
import { ApiClientService } from '../../lib/services/api-clients.js';

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('Widget session creation API called');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    // Extract client credentials from headers
    const clientId = request.headers.get('X-Client-Id');
    const clientSecret = request.headers.get('X-Client-Secret');
    
    // Validate client credentials (simplified for now)
    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({
        message: 'error',
        error: 'Missing client credentials',
        details: 'X-Client-Id and X-Client-Secret headers are required'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate client credentials using dynamic client service
    const validation = ApiClientService.validateClient(clientId, clientSecret);
    if (!validation.valid) {
      return new Response(JSON.stringify({
        message: 'error',
        error: 'Invalid client credentials',
        details: validation.error
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const client = validation.client;
    console.log('Client validation successful:', client.name);
    
    // Record client usage
    ApiClientService.recordUsage(clientId);
    
    // Validate required fields
    const { userRole, userId, userName, userEmail, metadata = {} } = body;
    
    if (!userRole || !userId || !userName) {
      return new Response(JSON.stringify({
        message: 'error',
        error: 'Missing required fields',
        details: 'userRole, userId, and userName are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate role
    if (!['advocate', 'victim'].includes(userRole)) {
      return new Response(JSON.stringify({
        message: 'error',
        error: 'Invalid user role',
        details: 'userRole must be either "advocate" or "victim"'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create widget session using existing session store pattern
    const sessionData = {
      agentId: userId,
      sessionType: 'widget',
      customerData: {
        name: userName,
        email: userEmail
      },
      templateId: metadata.templateId || 'widget-template',
      widgetUserRole: userRole,  // Store at root level for easier access
      metadata: {
        ...metadata,
        widgetUserRole: userRole,  // Also keep in metadata for backward compatibility
        clientId,
        clientName: client.name,
        clientOrigin: request.headers.get('Origin') || 'unknown'
      }
    };
    
    // Store session using persistent session store
    let session;
    try {
      session = await createSession(sessionData);
      console.log('Widget session created:', session.sessionId);
    } catch (error: any) {
      console.error('Error creating session:', error);
      return new Response(JSON.stringify({
        message: 'error',
        error: 'Failed to create session',
        details: error.message || 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const sessionId = session.sessionId;
    
    // Build widget URL
    const baseUrl = getBaseUrl(request);
    const widgetUrl = `${baseUrl}/widget/embed/${sessionId}`;
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
    
    // Return success response following your pattern
    const response = {
      message: 'success',
      data: {
        sessionId,
        widgetUrl,
        expiresAt,
        embedOptions: {
          iframe: {
            src: widgetUrl,
            width: "100%",
            height: "700px",
            frameBorder: "0"
          },
          javascript: {
            scriptUrl: `${baseUrl}/widget.js`,
            sessionId: sessionId
          }
        },
        metadata: {
          userRole,
          userId,
          userName,
          userEmail,
          clientId,
          clientName: client.name,
          createdAt: session.timestamps?.created
        }
      }
    };
    
    console.log('Widget session creation successful:', response);
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Client-Id, X-Client-Secret'
      }
    });
    
  } catch (error: any) {
    console.error('Widget session creation error:', error);
    
    return new Response(JSON.stringify({
      message: 'error',
      error: 'Internal server error',
      details: error.message || 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Handle preflight OPTIONS requests
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Client-Id, X-Client-Secret'
    }
  });
}

function getBaseUrl(request: Request) {
  // First try to use the Origin header from the client request
  // This ensures the widget URL matches the client's host/port
  const origin = request.headers.get('Origin');
  if (origin && origin !== 'null') {
    console.log('Using Origin header for base URL:', origin);
    return origin;
  }

  // Fallback to request URL if no Origin header
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  console.log('Using request URL for base URL:', baseUrl);
  return baseUrl;
}