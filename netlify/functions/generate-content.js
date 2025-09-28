const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': 'https://riseandrank.com',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // --- User Authentication Check ---
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized - Missing token' }),
    };
  }

  // --- Method Check ---
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const { messages } = JSON.parse(event.body);
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set on the server.');
    }
    
    if (!messages || !Array.isArray(messages)) {
        return {
            statusCode: 400,
            headers,
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
            model: 'claude-3-5-sonnet-latest', 
            max_tokens: 4096,
            messages: messages,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return {
            statusCode: response.status,
            headers,
            body: JSON.stringify({ error: `Anthropic API error: ${errorData.error?.message || 'Unknown error'}` }),
        };
    }

    const data = await response.json();

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ content: data.content[0].text }),
    };

  } catch (error) {
    console.error("Serverless Function Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};