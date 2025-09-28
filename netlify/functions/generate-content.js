const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  // --- User Authentication Check ---
  const { user } = context.clientContext;
  if (!user || !user.email.endsWith('@riseandrank.com')) {
    return {
      statusCode: user ? 403 : 401,
      body: JSON.stringify({ error: user ? 'Forbidden' : 'Unauthorized' }),
    };
  }

  // --- Method Check ---
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // --- CRITICAL CHANGE #1: Read 'messages' instead of 'prompt' ---
    const { messages } = JSON.parse(event.body);
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set on the server.');
    }
    
    // Check if messages exist and is an array
    if (!messages || !Array.isArray(messages)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Request body must contain a 'messages' array." }),
        };
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            model: 'claude-3-5-sonnet-latest', // Using the recommended latest model
            max_tokens: 4096,
            // --- CRITICAL CHANGE #2: Pass the entire 'messages' array ---
            messages: messages, 
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Anthropic API Error:", errorData);
        return {
            statusCode: response.status,
            body: JSON.stringify({ error: `Anthropic API error: ${errorData.error.message}` }),
        };
    }

    const data = await response.json();

    return {
        statusCode: 200,
        body: JSON.stringify({ content: data.content[0].text }),
    };

  } catch (error) {
    console.error("Serverless Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};