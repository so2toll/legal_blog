import type { APIRoute } from 'astro';

// Store submissions in memory (in production, use database)
const submissions = new Map();

export const POST: APIRoute = async ({ request }) => {
  try {
    const submissionData = await request.json();
    
    // Validate submission
    if (!submissionData.sessionId || !submissionData.clientId || !submissionData.formType) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: sessionId, clientId, formType'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create submission record
    const submission = {
      id: submissionData.sessionId,
      clientId: submissionData.clientId,
      formType: submissionData.formType,
      data: submissionData.data,
      status: 'submitted',
      submittedAt: submissionData.submittedAt || new Date().toISOString(),
      reviewStatus: 'pending',
      reviewedAt: null,
      reviewedBy: null,
      metadata: {
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        referer: request.headers.get('referer')
      }
    };
    
    // Store submission
    submissions.set(submission.id, submission);
    
    console.log(`New widget submission received: ${submission.clientId}/${submission.formType} - ${submission.id}`);
    
    // TODO: Send webhook notification if configured
    // await sendWebhookNotification(submission);
    
    return new Response(JSON.stringify({
      success: true,
      submissionId: submission.id,
      status: 'submitted',
      message: 'Form submitted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Widget submission error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to process form submission'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Export for use in admin dashboard
export function getSubmissions(clientId?: string) {
  const allSubmissions = Array.from(submissions.values());
  
  if (clientId) {
    return allSubmissions.filter(sub => sub.clientId === clientId);
  }
  
  return allSubmissions.sort((a, b) => 
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

export function getSubmission(submissionId: string) {
  return submissions.get(submissionId) || null;
}

export function updateSubmissionStatus(submissionId: string, status: string, reviewedBy?: string) {
  const submission = submissions.get(submissionId);
  if (submission) {
    submission.reviewStatus = status;
    submission.reviewedAt = new Date().toISOString();
    submission.reviewedBy = reviewedBy || null;
    submissions.set(submissionId, submission);
    return submission;
  }
  return null;
}