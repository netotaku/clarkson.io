export async function handler() {
  try {
    const response = await fetch('https://zenquotes.io/api/random');

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to fetch quote' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(await response.json()),
    };
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch quote' }),
    };
  }
}
