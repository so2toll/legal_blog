import type { APIRoute } from 'astro';
import { createSession } from '../../lib/stores/signing-session';

// Store widget configurations in memory (in production, use database)
const widgetConfigs = new Map();

export const POST: APIRoute = async ({ request }) => {
  try {
    const config = await request.json();
    
    // Validate required fields
    if (!config.clientId || !config.formType) {
      return new Response(JSON.stringify({
        error: 'Client ID and Form Type are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create widget configuration
    const widgetId = `${config.clientId}-${config.formType}`;
    const widgetConfig = {
      id: widgetId,
      clientId: config.clientId,
      formType: config.formType,
      
      // Form settings
      docusealTemplate: config.docusealTemplate || 'demo-template',
      formTitle: config.formTitle || 'Complete Your Form',
      formDescription: config.formDescription || 'Please fill out all required fields.',
      
      // Styling
      primaryColor: config.primaryColor || '#4CAF50',
      accentColor: config.accentColor || '#2196F3',
      widgetHeight: config.widgetHeight || '600',
      showLogo: config.showLogo !== false,
      whiteLabel: config.whiteLabel === true,
      
      // Integration settings
      webhookUrl: config.webhookUrl || null,
      successMessage: config.successMessage || 'Thank you! Your form has been submitted successfully.',
      redirectUrl: config.redirectUrl || null,
      
      // Metadata
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    
    // Store configuration
    widgetConfigs.set(widgetId, widgetConfig);
    
    return new Response(JSON.stringify({
      success: true,
      widgetId,
      widgetUrl: `/widget/${config.clientId}/${config.formType}`,
      config: widgetConfig
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Widget creation error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to create widget configuration'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Export for use in widget pages
export function getWidgetConfig(clientId: string, formType: string) {
  const widgetId = `${clientId}-${formType}`;
  return widgetConfigs.get(widgetId) || null;
}