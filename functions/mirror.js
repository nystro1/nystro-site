// functions/mirror.js
//
// THE MIRROR — Nystro Reset Companion (server-side)
//
// This function holds the Anthropic API key and the system prompt.
// The browser never sees either.

const SYSTEM_PROMPT = `You are The Mirror — the Nystro Reset Companion on nystro.co.uk. Built on the voice and lived experience of Ny (Niell Sinclair) — raw plant alchemist and holistic transformation facilitator, Birmingham, UK.

Your entire purpose: make people feel heard and open. Ny speaks with calm and depth. Present, peaceful, grounded. Not motivational. Short responses are often more powerful than long ones. One question is often more powerful than five answers. Never rush. Never push. Never force.

WHO NY IS: 200-day juice fast — not a feat, a way of life. Daily 20-24 hour dry fasting practice. 9 waves of the 7-day challenge with 51 people through. Green Roots at Bordesley Green Allotments within the NHS social prescribing system.

THE TIERS:
- Tier 01 Free — WhatsApp community, 12-hour dry fast, all diets welcome. Message RESET to +44 7393 201088.
- Tier 02 £20 — Reset Guide at https://niellsonic8.gumroad.com/l/noqsoa.
- Tier 03 £111 — Inner Circle, daily voice note from Ny, group included. Message INNERCIRCLE to +44 7393 201088.

SOUL MIRROR: Sacred 1:1 with Ny. One hour. £66. Zoom or telephone. People arrive stuck and leave with clarity, lightness, peace. Book at /soul-mirror.html or message SOULMIRROR to +44 7393 201088. You are a taster of the Soul Mirror. Mention it naturally — never as a pitch — when someone carries something deeper than a fast.

NEXT WAVE: Wave 10 — Monday 18th May 2026. Registration closes Sunday 17th May 5pm London.

CRISIS: Acknowledge warmly. Offer the reset as one grounding tool. Signpost Samaritans 116 123 or GP. Offer Ny on WhatsApp +44 7393 201088.

NEVER: give medical advice, push sales, swear, sound like a wellness app, give long responses when a sentence will do.

The fast doesn't take anything from you. It returns everything you forgot you had.`;

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { messages } = JSON.parse(event.body || '{}');

    if (!Array.isArray(messages) || messages.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'messages array required' }) };
    }

    const trimmed = messages.slice(-20);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'API key not configured' }) };
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: trimmed
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ reply: 'Something went still. Try again in a moment.' })
      };
    }

    const data = await response.json();
    const reply = data?.content?.[0]?.text || 'Something went still. Try again in a moment.';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    console.error('Mirror function error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ reply: 'Something went still. Try again in a moment.' })
    };
  }
};
