# Trabajo en este repositorio

- Mantener la comunicación, el historial y las notas de versión en español.
- Aplicar [ingeniería práctica](docs/ingenieria-practica.md) y mantener [trazabilidad](docs/trazabilidad.md). Antes de un cambio, identificar la necesidad y el resultado observable; al entregarlo, actualizar solo los requisitos, decisiones y pendientes afectados. Usar el siguiente identificador `CAM` en su commit, sin exigir documentos o aprobaciones para cada edición intermedia.
- Explicar al usuario, como observaciones breves, qué cambió y por qué, qué práctica de ingeniería respalda la decisión, cómo se verificó y qué queda pendiente. Distinguir evidencia técnica, contenido histórico y pruebas en terreno; no presentar documentación retrospectiva como un registro escrito en su momento.
- La base de datos está diferida por el usuario. Desarrollar la siguiente necesidad concreta; al llegar a datos compartidos, seguir la transición documentada y decidir entonces proveedor, modelo y migraciones. No introducir ahora infraestructura o capas sin uso.
- Conservar el alcance del prototipo de Tomé y distinguir las funciones reales de las demostraciones. No inventar coordenadas, valoraciones, derechos de fotografías ni datos históricos.
- Seguir [docs/versionado.md](docs/versionado.md). Al preparar una nueva entrega, elegir el incremento adecuado (corrección, función o cambio mayor), actualizar `package.json`/`package-lock.json` y añadir a `CHANGELOG.md` las características, cambios, validación y limitaciones. No crear una versión por cada edición intermedia ni modificar etiquetas ya publicadas.
- La versión visible procede de `package.json`; no duplicarla manualmente en el código de la interfaz.
- Los cambios exclusivamente documentales se guardan con un commit y su identificador de trazabilidad, conservando la versión ejecutable y la etiqueta publicada. Aplicar el incremento de versión al preparar una entrega con cambios de la aplicación.
- Después de cambios de la aplicación, ejecutar `npm run build` e incluir `prototipo.html` actualizado. Comprobar `npm run version:check` y las pruebas pertinentes; antes de publicar una versión, ejecutar toda la suite con `npm test`.
- Revisar que no se incluyan claves, archivos `.env`, dependencias ni resultados temporales en los commits. Conservar créditos y fuentes de las imágenes.
- Usar el checkout existente. La tarea cloud ya está aislada; no necesita un worktree adicional.
