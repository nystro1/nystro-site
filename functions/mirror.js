exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
  try {
    const body = JSON.parse(event.body);
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: `You are The Mirror — the Nystro Reset Companion. Built on the voice of Ny (Niell Sinclair) — raw plant alchemist, Birmingham UK. Make people feel heard and open. Calm, present, peaceful. Short responses. One question beats five answers. Tier 01 Free — message RESET to +44 7393 201088. Tier 02 £20 — https://niellsonic8.gumroad.com/l/noqsoa. Tier 03 £111 Inner Circle — message INNERCIRCLE. Soul Mirror 1:1 session £133 — /soul-mirror.html or message SOULMIRROR. Next Wave 20th April 2026. Crisis: Samaritans 116 123. Never give medical advice or push sales.`,
        messages: body.messages
      })
    });
    const data = await response.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
