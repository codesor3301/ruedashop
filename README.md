# Sin Rueda Tecnológica — Landing

Rediseño de la landing de **Sin Rueda Tecnológica**, tienda de sistemas y código fuente listo para usar (CRUDs, punto de venta, webs) en Python, PHP, Java, C#, Laravel y más.

Sitio estático (HTML + CSS + JS, sin build) listo para GitHub Pages.

## Características

- **Tema claro y oscuro** con toggle, persistido en `localStorage` y respetando `prefers-color-scheme`.
- **Tipografía dev**: Bricolage Grotesque (títulos) + Geist (cuerpo) + JetBrains Mono (acentos técnicos).
- Catálogo de 8 productos con enlace directo a la tienda real.
- Proceso de despliegue, stack de tecnologías, perfil del fundador y FAQ.
- Responsive, accesible (WCAG AA), con animaciones que respetan `prefers-reduced-motion`.

## Estructura

```
index.html      Landing principal
styles.css      Sistema de diseño (tokens OKLCH, dos temas)
app.js          Toggle de tema, menú móvil, reveals
404.html        Página de error
assets/         Imágenes (logos, portadas de productos, stack, perfil)
PRODUCT.md      Contexto estratégico (impeccable)
DESIGN.md       Sistema visual (impeccable)
```

## Desarrollo local

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

## Despliegue

Publicado con GitHub Pages desde la rama `main`.
