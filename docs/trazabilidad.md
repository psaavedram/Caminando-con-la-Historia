# Trazabilidad del producto

Registro iniciado el **3 de noviembre de 2026**. Los requisitos y decisiones anteriores se reconstruyen a partir de las solicitudes de esta conversación y del código publicado en [v1.0.0](https://github.com/psaavedram/Caminando-con-la-Historia/tree/v1.0.0); no son actas contemporáneas de cada conversación. La validación previa está en [validacion-v1.md](validacion-v1.md). No se inventan fechas individuales ni aprobaciones históricas.

Identificadores estables: `REQ` para necesidad, `DEC` para decisión y `CAM` para cambio. Se añade el siguiente número disponible; si una decisión cambia, se conserva la anterior como sustituida y se enlaza la nueva. Las filas implementadas describen el alcance del prototipo, no una validación en terreno.

## Requisitos y aceptación

| ID | Origen y resultado esperado | Estado / entrega | Código y evidencia |
| --- | --- | --- | --- |
| REQ-01 | Solicitud de ejemplo en Tomé: seleccionar la ciudad, explorar lugares clasificados y buscar historias. | Implementado para Tomé, v1.0.0. Más ciudades pendientes. | [Datos](../src/data.js), [pantallas](../src/main.jsx); [exploración](../tests/explore.spec.js). |
| REQ-02 | Solicitud de mapa inicial: mostrar la ubicación autorizada, sin lugar seleccionado ni tarjeta. Si se deniega el GPS, seguir explorando sin inventar una posición. | Implementado, v1.0.0. DEC-01. | [Ubicación](../src/visitor.js), [mapa](../src/ExplorerMap.jsx); [arranque](../tests/map-first.spec.js). |
| REQ-03 | Al tocar un icono, calcular una ruta a pie desde el visitante y ofrecer abrir su historia voluntariamente. Conservar la ruta al volver al mapa. | Implementado con GPS disponible; partida manual alternativa, v1.0.0. DEC-01. | [Panel](../src/DirectionsPanel.jsx), [pantallas](../src/main.jsx); [selección y regreso](../tests/map-first.spec.js). |
| REQ-04 | Consultar mapa/rutas dentro de la aplicación; locomoción, congestión y alternativas como enlaces separados a Google Maps, según acuerdo posterior. | Implementado, v1.0.0. DEC-02. Sin tráfico interno en vivo. | [Rutas](../src/routing.js), [enlaces](../src/visitor.js); [rutas](../tests/routing.spec.js), [consultas externas](../tests/visitor.spec.js). |
| REQ-05 | Descubrir puntos según cercanía o área visible del mapa, con categoría y nota promedio. | Implementado, v1.0.0. Promedio local según DEC-03. | [Mapa](../src/ExplorerMap.jsx), [pantallas](../src/main.jsx); [cercanía, zoom y promedios](../tests/visitor.spec.js). |
| REQ-06 | Bellavista: reseña breve con fotos del edificio/personaje y enlaces para ampliar sobre Carlos Werner; imágenes con condiciones de uso verificadas o enlace alternativo. | Implementado, v1.0.0. Revisión histórica local pendiente. DEC-04. | [Lectura](../src/BellavistaReading.jsx), [créditos](creditos-fotografias.md); [fotografías y enlaces](../tests/bellavista.spec.js). |
| REQ-07 | Leer, escuchar y ver reels; ejemplo de fondo textil en Bellavista. | Prototipo, v1.0.0. Voz del dispositivo, escenas ilustradas y tramas originales de ejemplo; sin videos filmados. DEC-05. | [Historia](../src/main.jsx), [estilos](../src/styles.css); [audio/reel](../tests/explore.spec.js), [fondos](../tests/visitor.spec.js). |
| REQ-08 | Calificar el lugar e incluir una sugerencia de mejora; mostrar el promedio en el mapa. | Implementado localmente, v1.0.0. Promedio compartido diferido: REQ-12. DEC-03. | [Valoraciones](../src/reviews.jsx); [obligatoriedad, promedio y persistencia](../tests/visitor.spec.js). |
| REQ-09 | Ejemplo de batalla de San Rafael con el mestizo Alejo. | Ficha regional de ejemplo, v1.0.0. Falta validación documental y geográfica; sin marcador en Tomé. DEC-04. | [Contenido](../src/data.js); [ausencia de marcador y advertencia](../tests/explore.spec.js). |
| REQ-10 | Poder abrir y revisar lo desarrollado sin depender de la entrada de desarrollo de Vite. | HTML autónomo y web adaptable, v1.0.0. La distribución nativa en tiendas no está implementada. | [Exportación](../scripts/export-standalone.mjs); [archivo autónomo](../tests/standalone.spec.js). |
| REQ-11 | Guardar código en GitHub, numerar entregas y describir sus características y cambios. | v1.0.0 guardada y etiqueta remota comprobada. Ejecución remota de Actions sin confirmar desde el entorno. | [Versionado](versionado.md), [historial](../CHANGELOG.md), [comprobación](../scripts/check-version.mjs), [flujo](../.github/workflows/verify.yml). |
| REQ-12 | Incorporar bases de datos en una etapa posterior, avanzando paso a paso. | Diferido explícitamente; sin motor ni fecha seleccionados. DEC-03 y DEC-06. | [Transición propuesta](ingenieria-practica.md#incorporación-posterior-de-bases-de-datos). |
| REQ-13 | Aplicar ingeniería práctica y explicar qué hacemos, su motivo y su respaldo, manteniendo trazabilidad. | Adoptado en CAM-002; documentación de trabajo posterior a v1.0.0. DEC-06. | [Método y observaciones](ingenieria-practica.md), este registro y [guía del repositorio](../AGENTS.md). |

## Decisiones y motivos

| ID | Contexto y elección | Motivo / consecuencia | Cuándo revisarla |
| --- | --- | --- | --- |
| DEC-01 | A partir de la solicitud explícita, iniciar con mapa/ubicación y abrir ruta al seleccionar; historia mediante botón. | Mantiene la exploración como flujo central y permite leer cuando el visitante lo decide. El estado debe conservarse al regresar. REQ-02 y REQ-03. | Si las pruebas con visitantes muestran que el acceso a la ruta o historia resulta confuso. |
| DEC-02 | Tras consultar alternativas a Google Maps Platform, se adopta Leaflet + OpenStreetMap/CARTO y OSRM; enlaces a Google para transporte/tráfico. | Permite probar sin claves ni facturación de Google Maps Platform. Depende de servicios públicos y tiene menos funciones integradas. REQ-04. | Si crecen las consultas, falla la disponibilidad o se necesita tráfico/transporte dentro de la aplicación. |
| DEC-03 | Guardados y valoraciones en el navegador; contenido histórico incluido en archivos. Base de datos pospuesta, ahora ratificado por el usuario. | Permite validar la experiencia primero. No hay sincronización ni promedio de todos los visitantes; hará falta migración definida al incorporar datos compartidos. REQ-08 y REQ-12. | Al comenzar la etapa de datos compartidos. |
| DEC-04 | Conservar fuentes y créditos; no ubicar San Rafael en Tomé sin respaldo; señalar contenido orientativo. | La corrección técnica y la exactitud histórica requieren evidencias distintas. Una prueba de interfaz no valida un hecho histórico ni un acceso físico. REQ-06 y REQ-09. | Al recibir bibliografía o revisión de especialistas locales. |
| DEC-05 | Usar voz del dispositivo, reels ilustrados y fondos textiles originales para probar formatos. | Da ejemplos funcionales con producción audiovisual acotada. No equivale a locución grabada, video filmado ni diseños oficiales de Bellavista. REQ-07. | Cuando se apruebe producir los medios definitivos. |
| DEC-06 | Por solicitud del 3 de noviembre, mantener un método incremental con este registro, commits y pruebas proporcionales. | Explica el porqué sin exigir documentos o aprobaciones para cada edición. Cambios documentales se guardan en Git sin incrementar la versión ejecutable. REQ-11, REQ-12 y REQ-13. | Si el volumen de cambios o la incorporación de colaboradores necesita otra organización. |

## Cambios y entregas

| Cambio | Fecha / origen | Alcance y motivo | Verificación y referencia |
| --- | --- | --- | --- |
| CAM-001 | 2026-11-03. Petición de revisión y versión 1 en GitHub. | Consolidación del prototipo y correcciones descritas en [CHANGELOG](../CHANGELOG.md). REQ-01 a REQ-11. Este vínculo se registra retrospectivamente. | Commit [f4f4fcc](https://github.com/psaavedram/Caminando-con-la-Historia/commit/f4f4fcc7b01c01ff9abe715bb6d3324ae46f8e57), etiqueta `v1.0.0`, 58 pruebas aprobadas y [revisión](validacion-v1.md). |
| CAM-002 | 2026-11-03. Petición de ingeniería de software práctica y trazabilidad. | Se documentan requisitos, decisiones, arquitectura existente, evidencia, pendientes y forma de informar. Se adopta el método en la guía del repositorio. REQ-11 a REQ-13; DEC-06. | 63 enlaces locales comprobados y `npm run version:check` correcto. Al ser documentación, se conserva la evidencia funcional de CAM-001 sin repetir la suite. Identificar el commit con `git log --oneline --all --grep=CAM-002`. No cambia código ejecutable ni publica otra versión. |

Para el próximo cambio, añadir `CAM-003`, relacionar solo los requisitos/decisiones afectados y usar ese identificador en el commit. El número de cambio no sustituye a la versión: varios cambios pueden integrar una misma entrega. No hace falta abrir una incidencia ni una pull request para cada ajuste; si existen, se enlazan como evidencia adicional.

## Pendientes que afectan el alcance

| Pendiente | Estado y criterio para abordarlo | Relación |
| --- | --- | --- |
| Verificación histórica, posiciones y accesos | Pendiente de fuentes y revisión local. Mantener identificadas las aproximaciones hasta verificarlas. | REQ-01, REQ-06, REQ-09; DEC-04. |
| Prueba en teléfonos físicos y caminata real | Pendiente. Registrar GPS, legibilidad, recorrido y regreso a mapa; las pruebas Chromium no la reemplazan. | REQ-02 a REQ-07. |
| Datos y valoraciones compartidos | Diferido por el usuario; comenzar definiendo qué datos y qué operaciones se necesitan. | REQ-08, REQ-12; DEC-03. |
| Audio/video definitivo y distribución en tiendas | Futuro por definir, sin fecha ni tecnología de publicación acordadas. | REQ-07, REQ-10; DEC-05. |
| Ejecución de Actions y creación de Release | Configuradas, con estado remoto pendiente de confirmar; código y etiqueta ya verificados por Git. | REQ-11. |
