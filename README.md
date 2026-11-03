# Caminando con la Historia · Tomé

Prototipo web adaptable a Android, iPhone y escritorio, desarrollado con React y Vite. No necesita cuentas, claves de API ni base de datos. No es todavía una aplicación publicada en las tiendas.

## Versión actual

**1.0.0 — Prototipo de Tomé.** Características, correcciones y limitaciones: [Historial de cambios](CHANGELOG.md). Numeración y publicación de las siguientes versiones: [Versionado](docs/versionado.md). El número también aparece en el pie de la aplicación.

## Ver el prototipo sin instalar nada

Abre `prototipo.html` en Chrome, Safari, Edge o Firefox. Este archivo incluye la aplicación compilada, estilos, fuentes e ilustraciones; no requiere terminal ni Node.js. También puedes descargarlo y abrirlo con doble clic. El mapa base necesita conexión, pero hay una vista esquemática si no se puede descargar.

El `index.html` de la raíz es la entrada de desarrollo de Vite: no debe abrirse por separado como una página estática. La vista previa integrada del chat puede tener restricciones propias; el archivo autónomo se puede abrir en un navegador externo.

## Ejecutar

Requisitos: Node.js 22.12 o superior y npm. Validado con Node.js 24.19.0.

```sh
cd /workspace/Caminando-con-la-Historia
npm ci --cache /tmp/caminando-npm-cache
npm run dev
```

El servidor escucha en el puerto 5173. `npm start` es un alias de `npm run dev`. Para compilar: `npm run build`, que actualiza `dist/` y regenera `prototipo.html`. Para servir la compilación: `npm run preview`. La compilación usa rutas relativas para alojarla también en un subdirectorio.

## Qué puedes probar

- Selector de ciudad (Tomé disponible; otras ciudades pendientes).
- Mapa con cinco paradas, categorías, búsqueda, notas promedio y clasificación en cada marcador. La lista se actualiza al mover o ampliar el mapa; «Ver comuna» recupera la vista general.
- Inicio: el mapa solicita la ubicación y la marca como «Estás aquí», sin lugar seleccionado ni tarjeta. En teléfono se muestra el mapa antes de la lista. Si el permiso se deniega, se permite explorar Tomé sin inventar un origen.
- Al tocar un marcador o lugar, se calcula una ruta a pie desde el GPS, si está disponible. La historia no se abre automáticamente: se accede con «Descubrir su historia» en el panel del sitio. Bellavista conserva fotos, biografía de Werner, enlaces, narración y reel.
- Fotografías seleccionadas y verificadas: fachada de Bellavista (Génesis Domínguez Elgorriaga, CC BY-SA 4.0) y retrato de Carlos Werner (dominio público según Wikimedia Commons). Están incluidas localmente y en el HTML autónomo, con créditos y enlaces a las fichas y licencias. Se pueden ampliar en la misma página; si falla una imagen, aparece una nota descriptiva con su enlace exacto.
- Batalla de San Rafael y mestizo Alejo: segunda ficha de ejemplo, disponible en la categoría Batallas.
- Guardados persistentes en el navegador y recorrido orientativo de cinco paradas.
- Ubicación opcional y seguimiento mientras la app está abierta, con permiso del navegador. «Cerca de mí» filtra a 500 m, 1 km o 3 km y ordena por cercanía. Se requiere HTTPS o un contexto local seguro. La ubicación no se guarda entre sesiones.
- «Cómo llegar»: calcula rutas a pie o en auto dentro de la app, desde el GPS o desde otro punto del recorrido. Dibuja la geometría por calles/caminos y presenta distancia, duración estimada e indicaciones. Tres enlaces separados a Google Maps permiten consultar locomoción, congestión y alternativas de ruta.
- Valoraciones de 1 a 5 con sugerencia de mejora obligatoria, comentario opcional y promedio actualizado en el mapa. Se guardan en este dispositivo y pueden eliminarse; no son valoraciones compartidas entre usuarios ni datos de Google.
- Bellavista ofrece fondos textiles de ejemplo: Espiga, Escocés y Lino. Son patrones CSS originales, no diseños oficiales de la marca. El contenido permanece sobre una superficie clara. Hay botones «Volver al mapa» arriba, siempre visible al desplazarse, y al final de la lectura; se conservan filtros, selección y mapa.

