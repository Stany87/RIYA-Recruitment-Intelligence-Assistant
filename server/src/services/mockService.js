const Candidate = require('../models/Candidate');
const Activity = require('../models/Activity');

/**
 * Clean up text for matching
 */
function normalize(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Handle Mock AI responses dynamically based on DB state
 */
const mockService = {
  sendMessage: async (agencyId, userId, messageText) => {
    const text = messageText.toLowerCase();
    
    // 1. Move Candidate Command Parser (e.g. "move Aarav to shortlist" or "change Priya to interview")
    if (text.includes('move') || text.includes('change') || text.includes('update')) {
      const candidates = await Candidate.find({ agencyId });
      let matchedCandidate = null;
      
      // Find candidate name in message
      for (const c of candidates) {
        const firstName = c.name.split(' ')[0].toLowerCase();
        const fullName = c.name.toLowerCase();
        if (text.includes(fullName) || text.includes(firstName)) {
          matchedCandidate = c;
          break;
        }
      }

      if (matchedCandidate) {
        // Find target stage
        let targetStage = null;
        let stageLabel = '';
        
        if (text.includes('shortlist') || text.includes('approve')) {
          targetStage = 'shortlisted';
          stageLabel = 'Shortlisted';
        } else if (text.includes('interview') || text.includes('schedule')) {
          targetStage = 'interview';
          stageLabel = 'Interview';
        } else if (text.includes('review')) {
          targetStage = 'under_review';
          stageLabel = 'Under Review';
        } else if (text.includes('reject')) {
          targetStage = 'rejected';
          stageLabel = 'Rejected';
        } else if (text.includes('hire') || text.includes('placement')) {
          targetStage = 'hired';
          stageLabel = 'Hired';
        } else if (text.includes('offer')) {
          targetStage = 'offer';
          stageLabel = 'Offer';
        }

        if (targetStage) {
          const previousStage = matchedCandidate.stage;
          matchedCandidate.stage = targetStage;
          matchedCandidate.stageHistory.push({
            stage: targetStage,
            movedBy: userId,
            movedAt: new Date(),
            note: 'Updated via RIYA AI Chat command',
          });
          await matchedCandidate.save();

          // Log activity
          await Activity.create({
            agencyId,
            entityType: 'candidate',
            entityId: matchedCandidate._id,
            action: 'stage_changed',
            performedBy: userId,
            metadata: {
              previousStage,
              newStage: targetStage,
              candidateName: matchedCandidate.name,
              viaChat: true
            },
          });

          return `✨ **Pipeline Action Executed**\n\nI have successfully moved **${matchedCandidate.name}** from *${previousStage.replace('_', ' ')}* to **${stageLabel}**.\n\n- Updated stage history in their profile.\n- Logged this change to the dashboard activity feed.`;
        }
      }
    }

    // 2. Specific Candidate Query (e.g. "tell me about Aarav" or "why flag Priya?")
    const candidates = await Candidate.find({ agencyId });
    for (const c of candidates) {
      const firstName = c.name.split(' ')[0].toLowerCase();
      const fullName = c.name.toLowerCase();
      
      if (text.includes(fullName) || text.includes(firstName)) {
        let recColor = '🟢';
        if (c.aiRecommendation === 'MAYBE') recColor = '🟡';
        if (c.aiRecommendation === 'REJECT') recColor = '🔴';

        let strengthsList = (c.aiScreeningData?.strengths || []).map(s => `*   ✅ ${s}`).join('\n');
        let gapsList = (c.aiScreeningData?.gaps || []).map(g => `*   ⚠️ ${g}`).join('\n');
        let flagsList = (c.aiScreeningData?.redFlags || []).map(f => `*   ❌ ${f}`).join('\n');

        return `### Candidate Profile: ${c.name}\n` +
          `*   **Applied for:** ${c.jobAppliedFor || 'N/A'}\n` +
          `*   **AI Score:** \`${c.aiScore}/100\`\n` +
          `*   **AI Recommendation:** ${recColor} **${c.aiRecommendation || 'NONE'}**\n` +
          `*   **Current Stage:** \`${c.stage.toUpperCase().replace('_', ' ')}\`\n\n` +
          `#### AI Screening Summary:\n` +
          `**Strengths:**\n${strengthsList || '*No specific strengths listed*'}\n\n` +
          `**Gaps:**\n${gapsList || '*No specific gaps listed*'}\n\n` +
          `**Red Flags:**\n${flagsList || '*No red flags detected*'}\n\n` +
          `*Notes: Recruiter rating override is ${c.recruiterScore ? `\`${c.recruiterScore}/10\`` : 'not set'}. Recruiter notes: "${c.recruiterNotes || 'None'}"*`;
      }
    }

    // 3. Top Candidates Query
    if (text.includes('top') || text.includes('best') || text.includes('shortlist') || text.includes('screened')) {
      const topCandidates = await Candidate.find({ agencyId })
        .sort({ aiScore: -1 })
        .limit(5);

      if (topCandidates.length === 0) {
        return `I couldn't find any candidates in your database. Click the **Import from Sheet** button on the Candidates page to load some test candidates!`;
      }

      let list = `### Top Screened Candidates\n\nHere are the highest-scoring candidates currently in the pipeline:\n\n`;
      topCandidates.forEach((c, idx) => {
        let flag = '🟢 Strong Match';
        if (c.aiScore < 80) flag = '🟡 Borderline';
        if (c.aiScore < 60) flag = '🔴 Low Match';
        list += `${idx + 1}. **${c.name}** — Score: \`${c.aiScore}/100\` (${flag})\n` +
                `   *   *Role:* ${c.jobAppliedFor}\n` +
                `   *   *Stage:* ${c.stage.replace('_', ' ')}\n`;
      });
      list += `\n*You can ask me for more details on any of these, or command me to move them (e.g. "move Aarav to interview").*`;
      return list;
    }

    // 4. Generate Interview Questions Query
    if (text.includes('question') || text.includes('interview')) {
      let role = 'Senior Backend Engineer';
      if (text.includes('data scientist') || text.includes('science') || text.includes('ai')) {
        role = 'Data Scientist (AI)';
      } else if (text.includes('product') || text.includes('pm') || text.includes('manager')) {
        role = 'Product Manager (SaaS)';
      }

      return `### Generated Interview Questions for: **${role}**\n\n` +
        `Here are 5 custom, screening-based questions for this role:\n\n` +
        `1.  **Architecture & Scale:** (Technical)\n` +
        `    *   *Question:* "Can you describe a system you built that had to support high throughput? What were the main database bottlenecks and how did you resolve them?"\n` +
        `2.  **Tech Stack Specific:** (Technical)\n` +
        `    *   *Question:* "When designing RESTful APIs in Node.js/Express, what is your preferred strategy for middleware-based request validation and global error handling?"\n` +
        `3.  **Conflict & Ownership:** (Behavioral)\n` +
        `    *   *Question:* "Tell me about a time you disagreed with a product decision or design. How did you present your case and reach a compromise?"\n` +
        `4.  **Agile Collaboration:** (Behavioral)\n` +
        `    *   *Question:* "How do you coordinate with product managers and QA to ensure requirements are clear and code is deployed safely without regression?"\n` +
        `5.  **Role Adaptability:** (Situational)\n` +
        `    *   *Question:* "If a critical production service crashes during off-hours and you are the first responder, what diagnostic steps do you take first?"`;
    }

    // 5. Default General Greeting / Guide
    return `👋 **Hello! I am RIYA**, your AI Recruitment Assistant.\n\n` +
      `I am currently running in **Demo Mode**. You can connect me to your live Relevance AI agent by entering your credentials in **Settings**.\n\n` +
      `Since we are in demo mode, I can help you search and manage your database candidates. Try asking me:\n\n` +
      `*   *"Who are the top candidates in the pipeline?"*\n` +
      `*   *"Tell me about Priya Sharma"* (or any other candidate)\n` +
      `*   *"Generate interview questions for Senior Backend Engineer"*\n` +
      `*   *"Move Aarav Patel to shortlist"* (this will update the database!)`;
  },
};

module.exports = mockService;
