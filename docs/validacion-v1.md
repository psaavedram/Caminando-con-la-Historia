# Revisión de la versión 1.0.0

Fecha: 3 de noviembre de 2026. Entorno: Node.js 24.19.0, npm 11.9.0, Chromium en Linux. Resultado: compilación correcta y **58 pruebas aprobadas**, 29 por tamaño de pantalla.

| Función acordada | Qué se verificó | Pruebas |
| --- | --- | --- |
| Inicio con ubicación y sin tarjeta | Permiso autorizado/denegado, marcador del visitante, ausencia de selección y de consultas de ruta al iniciar | `map-first.spec.js` |
| Tocar un punto | Ruta automática a pie, GPS que llega después, historia solo al solicitarla | `map-first.spec.js` |
| Rutas dentro de la aplicación | Pie/auto, geometría, tiempos, partida manual, errores, cancelación y ubicación que cambia | `routing.spec.js` |
| Mapa y cercanía | Radios, cambio de posición, zoom/listado y enlaces separados a Google Maps | `visitor.spec.js` |
| Historia Bellavista | Lectura, fotos locales, ampliación, atribución/licencia y enlace alternativo ante fallos | `bellavista.spec.js` |
| Audio y reel | Texto enviado al sintetizador, pausa/detención y controles de escenas | `explore.spec.js` |
| Guardados y valoraciones | Persistencia local, promedio en mapa, sugerencia obligatoria y eliminación | `explore.spec.js`, `visitor.spec.js` |
| Regreso al mapa | Conservación de filtros y ruta, sin recalcular al cerrar la historia | `visitor.spec.js`, `map-first.spec.js` |
| Paseo de demostración | Trazado orientativo y cancelación de la ruta individual anterior | `explore.spec.js`, `map-first.spec.js` |
| Archivo autónomo | Recursos incorporados, arranque sin almacenamiento y rutas sin descargar código adicional | `standalone.spec.js`, `routing.spec.js` |

Se ejecutó instalación con lockfile, `npm run version:check`, `npm run build`, `npm test` y `npm audit` (sin vulnerabilidades reportadas en ese momento). El YAML del flujo de GitHub Actions se pudo analizar correctamente; su ejecución en GitHub depende del servicio y de los permisos del repositorio.

También se consultaron los dos servidores públicos de rutas desde Plaza de Armas a Bellavista con validación TLS: ambos devolvieron HTTP 200, código `Ok` y CORS `*`. El perfil peatonal devolvió 2294,8 m y 1839,7 s; el de auto 2048,4 m y 207,4 s. Son comprobaciones puntuales, no valores fijados en la aplicación ni una garantía de disponibilidad futura.

Las pruebas de interfaz utilizan geolocalización y respuestas de rutas controladas para poder repetirse; el audio utiliza una API simulada. El tamaño de teléfono se prueba con Chromium, no con Safari. Sigue pendiente validar en teléfonos físicos, comprobar accesos y recorridos en terreno y revisar las fuentes históricas señaladas en README y CHANGELOG. La restricción de certificados del Chromium administrado descrita en README sigue aplicando a las teselas externas; no se desactivó TLS.
