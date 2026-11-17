export function createApiClient(getBase) {
    function apiUrl(path) {
        return `${getBase().replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    }
    
    async function apiRequest(path, options = {}) {
        const response = await fetch(apiUrl(path), {
            ...options,
            headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) },
        });
        const text = await response.text();
        let body = null;
        try { body = text ? JSON.parse(text) : null; } catch { body = text; }
        if (!response.ok) {
            const messages = Array.isArray(body?.message) ? body.message.join(', ') : body?.message || body || `Error HTTP ${response.status}`;
            throw new Error(messages);
        }
        return body;
    }
    return apiRequest;
}
