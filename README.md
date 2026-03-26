# Monopoly Deal - Next.js 15

Proyecto base de Monopoly Deal creado con Next.js 15, Tailwind CSS y animaciones con Framer Motion.

## Requisitos

- Node.js 20+
- npm

## Scripts

- `npm run dev` - inicia entorno de desarrollo
- `npm run build` - compila para producción
- `npm run start` - ejecuta build de producción
- `npm run lint` - valida código con ESLint

## Cartas

Coloca tus imágenes en `public/img`.

Ejemplo de ruta pública:

- `public/img/carta-azul-1.png` → `/img/carta-azul-1.png`

## Pantalla inicial

La home en `app/page.tsx` incluye:

- Resumen del objetivo y reglas principales
- Secciones de zonas de juego
- Efecto visual de cartas con transiciones (hover + entrada)
