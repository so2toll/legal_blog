import type { APIRoute } from 'astro';
import { updateSession } from '../../lib/stores/signing-session';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    if (!data.sessionId) {
      return new Response(JSON.stringify({
        error: 'Session ID is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    const DOCUSEAL_API_URL = import.meta.env.DOCUSEAL_API_URL || 'https://api.docuseal.com';
    const DOCUSEAL_EMBED_URL = import.meta.env.DOCUSEAL_EMBED_URL || (DOCUSEAL_API_URL.includes('docuseal.com') ? 'https://docuseal.com' : DOCUSEAL_API_URL);
    const updatedSession = updateSession(data.sessionId, {
      status: 'completed',
      timestamps: {
        completed: new Date().toISOString()
      },
      docuSeal: {
        signedAt: new Date().toISOString(),
        documentUrl: `${DOCUSEAL_EMBED_URL}/demo/signed-document.pdf`
      }
    });
    
    return new Response(JSON.stringify({
      sessionId: updatedSession.sessionId,
      status: updatedSession.status,
      completedAt: updatedSession.timestamps.completed
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Session completion error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to complete session'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};