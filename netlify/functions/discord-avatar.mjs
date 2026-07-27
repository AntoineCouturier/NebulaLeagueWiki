const DISCORD_API_BASE = "https://discord.com/api/v10";
const DISCORD_CDN_BASE = "https://cdn.discordapp.com";
const USER_ID_PATTERN = /^\d{17,20}$/;

function jsonResponse(body, status = 200, extraHeaders = {}) {
    return Response.json(body, {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "X-Content-Type-Options": "nosniff",
            ...extraHeaders
        }
    });
}

export default async function discordAvatar(request) {
    if (request.method !== "GET") {
        return jsonResponse({ error: "Méthode non autorisée." }, 405, {
            Allow: "GET"
        });
    }

    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) {
        return jsonResponse({ error: "Connexion Discord indisponible." }, 503);
    }

    const userId = new URL(request.url).searchParams.get("userId")?.trim() || "";
    if (!USER_ID_PATTERN.test(userId)) {
        return jsonResponse({ error: "Identifiant Discord invalide." }, 400);
    }

    try {
        const discordResponse = await fetch(`${DISCORD_API_BASE}/users/${userId}`, {
            headers: {
                Accept: "application/json",
                Authorization: `Bot ${token}`,
                "User-Agent": "DiscordBot (https://nebulaleague.netlify.app, 1.0)"
            }
        });

        if (discordResponse.status === 404) {
            return jsonResponse({ error: "Utilisateur Discord introuvable." }, 404);
        }

        if (!discordResponse.ok) {
            const retryAfter = discordResponse.headers.get("retry-after");
            return jsonResponse(
                { error: "Discord n’a pas pu fournir cet avatar." },
                discordResponse.status === 429 ? 503 : 502,
                retryAfter ? { "Retry-After": retryAfter } : {}
            );
        }

        const user = await discordResponse.json();
        const avatarUrl = user.avatar
            ? `${DISCORD_CDN_BASE}/avatars/${user.id}/${user.avatar}.webp?size=1024`
            : `${DISCORD_CDN_BASE}/embed/avatars/${Number((BigInt(user.id) >> 22n) % 6n)}.png`;

        return jsonResponse(
            {
                userId: user.id,
                avatarUrl
            },
            200,
            {
                "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
                "Netlify-CDN-Cache-Control": "public, durable, s-maxage=3600, stale-while-revalidate=86400"
            }
        );
    } catch {
        return jsonResponse({ error: "Connexion à Discord impossible." }, 502);
    }
}

export const config = {
    path: "/api/discord-avatar"
};
