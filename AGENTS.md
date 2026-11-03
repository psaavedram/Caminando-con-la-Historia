# Trabajo en este repositorio

- Mantener la comunicación, el historial y las notas de versión en español.
- Conservar el alcance del prototipo de Tomé y distinguir las funciones reales de las demostraciones. No inventar coordenadas, valoraciones, derechos de fotografías ni datos históricos.
- Seguir [docs/versionado.md](docs/versionado.md). Al preparar una nueva entrega, elegir el incremento adecuado (corrección, función o cambio mayor), actualizar `package.json`/`package-lock.json` y añadir a `CHANGELOG.md` las características, cambios, validación y limitaciones. No crear una versión por cada edición intermedia ni modificar etiquetas ya publicadas.
- La versión visible procede de `package.json`; no duplicarla manualmente en el código de la interfaz.
- Después de cambios de la aplicación, ejecutar `npm run build` e incluir `prototipo.html` actualizado. Comprobar `npm run version:check` y las pruebas pertinentes; antes de publicar una versión, ejecutar toda la suite con `npm test`.
- Revisar que no se incluyan claves, archivos `.env`, dependencias ni resultados temporales en los commits. Conservar créditos y fuentes de las imágenes.
- Usar el checkout existente. La tarea cloud ya está aislada; no necesita un worktree adicional.
