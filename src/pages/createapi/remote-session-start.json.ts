import type { APIRoute } from 'astro';
import { getBrowserService } from '../../lib/services/remote-browser';
import { createSession } from '../../lib/stores/signing-session';
import { createSubmission, getTemplateDetails } from '../../lib/services/docuseal';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { targetUrl, agentId, customerData, sessionType, pdfTemplateId, victimData } = data;
    
    // Check if this is a PDF session or browser session
    const isPdfSession = sessionType === 'pdf' || pdfTemplateId;
    
    if (!isPdfSession && !targetUrl) {
      return new Response(JSON.stringify({
        error: 'Target URL is required for browser sessions'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (isPdfSession && !pdfTemplateId) {
      return new Response(JSON.stringify({
        error: 'PDF template ID is required for PDF sessions'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create signing session
    const session = createSession({
      agentId: agentId || 'agent_' + Date.now(),
      customerData: customerData || {},
      templateId: isPdfSession ? pdfTemplateId : 'remote_browser',
      sessionType: isPdfSession ? 'pdf' : 'browser'
    });
    
    if (isPdfSession) {
      // Handle PDF session with DocuSeal - Just load template for preview
      const templateDetails = await getTemplateDetails(pdfTemplateId);
      
      // Get template slug for preview URL
      let templateSlug = templateDetails.slug;
      
      // If no slug in details, try to extract from known templates
      if (!templateSlug) {
        // For your specific template
        if (pdfTemplateId === '1622775') {
          templateSlug = 'UeDzaa2NyWJtuY';
        } else {
          // Generate a mock slug for testing
          templateSlug = 'mock_template_slug';
        }
      }
      
      // Use template preview URL (not submission URL)
      const DOCUSEAL_API_URL = import.meta.env.DOCUSEAL_API_URL || 'https://api.docuseal.com';
      const DOCUSEAL_EMBED_URL = import.meta.env.DOCUSEAL_EMBED_URL || (DOCUSEAL_API_URL.includes('docuseal.com') ? 'https://docuseal.com' : DOCUSEAL_API_URL);
      const templatePreviewUrl = `${DOCUSEAL_EMBED_URL}/d/${templateSlug}`;
      
      console.log(`Starting PDF session with template ${pdfTemplateId}, preview URL: ${templatePreviewUrl}`);
      
      // Store template info in session for later submission creation
      // Update session with additional PDF data
      session.templateSlug = templateSlug;
      session.pdfTemplateUrl = templatePreviewUrl;
      
      return new Response(JSON.stringify({
        sessionId: session.sessionId,
        status: 'pdf_session_created',
        mode: 'pdf',
        sessionType: 'pdf',
        pdfTemplateId,
        templateDetails,
        templateSlug,
        // Use template preview URL for advocate
        docusealEmbedUrl: templatePreviewUrl,
        isPreviewMode: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Handle regular browser session
      const browserService = getBrowserService();
      const browserSessionResult = await browserService.createSession(session.sessionId);
      
      // Navigate to target URL
      const screenshot = await browserService.navigateToForm(session.sessionId, targetUrl);
      
      // Get page info
      const pageInfo = await browserService.getPageInfo(session.sessionId);
    
      return new Response(JSON.stringify({
        sessionId: session.sessionId,
        status: browserSessionResult.status,
        mode: browserSessionResult.mode,
        sessionType: 'browser',
        targetUrl,
        pageInfo,
        screenshot,
        // Include Live View URLs if available (Browserbase mode)
        liveViewUrl: browserSessionResult.liveViewUrl,
        liveViewUrlWithBorders: browserSessionResult.liveViewUrlWithBorders,
        liveViewPages: browserSessionResult.liveViewPages,
        replayUrl: browserSessionResult.replayUrl,
        browserbaseSessionId: browserSessionResult.browserbaseSessionId
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    console.error('Remote session start error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to start remote session',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};