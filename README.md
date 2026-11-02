# Mis Beneficios

Página que muestra los descuentos y beneficios de mis tarjetas (CMR Elite Black, Visa Infinite BICE, Go BICE y Pluxee), por día, por mes y por tarjeta.
Es un archivo HTML estático: no necesita servidor ni cuenta. Los favoritos y la lista de Pluxee se guardan en cada dispositivo.

## Estructura

| Carpeta o archivo | Qué es |
|---|---|
| `data/tarjetas.json` | Mis tarjetas y sus colores |
| `data/beneficios.json` | Beneficios que no son restaurantes CMR (BICE, Pluxee, beneficios fijos) |
| `data/restaurantes-cmr.txt` | Restaurantes con descuento CMR, una línea por oferta |
| `data/meta.json` | Fecha de la última actualización y de la próxima |
| `src/template.html` | La página (diseño y código) |
| `build.mjs` | Junta `data/` con la página y genera `index.html` |
| `tools/leer-panguiapp.js` | Cómo leer la lista de restaurantes con el navegador |

## Actualizar

```bash
node build.mjs
```

Genera `index.html`. Después se sube a GitHub y GitHub Pages lo publica solo.
Cada mes la tarea programada "Actualizar Mis Beneficios" busca las ofertas nuevas, edita `data/`, corre `build.mjs` y sube los cambios.

Todos los descuentos de restaurantes CMR vienen de páginas que juntan ofertas, no del banco, así que figuran como "Confirmar en el banco".
