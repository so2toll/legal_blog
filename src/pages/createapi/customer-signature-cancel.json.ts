import type { APIRoute } from 'astro';
import { updateSession, getSession } from '../../lib/stores/signing-session';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return new Response(JSON.stringify({
        error: 'Session ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const session = getSession(sessionId);
    if (!session) {
      return new Response(JSON.stringify({
        error: 'Session not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Clear signature request to stop modal from reopening
    updateSession(sessionId, {
      signatureRequested: false,
      signatureCancelled: true
    });
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Signature request cancelled'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Customer signature cancel error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to cancel signature'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};