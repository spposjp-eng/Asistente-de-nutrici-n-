# NutriSalta

Asistente de nutrición para personas con artrosis, con foco en la gastronomía del NOA. Es una app web instalable (PWA) que también funciona sin internet.

## Usarla

- **Web:** abrí `nutrisalta.html` desde un hosting con HTTPS (GitHub Pages o raw.githack).
- **Instalar en el celular:**
  - Android/Chrome: botón **Instalar** arriba a la derecha, o menú ⋮ → *Instalar app*.
  - iPhone/Safari: Compartir → *Agregar a inicio*.
- La clave de Groq se pide una sola vez y queda guardada en el dispositivo.

## Sin internet

| Qué | Sin conexión |
|---|---|
| Abrir la app, diario, agua, bienestar, historial | Sí (service worker) |
| Chat | Gemini Nano (Chrome), Gemma en el teléfono (MediaPipe + WebGPU) o respuestas básicas |
| Estimar calorías | Tabla local de alimentos del NOA |
| Analizar PDFs | Se guardan y se analizan al volver internet |
| Fotos | Necesitan internet |

Gemma se descarga una vez desde *Perfil → Instalar y usar sin internet* (unos 550 MB). Si Hugging Face pide iniciar sesión, hay que descargar el archivo `-web.task` a mano y cargarlo con **Cargar archivo**.

## Archivos

- `nutrisalta.html`: la app completa.
- `manifest.webmanifest`, `sw.js`, `icons/`: instalación y modo sin conexión.
- `index.html`: redirige a la app.