Las ilustraciones, tipografías y ambas fotografías se sirven localmente; no hace falta consultar Wikimedia para verlas. Se descargaron los JPEG originales y se revisaron sus metadatos de autoría/licencia el 23 de octubre de 2026. Se conserva la atribución y la condición de CompartirIgual de la foto de la fábrica; el retrato conserva la clasificación de dominio público de su ficha. Los archivos se incluyen sin editar. Detalles y fuentes: [Créditos de fotografías](docs/creditos-fotografias.md). Los enlaces de ampliación histórica y de derechos sí requieren conexión. También se pudieron consultar Wikipedia y la reseña de Werner en BCN; el texto sigue siendo una síntesis breve para prototipo.

El mapa base utiliza OpenStreetMap y CARTO y necesita acceso a `a.basemaps.cartocdn.com`, `b.basemaps.cartocdn.com`, `c.basemaps.cartocdn.com` y `d.basemaps.cartocdn.com`. Si la red bloquea las teselas, aparece una vista esquemática identificada como tal, con los mismos marcadores seleccionables. El mapa integrado usa Leaflet/OpenStreetMap/CARTO. El cálculo de rutas utiliza el servicio público **OSRM de FOSSGIS**, sin cuenta ni clave para este prototipo, con dos servidores: `https://routing.openstreetmap.de/routed-foot/route/v1/driving/…` para caminar y `…/routed-car/route/v1/driving/…` para auto. Aunque el segmento técnico se llama `driving` en ambos, el perfil lo determina el servidor (`routed-foot` o `routed-car`), tal como figura en el [código oficial del frontend FOSSGIS](https://github.com/fossgis-routing-server/osrm-frontend/blob/gh-pages/src/leaflet_options.js). Se usan respuestas GeoJSON e indicaciones de la [API OSRM](https://github.com/Project-OSRM/osrm-backend/blob/master/docs/http.md).

Al elegir un lugar se consulta una vez la ruta a pie si ya hay ubicación; si el GPS aún está pendiente, se espera a su primera posición válida. No se hacen peticiones al iniciar el mapa ni con cada cambio posterior del GPS. Sin ubicación se puede elegir una partida y calcular manualmente. Cambiar transporte también permite calcular manualmente. Hay separación mínima entre solicitudes, cancelación al cambiar partida/transporte y caché temporal en memoria. Si cambia la ubicación, se pide recalcular; no se modifica el tiempo de una ruta vieja como si fuera nueva. Una respuesta fallida o incompleta no se sustituye por una línea recta presentada como ruta. Los tiempos son estimaciones del motor, sin congestión en vivo. La selección de puntos y sus accesos requieren validación local antes de una publicación turística.

Los enlaces oficiales de Google Maps (Maps URLs) son consultas separadas, sin clave: locomoción transmite `travelmode=transit`, congestión abre la capa de tráfico y comparar rutas transmite la partida, el destino y el modo elegido. No se solicita Google Maps Platform ni openrouteservice; se comprobó que no hay claves de esos servicios configuradas. Si crece el uso, se debe contratar un servicio de rutas o alojar un motor propio: el servidor público compartido es para este piloto y no ofrece capacidad ilimitada ni disponibilidad garantizada.

Para usar rutas en línea hace falta conexión a `routing.openstreetmap.de`. El dominio ya figura en la configuración publicada y se pudieron verificar consultas reales desde esta instancia, con TLS validado y respuesta HTTP 200: desde Plaza de Armas a Bellavista, el servidor peatonal devolvió 2294,8 metros, 1839,7 segundos y 69 coordenadas; el de auto devolvió 2048,4 metros, 207,4 segundos y 93 coordenadas. Son resultados del momento de la consulta, no rutas fijas del prototipo. Ambos entregaron `Access-Control-Allow-Origin: *`. El archivo autónomo consulta el servicio directamente desde el navegador donde se abre y necesita conexión y confianza HTTPS. Las pruebas de interfaz siguen usando respuestas controladas para ser repetibles.

En esta instancia se verificó una tesela real de CARTO con HTTP 200 y validación TLS desde Python. Chromium automatizado rechaza el certificado de la conexión interceptada del entorno (`ERR_CERT_AUTHORITY_INVALID`), por lo que sus capturas muestran la vista esquemática. No se desactivó TLS ni se cambió la confianza del navegador. La carga directa de teselas en ese navegador queda sin verificar; el archivo autónomo mantiene el proveedor y el fallback para abrirse en un navegador externo.

## Alcance del contenido

Los textos son borradores para revisar con especialistas locales. Bellavista incluye una referencia al Consejo de Monumentos Nacionales. La consulta documental de San Rafael no pudo completarse desde la red de este entorno: su ubicación, cronología y detalles deben verificarse antes de publicación. La ficha no sitúa la batalla en Tomé y no tiene marcador ni forma parte del recorrido a pie.

Los reels son secuencias ilustradas con reproducción y controles de escenas, no videos filmados. La narración usa `speechSynthesis`; depende de las voces instaladas en el dispositivo. La posición de Bellavista usa las coordenadas publicadas en Wikipedia, contrastadas con la ubicación de la fotografía. Las demás ubicaciones siguen siendo orientativas, en particular la parada conceptual del mercado. El botón «Comenzar recorrido» de cinco paradas conserva un trazado orientativo entre puntos, distinto de las rutas por calles calculadas por OSRM en «Cómo llegar». Sus 75 minutos son una estimación de demostración. Las indicaciones de OSRM son una lista consultable, sin navegación por voz giro a giro.

El manifiesto proporciona nombre, icono y apertura independiente cuando el navegador lo permite. No hay service worker ni garantía de funcionamiento sin conexión.

## Pruebas

```sh
npm test
```

Primero ejecuta `npm run build` para actualizar el archivo autónomo. Playwright comprueba los flujos en escritorio y tamaño iPhone con Chromium: lectura y escenas, San Rafael sin marcador, persistencia de guardados, búsqueda y recorrido, controles de audio con API simulada y HTML autónomo con las peticiones adicionales bloqueadas y dentro de un iframe sin almacenamiento. Bellavista incluye pruebas de selección del lugar y apertura opcional de su historia, biografía, decodificación de las fotografías reales con la red externa bloqueada, ampliación en la misma página, créditos y enlaces de licencia, y nota descriptiva con enlace si falla una imagen. El navegador administrado bloquea las direcciones `file://`: el HTML se valida como una única respuesta y mediante `srcdoc`, sin servicios externos. Las pruebas del mapa inyectan ubicaciones con la geolocalización del navegador de Playwright y comprueban cambios al desplazarse, radio, permiso denegado, zoom, modos de transporte, enlaces, promedio/persistencia de valoraciones, fondo y regreso al mapa. También se prueba el cálculo integrado con respuestas OSRM de prueba: dibujo, distancia, tiempo, indicaciones, perfiles de pie/auto, cancelación de respuestas antiguas, ausencia de origen, límites de uso, respuesta incompleta, actualización GPS y HTML autónomo. No se ejecuta una navegación real de Google ni se comprueba tráfico en vivo. También se verifica el arranque sin tarjetas, la solicitud de ubicación inicial, el cálculo peatonal automático al tocar el icono, el permiso denegado y el regreso de la historia a la ruta sin recalcular. La salida de voz real y Safari/Android físicos requieren una prueba en dispositivo.

La configuración usa `CHROMIUM_PATH` si se indica; de lo contrario, `/usr/bin/chromium` si existe o el Chromium de Playwright. En otro sistema, ejecuta `npx playwright install chromium` (en Linux puede requerir `--with-deps`) o indica la ruta de un ejecutable instalado. Las pruebas arrancan Vite si no hay un servidor existente. `npm run version:check` comprueba el historial y los números antes de publicar. GitHub Actions repite compilación y pruebas; las etiquetas `vX.Y.Z` generan una Release con descargas si pasan sus comprobaciones.

## Archivos principales

- `src/main.jsx`: pantallas, mapa, narración, reel y estados de interacción.
- `src/ExplorerMap.jsx`: mapa, marcadores clasificados, puntuaciones y ámbito visible.
- `src/visitor.js`: geolocalización, distancia y enlaces oficiales de Google Maps.
- `src/DirectionsPanel.jsx`: rutas integradas y enlaces separados a Google Maps.
- `src/routing.js`: cliente OSRM, validación de geometría, indicaciones, cancelación y caché temporal.
- `src/reviews.jsx`: formulario, promedio y almacenamiento local de valoraciones.
- `src/data.js`: fichas históricas, categorías y ubicaciones.
- `src/styles.css`: interfaz adaptable y estilos visuales.
- `src/assets/bellavista.svg` y `src/assets/battle.svg`: ilustraciones conceptuales del prototipo, incluidas en la compilación.

Usa el checkout existente: cada tarea cloud ya está aislada y no necesita crear un worktree.
