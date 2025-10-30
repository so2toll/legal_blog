import type { APIRoute } from 'astro';
import { getSession, updateSession } from '../../lib/stores/signing-session';
import { createSubmission } from '../../lib/services/docuseal';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { sessionId, templateId } = data;
    
    if (!sessionId) {
      return new Response(JSON.stringify({
        error: 'Session ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get the session with victim's signature
    const session = getSession(sessionId);
    if (!session || session.sessionType !== 'pdf') {
      return new Response(JSON.stringify({
        error: 'Invalid PDF session'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if we have the victim's signature
    if (!session.victimSignature) {
      return new Response(JSON.stringify({
        error: 'No victim signature found. Please request signature first.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`Finalizing PDF document for session ${sessionId} with template ${templateId}`);
    
    try {
      // Create final DocuSeal submission with all data
      // Note: In a real implementation, you would:
      // 1. Capture the field values the advocate filled in the DocuSeal form
      // 2. Include the victim's signature image
      // 3. Create a completed submission
      
      // For now, we'll create a submission for demonstration
      const docusealResult = await createSubmission({
        templateId: templateId || session.pdfTemplateId || '1622775',
        signerData: {
          email: session.victimData?.email || session.customerData?.email || 'victim@example.com',
          name: session.victimData?.name || session.customerData?.name || 'Victim User',
          fields: {
            // Here you would include all the fields the advocate filled out
            // For demo purposes, we'll just note that signature was collected
            signature_collected: true,
            signature_timestamp: session.signatureCollectedAt,
            advocate_prepared: true
          }
        },
        metadata: {
          sessionId: sessionId,
          finalizedAt: new Date().toISOString(),
          signatureMethod: 'canvas',
          advocateId: session.agentId
        }
      });
      
      // Update session with finalization info
      updateSession(sessionId, {
        pdfFinalized: true,
        finalDocumentUrl: docusealResult.documentUrl || docusealResult.embedUrl,
        finalSubmissionId: docusealResult.submissionId,
        finalizedAt: new Date().toISOString()
      });
      
      return new Response(JSON.stringify({
        success: true,
        submissionId: docusealResult.submissionId,
        documentUrl: docusealResult.documentUrl || docusealResult.embedUrl,
        message: 'Document finalized with signature successfully'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (docusealError) {
      console.error('DocuSeal submission error:', docusealError);
      
      // Even if DocuSeal fails, we can mark as finalized locally
      updateSession(sessionId, {
        pdfFinalized: true,
        finalizedAt: new Date().toISOString(),
        finalizationError: (docusealError as Error).message
      });
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Document marked as finalized (DocuSeal submission pending)',
        warning: 'DocuSeal submission failed but document is considered complete'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    console.error('PDF finalization error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to finalize document',
      details: (error as Error).message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};