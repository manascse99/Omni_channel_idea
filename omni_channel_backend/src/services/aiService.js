const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

/**
 * Basic wrapper to call Ollama generate API
 */
async function callOllama(prompt, systemContext = '') {
  try {
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: OLLAMA_MODEL,
      system: systemContext,
      prompt: prompt,
      stream: false
    });
    return response.data.response;
  } catch (error) {
    console.error('Ollama API Error:', error.message);
    return null;
  }
}

/**
 * AI Pipeline: Extract Intent, Sentiment, Summary, and Reply
 */
async function processMessage(messageContent, conversationHistory = []) {
  const historyText = conversationHistory.map(m => `${m.senderType.toUpperCase()}: ${m.content}`).join('\n');
  
  const systemPrompt = `
You are the AI brain behind OmniBank, a modern digital bank. Your job is to process customer messages.
Given the customer message and conversation history, return a JSON object with EXACTLY these keys:
- "intent": a short string like "loan_inquiry", "balance_check", "grievance", or "general"
- "sentiment": "positive", "neutral", or "negative"
- "summary": a 2-3 sentence summary of the entire conversation thread so far
- "reply": a natural, helpful reply draft from the bank to the customer
Return ONLY valid JSON. Do not include markdown formatting or extra text.
  `;

  const userPrompt = `
Conversation History:
${historyText}

Latest Customer Message:
${messageContent}

Return the JSON block.
  `;

  const rawResponse = await callOllama(userPrompt, systemPrompt);
  
  if (!rawResponse) {
    return {
      intent: 'general',
      sentiment: 'neutral',
      summary: 'Error processing context via AI',
      reply: 'We are experiencing high traffic. An agent will be with you shortly.'
    };
  }

  try {
    // Attempt to parse the JSON. 
    // Sometimes LLaMA wraps it in markdown like ```json ... ```
    const cleanJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Failed to parse Ollama JSON:", rawResponse);
    return {
      intent: 'general',
      sentiment: 'neutral',
      summary: 'AI processed',
      reply: 'Thanks for reaching out. We will get back to you.'
    };
  }
}

module.exports = {
  processMessage,
  callOllama
};
