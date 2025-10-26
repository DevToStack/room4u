// lib/cookies.js
export function parseCookies(cookieHeader) {
    if (!cookieHeader) return {};
    return Object.fromEntries(
        cookieHeader.split(";").map((c) => {
            const [k, v] = c.trim().split("=");
            return [k, decodeURIComponent(v)];
        })
    );
}
