// Build-time configuration
// API key injected via CI secrets or local override

// This gets replaced at build time by CI, or you can edit locally
export const CONFIG = {
  // Set your API key here for local testing (don't commit!)
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  
  // Or hardcode for quick testing:
  // ANTHROPIC_API_KEY: 'sk-ant-your-key-here',
};
