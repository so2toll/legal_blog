import type { APIRoute } from 'astro';
import { createSubmission, getTemplateDetails } from '../../lib/services/docuseal';
import { getSession, updateSession } from '../../lib/stores/signing-session';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { sessionId, victimData } = data;
    
    if (!sessionId) {
      return new Response(JSON.stringify({
        error: 'Session ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get the session to get template info
    const session = getSession(sessionId);
    if (!session || session.sessionType !== 'pdf') {
      return new Response(JSON.stringify({
        error: 'Invalid PDF session'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get template details to determine submitter role
    const templateDetails = await getTemplateDetails(session.templateId);
    const firstSubmitter = templateDetails.submitters?.[0];
    const submitterRole = firstSubmitter?.name || 'First Party';
    
    console.log(`Creating DocuSeal submission for session ${sessionId}, template ${session.templateId}`);
    
    // Create DocuSeal submission for the victim
    const docusealSubmission = await createSubmission({
      templateId: session.templateId,
      signerData: {
        email: victimData?.email || 'victim@example.com',
        name: victimData?.name || 'Victim User',
        role: submitterRole
      },
      metadata: {
        sessionId: sessionId,
        requestedAt: new Date().toISOString()
      }
    });
    
    // Update session with submission info
    updateSession(sessionId, {
      signatureRequested: true,
      signatureData: {
        victimSigningUrl: docusealSubmission.embedUrl,
        signerSlug: docusealSubmission.signerSlug,
        submissionId: docusealSubmission.submissionId,
        method: 'pdf-docuseal'
      },
      docuSeal: {
        submissionId: docusealSubmission.submissionId,
        signerSlug: docusealSubmission.signerSlug,
        templateId: session.templateId,
        signedAt: null,
        documentUrl: null
      },
      status: 'signature_requested'
    });
    
    return new Response(JSON.stringify({
      success: true,
      submissionId: docusealSubmission.submissionId,
      signerSlug: docusealSubmission.signerSlug,
      victimSigningUrl: docusealSubmission.embedUrl,
      message: 'Signature request created successfully',
      method: 'pdf-docuseal',
      pattern: 'DocuSeal Submission'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('PDF signature request error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create signature request',
      details: (error as Error).message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};