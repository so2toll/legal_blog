import type { APIRoute } from 'astro';
import { createSession } from '../../lib/stores/signing-session';
import { createSubmission } from '../../lib/services/docuseal';

export const POST: APIRoute = async ({ request }) => {

  try {
    const data = await request.json();
    
    if (!data.customerData?.name || !data.customerData?.email) {
      return new Response(JSON.stringify({
        error: 'Name and email are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    const session = createSession(data);
    
    try {
      const docuSealResult = await createSubmission({
        templateId: data.templateId || import.meta.env.DOCUSEAL_TEMPLATE_ID || 'default',
        signerData: {
          email: data.customerData.email,
          name: data.customerData.name,
          fields: {}
        },
        metadata: {
          sessionId: session.sessionId,
          agentId: data.agentId
        }
      });
      
      session.docuSeal.submissionId = docuSealResult.submissionId;
      session.docuSeal.signerSlug = docuSealResult.signerSlug;
      
    } catch (docuSealError) {
      console.error('DocuSeal submission creation failed:', docuSealError);
    }
    
    // Use the origin header or x-forwarded-host to get the correct base URL
    const origin = request.headers.get('origin') || 
                   `http://${request.headers.get('x-forwarded-host')}` || 
                   'http://localhost:3000';
    const customerUrl = `${origin}/sign/${session.sessionId}`;
    
    return new Response(JSON.stringify({
      sessionId: session.sessionId,
      customerUrl,
      openReplaySessionId: session.openReplay.sessionId,
      status: session.status
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Session creation error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to create session'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};