// getToken: devuelve el token de la sesión (o null).
// onUnauthorized: se llama cuando la API responde 401 (sin sesión o token vencido).
export function createApiClient(getBase, { getToken = () => null, onUnauthorized = () => {} } = {}) {
    function apiUrl(path) {
        return `${getBase().replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    }

    async function apiRequest(path, options = {}) {
        const token = getToken();
        const response = await fetch(apiUrl(path), {
            ...options,
            headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
        });
        const text = await response.text();
        let body = null;
        try { body = text ? JSON.parse(text) : null; } catch { body = text; }
        if (response.status === 401) onUnauthorized();
        if (!response.ok) {
            const messages = Array.isArray(body?.message) ? body.message.join(', ') : body?.message || body || `Error HTTP ${response.status}`;
            throw new Error(messages);
        }
        return body;
    }
    return apiRequest;
}
