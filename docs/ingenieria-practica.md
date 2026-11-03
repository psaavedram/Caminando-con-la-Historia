# Cómo desarrollamos esta aplicación

Acuerdo de trabajo del 3 de noviembre de 2026: aplicar ingeniería de software de forma práctica, avanzar por etapas y poder reconstruir qué se pidió, por qué se decidió algo, qué cambió y cómo se comprobó. La aplicación publicada sigue en **1.0.0**; este acuerdo documenta el trabajo y no modifica su comportamiento.

## Un ciclo pequeño para cada cambio

1. **Entender el resultado.** Escribir el comportamiento esperado con un ejemplo observable. Si hay una duda que cambia el alcance, resolverla; las decisiones técnicas pequeñas se resuelven y se explican al avanzar.
2. **Revisar el impacto.** Identificar qué parte del código, datos o servicios toca. Registrar una decisión solo si afecta una función, la arquitectura, costos, conservación de datos o una limitación relevante.
3. **Implementar un paso comprobable.** Mantener cada cambio centrado en el resultado solicitado. Si aparece una mejora independiente, anotarla como pendiente en vez de ampliar silenciosamente el trabajo.
4. **Verificar según el cambio.** Usar pruebas existentes, añadir regresiones cuando aporten valor y probar visualmente cuando corresponda. Distinguir servicios simulados, consultas reales y pruebas en terreno. Para documentación basta revisar contenido, enlaces y coherencia; no hace falta repetir las pruebas de la aplicación.
5. **Dejar rastro y explicar.** Actualizar las filas afectadas de [trazabilidad](trazabilidad.md), guardar un commit con el identificador del cambio y resumir resultado, motivo, comprobación y pendientes. Si se publica una nueva versión, seguir [versionado](versionado.md).

Una corrección pequeña puede quedar documentada en una fila y su commit. Una decisión importante lleva unas líneas de contexto, elección, motivo y condición para revisarla. Se amplía la documentación solo cuando la complejidad lo justifica. Las pruebas, el código y las versiones son evidencia enlazada: no se copia su contenido en cada documento.

## Qué respalda esta forma de trabajo

| Práctica de ingeniería | Aplicación concreta | Para qué sirve |
| --- | --- | --- |
| Requisitos y criterios de aceptación | «Al iniciar hay ubicación, sin tarjeta; tocar un lugar calcula la ruta; la historia se abre al pedirla» | Saber qué debe pasar y evitar interpretar “terminado” de distintas maneras. |
| Desarrollo incremental | Tomé y Bellavista primero; datos compartidos en una etapa posterior | Aprender con un prototipo utilizable antes de ampliar la inversión. |
| Separación de responsabilidades | Mapa, rutas, ubicación, contenido y valoraciones en módulos identificables | Cambiar una parte y localizar sus efectos. |
| Decisiones de arquitectura documentadas | Registrar proveedor de mapa/rutas y almacenamiento local con sus límites | Entender por qué llegamos al diseño actual y cuándo conviene cambiarlo. |
| Verificación y regresión | Pruebas de flujos importantes y errores que ya encontramos | Detectar si una mejora rompe algo que funcionaba. |
| Gestión de configuración | Commits, lockfile, historial y etiquetas de versión permanentes | Recuperar exactamente el código y las dependencias de una entrega. |
| Trazabilidad | Solicitud → requisito → decisión → cambio/código → prueba → versión | Poder explicar cómo una necesidad llegó al producto. |

Estas prácticas orientan decisiones; no exigen certificaciones, reuniones ni herramientas adicionales. Un requisito implementado técnicamente puede conservar una validación histórica o de terreno pendiente.

## Arquitectura que existe hoy

| Responsabilidad | Código actual | Límite actual |
| --- | --- | --- |
| Pantallas, selección, apertura de historias y guardados | [main.jsx](../src/main.jsx) | Coordina varias funciones; separar componentes cuando una modificación concreta lo necesite. |
| Mapa, marcadores y líneas de recorrido | [ExplorerMap.jsx](../src/ExplorerMap.jsx) | Depende de teselas externas; el esquema de respaldo no es un mapa geográfico sin conexión. |
| Ubicación y enlaces a Google Maps | [visitor.js](../src/visitor.js) | GPS con permiso y contexto seguro; no se conserva entre sesiones. |
| Panel y cálculo de rutas | [DirectionsPanel.jsx](../src/DirectionsPanel.jsx), [routing.js](../src/routing.js) | OSRM público, sin tráfico en vivo; cancelación, validación y caché temporal. |
| Catálogo histórico, fotografías y lectura de Bellavista | [data.js](../src/data.js), [bellavista-media.js](../src/bellavista-media.js), [BellavistaReading.jsx](../src/BellavistaReading.jsx) | Contenido incluido en la aplicación, con fuentes y revisión local pendiente. |
| Valoraciones y promedio | [reviews.jsx](../src/reviews.jsx) | Persistencia y presentación conviven en el mismo módulo; promedio del navegador, no de todos los visitantes. |
| Compilación, HTML autónomo y verificación de entrega | [scripts](../scripts/), [flujo de GitHub](../.github/workflows/verify.yml) | La ejecución del flujo remoto debe comprobarse antes de afirmar que una Release fue creada. |

La estructura es suficiente para el prototipo. La incorporación de un servidor será el momento de separar explícitamente el acceso a datos de los componentes que los muestran; esa separación todavía no está implementada como una capa intercambiable.

## Incorporación posterior de bases de datos

**Estado: diferido por solicitud del usuario.** No hay motor, proveedor, esquema ni fechas aprobados. El plan de referencia es:

1. **Definir qué se compartirá.** Ciudades, lugares, reseñas, fuentes, medios y/o valoraciones. Acordar quién puede modificar cada dato y cómo se revisan los aportes de visitantes. Elegir el motor y servicio a partir de esas necesidades y sus costos.
2. **Introducir una primera lectura desde un servicio.** Separar el acceso al catálogo, mantener identificadores estables de lugares y comprobar que mapa y lectura conservan su comportamiento con errores o demoras de red.
3. **Incorporar escrituras compartidas cuando se acuerden.** Definir validación en el servidor, autoría, revisión, cálculo de promedios y manejo de fallos. Decidir explícitamente qué ocurrirá con las valoraciones locales ya existentes y comprobar la migración que corresponda.
4. **Verificar la transición antes de publicar.** Probar integración, compatibilidad y recuperación de datos, además de los flujos de usuario existentes. Registrar la decisión, la evidencia y la versión de esa etapa.

Los `id` de los lugares y el formato de los datos locales ya existen. Conservar su significado ayuda a la transición, pero no convierte el prototipo en un sistema listo para usar una base de datos sin trabajo adicional.

## Observaciones al entregar un avance

El informe al usuario incluirá, cuando sea relevante:

- **Qué cambió y por qué:** resultado visible y necesidad que resuelve.
- **Respaldo de ingeniería:** una explicación breve de la práctica aplicada, conectada con el cambio real.
- **Cómo se verificó:** pruebas o revisión realizada y su alcance.
- **Rastro y pendientes:** identificador del cambio, commit/versión y lo que queda por resolver.

Ejemplo existente: «La ruta individual pendiente se cancela al iniciar el paseo orientativo. Esto mantiene un estado coherente y evita que una respuesta antigua reemplace la selección del visitante. Se verificó con una prueba de regresión en escritorio y teléfono; está incluido en v1.0.0».
