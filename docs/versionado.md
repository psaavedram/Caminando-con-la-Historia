# Versionado y publicación

La versión inicial es **1.0.0**, etiqueta **v1.0.0**. Reúne el prototipo de Tomé desarrollado hasta ahora. No se atribuyen números a estados anteriores que nunca se guardaron en Git.

## Cómo se numera

| Tipo | Ejemplo siguiente desde 1.0.0 | Cuándo corresponde |
| --- | --- | --- |
| Corrección | 1.0.1 | Arreglar errores de rutas, lectura, interfaz o contenido sin añadir funciones importantes. |
| Función | 1.1.0 | Añadir una ciudad, filtros o una capacidad compatible con los datos existentes. |
| Cambio mayor | 2.0.0 | Una modificación incompatible, como cambiar el formato de valoraciones sin compatibilidad o sustituir un flujo central. |

Los ejemplos no son compromisos ni versiones ya implementadas. Al subir MENOR se reinicia CORRECCIÓN; al subir MAYOR se reinician los otros dos números. La etiqueta publicada es permanente: cualquier arreglo posterior recibe otro número, sin mover ni sobrescribir etiquetas anteriores. Cambiar la versión no debe borrar los datos locales; su formato se migra por separado cuando sea necesario.

## Qué queda guardado

- `package.json` y `package-lock.json`: número de versión y dependencias reproducibles.
- `CHANGELOG.md`: una entrada por versión con fecha, características, cambios, validación y limitaciones.
- Commit: código, pruebas, documentación y HTML autónomo de ese estado.
- Etiqueta Git anotada `vX.Y.Z`: referencia exacta al commit publicado.
- GitHub Release: notas extraídas del historial, `prototipo.html` y `sitio-web.zip` (contenido compilado de `dist/`), además de los archivos de código fuente que ofrece GitHub.
- Número visible en el pie de la aplicación, tomado del paquete al compilar.

## Preparar la próxima versión

Trabajar sobre una rama de cambios; mantener los commits pequeños y descriptivos. Una vez decidido el alcance, ejecutar **solo uno** de estos comandos:

```sh
npm run version:patch
# o: npm run version:minor
# o: npm run version:major
```

Estos comandos actualizan paquete y lockfile, sin crear commits ni publicar etiquetas. Después:

1. Añadir al principio de `CHANGELOG.md` la entrada `## [X.Y.Z] - AAAA-MM-DD`. Describir qué ofrece, qué cambia respecto de la versión anterior, cómo se comprobó y qué falta. Mantener las secciones `Características`, `Cambios`, `Validación` y `Limitaciones`.
2. Ejecutar `npm ci`, `npm run version:check`, `npm run build` y `npm test`. Revisar también el resultado en teléfono cuando el cambio lo requiera. El build actualiza `prototipo.html`; incluirlo en el commit.
3. Revisar `git diff`, guardar y llevar los cambios a `main` sin sobrescribir trabajo remoto. Si se utiliza una pull request, esperar a sus verificaciones y fusionarla antes de etiquetar.
4. Crear la etiqueta en el commit validado de `main` y enviarla. Por ejemplo, para una corrección futura:

```sh
git tag -a v1.0.1 -m 'Versión 1.0.1: descripción concreta de la corrección'
git push origin main
git push origin v1.0.1
```

Usar el número real elegido, no copiar el ejemplo sin actualizarlo. No usar `--force` ni reutilizar una etiqueta.

## Automatización en GitHub

`.github/workflows/verify.yml` instala dependencias y Chromium, verifica número e historial, compila y ejecuta las pruebas en cada push y pull request. En pushes de etiquetas `v*`, comprueba que coincidan con `package.json` y crea la Release **solo si pasan las comprobaciones**. Los cambios normales de rama no crean versiones publicadas ni despliegan el sitio.

El repositorio debe permitir GitHub Actions y que el trabajo de publicación use `contents: write`. El flujo usa el token temporal de GitHub: no requiere guardar un token personal en el código. Si Actions está deshabilitado o hay una política que bloquea la publicación, el commit y la etiqueta pueden existir aunque la Release aún no se haya creado: revisar la pestaña Actions antes de dar la publicación por completada.

Para repetir una publicación fallida por un problema temporal, volver a ejecutar el trabajo fallido de Actions. Si la Release ya existe, revisar su estado en GitHub antes de cualquier acción manual; no sobrescribir sus archivos automáticamente.
