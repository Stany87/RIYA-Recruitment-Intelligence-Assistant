const relevanceService = require('./relevanceService');
const mockService = require('./mockService');

/**
 * Unified AI abstraction layer (AIService adapter pattern)
 */
const aiService = {
  sendMessage: async (agency, userId, messageText) => {
    const hasCredentials =
      agency.settings?.riyaAgentId &&
      agency.settings?.riyaApiKey &&
      agency.settings?.riyaProjectId &&
      agency.settings?.riyaRegionCode;

    if (hasCredentials) {
      console.log(`[aiService] Routing message to Relevance AI for agency: ${agency.name}`);
      try {
        return await relevanceService.sendMessage(agency, userId, messageText);
      } catch (err) {
        console.warn('[aiService] Relevance AI trigger failed. Falling back to local Mock AI.', err);
        return `⚠️ **Relevance AI Connection Error**: ${err.message}\n\n*Falling back to local Mock AI response:*\n\n` + 
               await mockService.sendMessage(agency._id, userId, messageText);
      }
    } else {
      console.log(`[aiService] No credentials found. Routing to Mock AI for agency: ${agency.name}`);
      return await mockService.sendMessage(agency._id, userId, messageText);
    }
  },
};

module.exports = aiService;
