export async function getUser() {
    try {
        const res = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include'
        });

        if (!res.ok) return null;

        const data = await res.json();
        return data;
    } catch (e) {
        return null;
    }
}
