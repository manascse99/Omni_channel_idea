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
    return null;
  }
}

/**
 * AI Pipeline: Extract Intent, Sentiment, Summary, and Reply
 */
async function processMessage(messageContent, conversationHistory = []) {
  const historyText = conversationHistory.map(m => `${m.senderType.toUpperCase()}: ${m.content}`).join('\n');
  
  const systemPrompt = `
- System: You are "OmniBank AI Monitor", a professional banking assistant.
- Task: Analyze the latest customer message within the context of the conversation history. 
- You MUST also extract any email address or phone number the user explicitly mentions.
- Response Format: Return ONLY a JSON object. No markdown, no pre-amble.
- JSON structure:
  {
    "intent": "loan_inquiry" | "complaint" | "support" | "account_access" | "fraud_alert" | "general",
    "sentiment": "positive" | "neutral" | "negative",
    "confidence": 0-100,
    "summary": "1-sentence summary of the user's current need",
    "reply": "A concise, professional bank-style draft reply",
    "extractedContacts": {
      "email": "email if found, otherwise null",
      "phone": "phone number if found, otherwise null"
    }
  }
`;

  const userPrompt = `
Conversation History:
${historyText}

Latest Message from Customer:
"${messageContent}"

JSON Response:
`;

  const rawResponse = await callOllama(userPrompt, systemPrompt);
  
  if (!rawResponse) {
    return {
      intent: 'general',
      sentiment: 'neutral',
      confidence: 50,
      summary: 'AI currently unavailable',
      reply: 'Thanks for reaching out! Our team will get back to you shortly.',
      extractedContacts: null
    };
  }

  try {
    // Robust JSON extraction
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      intent: parsed.intent || 'general',
      sentiment: parsed.sentiment || 'neutral',
      confidence: parsed.confidence || 85,
      summary: parsed.summary || 'Customer message received',
      reply: parsed.reply || 'Connecting you with an agent...',
      extractedContacts: parsed.extractedContacts || null
    };
  } catch (e) {
    console.error("AI: Failed to parse Ollama JSON. Raw:", rawResponse);
    return {
      intent: 'general',
      sentiment: 'neutral',
      confidence: 50,
      summary: 'Message received',
      reply: 'Thank you for your message. We are reviewing it now.',
      extractedContacts: null
    };
  }
}

module.exports = {
  processMessage,
  callOllama
};
