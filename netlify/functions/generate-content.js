const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const { user } = context.clientContext;

  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized: You must be logged in.' }),
    };
  }

  if (!user.email.endsWith('@riseandrank.com')) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Forbidden: Access is restricted to authorized users.' }),
    };
  }
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('API key is not set on the server.');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            // === THIS LINE IS UPDATED BASED ON THE NEW DOCS ===
            model: 'claude-sonnet-4-20250514', // 
            max_tokens: 4096,
            messages: [{ role: 'user', content: prompt }],
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return {
            statusCode: response.status,
            body: JSON.stringify({ error: errorData.error.message }),
        };
    }

    const data = await response.json();

    return {
        statusCode: 200,
        body: JSON.stringify({ content: data.content[0].text }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};