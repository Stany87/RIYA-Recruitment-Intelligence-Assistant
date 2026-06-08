/**
 * Service to call the Relevance AI Agent Trigger API.
 */
const relevanceService = {
  sendMessage: async (agency, userId, messageText) => {
    const { riyaAgentId, riyaApiKey, riyaProjectId, riyaRegionCode } = agency.settings;

    if (!riyaAgentId || !riyaApiKey || !riyaProjectId || !riyaRegionCode) {
      throw new Error('Relevance AI credentials are not fully configured in settings.');
    }

    const endpoint = `https://api-${riyaRegionCode}.stack.tryrelevance.com/latest/agents/trigger`;
    const authHeader = `${riyaProjectId}:${riyaApiKey}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          message: {
            role: 'user',
            content: messageText,
          },
          agent_id: riyaAgentId,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Relevance AI returned status ${response.status}: ${errText}`);
      }

      const json = await response.json();

      // Robust response parsing
      let replyText = '';
      if (json.output?.answer) {
        replyText = json.output.answer;
      } else if (typeof json.output === 'string') {
        replyText = json.output;
      } else if (json.message?.content) {
        replyText = json.message.content;
      } else if (json.response?.output) {
        replyText = json.response.output;
      } else {
        replyText = JSON.stringify(json.output || json);
      }

      return replyText;
    } catch (error) {
      console.error('Relevance AI API error:', error);
      throw new Error(`Relevance AI connection failed: ${error.message}`);
    }
  },

  /**
   * Simple connection check for settings testing
   */
  testConnection: async (agentId, apiKey, projectId, regionCode) => {
    const endpoint = `https://api-${regionCode}.stack.tryrelevance.com/latest/agents/trigger`;
    const authHeader = `${projectId}:${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        message: {
          role: 'user',
          content: 'ping',
        },
        agent_id: agentId,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    return true;
  }
};

module.exports = relevanceService;
