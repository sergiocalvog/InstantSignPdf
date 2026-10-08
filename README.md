# ✍️ InstantSign PDF - Extensión de Google Chrome

> **Firma, anota y cumplimenta documentos PDF de forma 100% privada, en local y offline.**  
> Sin servidores externos, sin suscripciones y sin enviar tus documentos a la nube (Zero-Knowledge).

---

## 🚀 Cómo instalar la extensión en Google Chrome (Modo Desarrollador)

Sigue estos sencillos pasos para probar y utilizar la extensión en tu navegador Google Chrome:

### Paso 1: Instalar dependencias y compilar
Si acabas de clonar o descargar el repositorio, abre la terminal en esta carpeta y ejecuta:
```bash
npm install
npm run build
```
Esto generará la carpeta `dist/` con todo el código compilado y los recursos de la extensión (Manifest V3, Service Worker, fuentes CMap offline e iconos).

### Paso 2: Cargar la extensión en Chrome
1. Abre Google Chrome y ve a:
   ```text
   chrome://extensions
   ```
2. En la esquina superior derecha, activa el interruptor **"Modo de desarrollador"** (*Developer mode*).
3. Haz clic en el botón **"Cargar descomprimida"** (*Load unpacked*) en la barra superior izquierda.
4. En el explorador de archivos, selecciona la carpeta **`dist`** dentro de este proyecto:
   ```text
   C:\Users\scalvo\dev\InstantSignPdf\dist
   ```
5. ¡Listo! Verás la extensión **InstantSign PDF** instalada.
6. (Opcional recomendado) En la barra de herramientas de Chrome, pulsa el icono del puzzle 🧩 y fija 📌 **InstantSign PDF** para tenerla siempre accesible. Al pulsar su icono, se abrirá la aplicación en una pestaña lista para firmar.

---

## 🛠️ Scripts disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local con Vite (para previsualizar en navegador web). |
| `npm run build` | Compila y empaqueta la extensión en la carpeta `dist/` lista para Chrome. |
| `npm run package:extension` | Compila y genera el archivo comprimido `instantsign-chrome-extension.zip` para publicar en la Chrome Web Store. |
| `npm run clean` | Limpia las carpetas `dist/` y los archivos zip generados. |
| `npm run lint` | Ejecuta la comprobación estricta de tipos de TypeScript (`tsc --noEmit`). |

---

## 📁 Estructura del Proyecto

El proyecto ha sido organizado de manera limpia y modular:

```text
InstantSignPdf/
├── dist/                     # Extensión compilada (carpeta que se carga en Chrome)
│   ├── assets/               # JS, CSS y Web Worker de PDF.js
│   ├── cmaps/                # Mapas de fuentes CMap para visualización 100% offline
│   ├── icons/                # Iconos de la extensión en todas las resoluciones
│   ├── background.js         # Service Worker en segundo plano (Manifest V3)
│   ├── index.html            # Punto de entrada de la interfaz
│   └── manifest.json         # Manifiesto de la extensión Chrome (Manifest V3)
├── public/                   # Recursos estáticos copiados a dist durante el build
│   ├── cmaps/                # Fuentes CMap offline de PDF.js
│   ├── icons/                # Iconos PNG (16, 32, 48, 128 px)
│   ├── background.js         # Service Worker origen
│   └── manifest.json         # Configuración del Manifest V3
├── scripts/                  # Utilidades y automatizaciones
│   ├── clean.js              # Script de limpieza multiplataforma
│   ├── generate-icons.js     # Generador procedural de iconos PNG
│   ├── package-extension.js  # Empaquetador automático a ZIP (Node.js)
│   └── package-extension.py  # Empaquetador alternativo (Python)
├── src/                      # Código fuente de la aplicación React + TypeScript
│   ├── components/           # Componentes UI (Visor PDF, Pad de firma, Presets, etc.)
│   ├── i18n/                 # Sistema de internacionalización (Español, Inglés, etc.)
│   ├── services/             # Lógica de almacenamiento local y exportador PDF
│   ├── App.tsx               # Componente principal y barra de herramientas
│   ├── main.tsx              # Renderizado de React
│   └── types.ts              # Tipos TypeScript del dominio
├── store-assets/             # Recursos listos para la ficha de Chrome Web Store (1280x800, 440x280)
│   ├── screenshot-1-upload-1280x800.png
│   ├── screenshot-2-editor-1280x800.png
│   ├── screenshot-1-framed-1280x800.png
│   ├── screenshot-2-framed-1280x800.png
│   └── promo-tile-440x280.png
├── index.html                # Plantilla HTML base
├── package.json              # Dependencias y scripts de npm
├── tsconfig.json             # Configuración del compilador TypeScript
└── vite.config.ts            # Configuración de empaquetado Vite + Tailwind CSS
```

---

## 🎨 Recursos gráficos para Chrome Web Store (`store-assets/`)

Dentro de la carpeta `store-assets/` tienes todas las imágenes con las dimensiones y formato exactos (PNG RGB 24-bit sin transparencia) requeridos por Google:

| Archivo | Dimensiones | Dónde se usa en el Developer Dashboard |
| :--- | :---: | :--- |
| `screenshot-1-upload-1280x800.png` | 1280 × 800 px | Captura 1: Pantalla principal de subida y privacidad. |
| `screenshot-2-editor-1280x800.png` | 1280 × 800 px | Captura 2: Editor con firma, sellos y documento de muestra. |
| `screenshot-1-framed-1280x800.png` | 1280 × 800 px | Alternativa estilizada de la Captura 1 en marco de navegador. |
| `screenshot-2-framed-1280x800.png` | 1280 × 800 px | Alternativa estilizada de la Captura 2 en marco de navegador. |
| `promo-tile-440x280.png` | 440 × 280 px | Mosaico promocional pequeño para destacar la extensión. |
| `public/icons/icon128.png` | 128 × 128 px | Icono oficial de la extensión en la tienda. |

---

## 🔒 Privacidad y Funcionamiento 100% Local (Zero-Knowledge)

- Todos los PDFs, firmas manuscritas, nombres y DNIs se procesan **únicamente en la memoria de tu navegador**.
- Las fuentes y mapas tipográficos (`cmaps`) están incluidos de forma local en la extensión: no se realiza ninguna petición de red a CDNs externos.
- Puedes utilizar la extensión sin conexión a Internet (en aviones, zonas sin cobertura, o entornos de alta seguridad).
