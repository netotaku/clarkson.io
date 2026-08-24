const EMAIL_MAX_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const jsonResponse = (body: Record<string, unknown>, status: number) =>
    Response.json(body, {
        status,
        headers: {
            'Cache-Control': 'no-store',
        },
    });

export const isValidEmail = (value: unknown): value is string => {
    if (typeof value !== 'string') return false;

    const email = value.trim();

    return email.length > 0 && email.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(email);
};

export default async (request: Request) => {
    if (request.method !== 'POST') {
        return new Response(null, {
            status: 405,
            headers: { Allow: 'POST' },
        });
    }

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return jsonResponse({ ok: false, error: 'invalid_request' }, 400);
    }

    const email = typeof body === 'object' && body !== null && 'email' in body
        ? (body as { email: unknown }).email
        : undefined;

    if (!isValidEmail(email)) {
        return jsonResponse({ ok: false, error: 'invalid_email' }, 400);
    }

    const apiKey = process.env.EMAILOCTOPUS_API_KEY;
    const listId = process.env.EMAILOCTOPUS_LIST_ID;

    if (!apiKey || !listId) {
        console.error('EmailOctopus subscription is not configured.');
        return jsonResponse({ ok: false, error: 'subscription_unavailable' }, 500);
    }

    try {
        const response = await fetch(
            `https://api.emailoctopus.com/lists/${encodeURIComponent(listId)}/contacts`,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email_address: email.trim().toLowerCase() }),
            },
        );

        if (response.ok) {
            return jsonResponse({ ok: true }, 200);
        }

        if (response.status === 409) {
            return jsonResponse({ ok: true, alreadyExists: true }, 200);
        }

        console.error(`EmailOctopus subscription failed with status ${response.status}.`);
        return jsonResponse({ ok: false, error: 'subscription_failed' }, 502);
    } catch {
        console.error('EmailOctopus subscription request failed.');
        return jsonResponse({ ok: false, error: 'subscription_failed' }, 502);
    }
};
