# Historial de versiones

Cada versión publicada tiene una etiqueta Git `vMAYOR.MENOR.CORRECCIÓN`, sus características, cambios, validación y limitaciones. La política y el procedimiento están en [Versionado](docs/versionado.md).

## Sin publicar

### Documentación

- CAM-002: se adopta un método práctico de ingeniería de software con requisitos observables, decisiones justificadas, arquitectura actual, vínculos a pruebas y cambios, y pendientes explícitos. Se documenta la incorporación gradual de una base de datos para una etapa posterior. Se actualizan las instrucciones del repositorio para mantener este rastro y explicar las observaciones al usuario. La aplicación permanece en 1.0.0; no hay cambios ejecutables.

## [1.0.0] - 2026-11-03

Primera versión del prototipo de Caminando con la Historia, centrada en Tomé. Reúne el desarrollo previo, que aún no tenía versiones guardadas en Git. Es la base para las siguientes iteraciones; no implica una aplicación turística definitiva.

### Características

- Aplicación web adaptable a teléfono y escritorio; Tomé como primera ciudad, con cinco puntos en el mapa y una ficha regional de San Rafael y el mestizo Alejo sin ubicación atribuida a Tomé.
- Mapa Leaflet con datos OpenStreetMap/CARTO, ubicación opcional del visitante y arranque sin tarjeta ni lugar seleccionado.
- Puntos clasificados, búsqueda, filtros, lista según el área visible y cercanía a 500 m, 1 km o 3 km.
- Selección de un punto con ruta automática a pie desde la primera ubicación disponible; rutas a pie o en auto desde GPS u otra parada, con distancia, tiempo estimado e indicaciones dentro de la aplicación.
- Enlaces separados a Google Maps para locomoción, congestión y alternativas de ruta.
- Apertura voluntaria de la historia y regreso al mapa conservando filtros y ruta.
- Bellavista: reseña breve, fotografías locales con fuente y condiciones de uso, ampliación, biografía relacionada de Carlos Werner y referencias externas.
- Lectura, narración con voz del dispositivo, reel ilustrado y fondos textiles originales de ejemplo.
- Guardados y valoraciones locales de 1 a 5 con sugerencia de mejora obligatoria; promedio en los marcadores, comentarios opcionales y eliminación de valoraciones.
- Archivo autónomo `prototipo.html` con código, estilos, fuentes e imágenes incorporados, y compilación web en `dist/`.

### Cambios

- Se consolida el desarrollo existente como primera versión numerada; no se inventan versiones anteriores.
- Al elegir desde la lista en teléfono, la vista vuelve al mapa para mostrar el lugar y su panel.
- Activar el recorrido orientativo limpia la selección y la ruta individual anterior, y cancela el cálculo pendiente al cerrar su panel.
- Se incluyen todos los controles de formulario habilitados y visibles en el manejo del foco de la ventana de historia.
- El manifiesto utiliza rutas relativas para alojar el sitio también en una subcarpeta.
- El número de versión visible se toma de `package.json` durante la compilación.
- Se incorporan política de versiones, comprobación de coherencia, pruebas portables y un flujo de GitHub Actions que verifica cada cambio y publica descargas al recibir una etiqueta de versión.

### Validación

- Instalación reproducible con `npm ci`, compilación de producción y regeneración del HTML autónomo.
- **58 pruebas aprobadas** (29 en escritorio y 29 en tamaño de teléfono) en Chromium para mapa inicial, GPS permitido/denegado, selección, rutas, errores, cancelaciones, lectura, fotografías, audio simulado, reel, favoritos, valoraciones y regreso al mapa.
- Consultas reales a los servicios peatonal y de auto OSRM: HTTP 200, respuesta `Ok`, geometría y CORS disponibles, con validación TLS.
- `npm audit`: sin vulnerabilidades reportadas en las dependencias instaladas al preparar esta versión.
- Comprobación de coherencia entre paquete, lockfile, historial y etiqueta de publicación.
- Los servicios de rutas y la voz se simulan en las pruebas repetibles; no equivalen a una prueba en terreno ni en Safari/iPhone o Android físicos.

### Limitaciones

- Las valoraciones y los guardados pertenecen al navegador actual; no hay cuentas, servidor propio ni promedio compartido entre visitantes.
- Internet necesario para teselas y rutas. Los proveedores públicos no garantizan disponibilidad ilimitada. El esquema de respaldo no sustituye un mapa geográfico sin conexión.
- El GPS requiere permiso y un contexto seguro compatible. No hay navegación por voz giro a giro ni tráfico o transporte público integrados.
- San Rafael y varias reseñas/ubicaciones necesitan validación histórica y local. El recorrido de cinco paradas y sus 75 minutos son orientativos.
- Los reels son escenas ilustradas; la narración depende de las voces instaladas. No hay aplicación nativa publicada ni funcionamiento completo sin conexión.
