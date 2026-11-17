// ---------------------------------------------------------------------------
// Inicio de sesión · Veterinaria Sonrisas
// Envía usuario y contraseña a POST /auth/login. Si son correctos guarda el
// token y el perfil (usuario + permisos) en sessionStorage y abre el panel.
// La sesión dura lo que la pestaña abierta o lo que tarde en vencer el token.
// ---------------------------------------------------------------------------
const SESSION_TOKEN = 'vet_token';
const SESSION_PROFILE = 'vet_perfil';
const API_DEFAULT = 'http://localhost:3000';

const $ = (selector) => document.querySelector(selector);

function apiBase() {
    return ($('#apiBase').value.trim() || API_DEFAULT).replace(/\/$/, '');
}

function showError(message) {
    const error = $('#loginError');
    error.textContent = message;
    error.classList.toggle('hidden', !message);
}

async function login(event) {
    event.preventDefault();
    const form = event.currentTarget;
    showError('');
    if (!form.reportValidity()) return;

    const base = apiBase();
    localStorage.setItem('vet_api_base', base);
    const button = $('#loginSubmit');
    button.disabled = true;
    button.textContent = 'Ingresando…';
    try {
        const response = await fetch(`${base}/auth/login`, {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombreUsuario: $('#nombreUsuario').value.trim(), contrasena: $('#contrasena').value }),
        });
        const body = await response.json().catch(() => null);
        if (!response.ok) {
            const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
            throw new Error(message || `Error HTTP ${response.status}`);
        }
        sessionStorage.setItem(SESSION_TOKEN, body.token);
        sessionStorage.setItem(SESSION_PROFILE, JSON.stringify({ usuario: body.usuario, permisos: body.permisos }));
        window.location.replace('dashboard.html');
    } catch (error) {
        const offline = error instanceof TypeError;
        showError(offline ? `No se pudo conectar con ${base}. Verifica que el backend esté encendido.` : error.message);
        $('#contrasena').value = '';
        $('#contrasena').focus();
    } finally {
        button.disabled = false;
        button.textContent = 'Ingresar';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem(SESSION_TOKEN)) {
        window.location.replace('dashboard.html');
        return;
    }
    $('#apiBase').value = localStorage.getItem('vet_api_base') || API_DEFAULT;
    $('#loginForm').addEventListener('submit', login);
});
