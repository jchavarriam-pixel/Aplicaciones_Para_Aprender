# Mayor y menor con objetos

Abrir `mayor_menor_objetos.html` directamente o desde el índice principal. La aplicación funciona como archivo local y desde servidor, sin librerías externas para jugar.

## Tres modos

1. **Grande y pequeño:** dos opciones del mismo tipo de objeto. Se puede buscar siempre grande, siempre pequeño o variar.
2. **Grande, mediano y pequeño:** tres grados de tamaño. Se puede practicar cualquiera de los tres o mezclarlos.
3. **Características:** tres opciones, con comparación **más**, **menos** o **mixta**. Se eligen las características desde la configuración.

Las 18 categorías son tamaño, altura, longitud, anchura, grosor, claridad del color, forma, superficie, limpieza, humedad, orden, abertura, contenido, cantidad, separación, distancia, inclinación y clima. Cada categoría tiene al menos dos variantes de imágenes; clima incluye sol/nubes, lluvia y nieve. Se usa vertical frente a inclinado para describir la inclinación, sin confundirla con que una línea sea recta.

Las comparaciones se apoyan en grados ordenados. Por ejemplo, menos delgado corresponde al cilindro más grueso cuando lo único que varía es su diámetro. En cantidad se pregunta dónde hay más/menos objetos; en distancia se nombra la referencia (casa o banco). Las preguntas usan es o está según corresponda a la característica.

## Selección y dinámica

Tocar una opción la ilumina con un halo dorado, una marca y la etiqueta Seleccionado. El halo rodea la tarjeta: conserva el color y el tamaño del dibujo, para no alterar la característica evaluada. La animación es breve y se desactiva con la preferencia de movimiento reducido, manteniendo el resplandor fijo.

Después se pulsa Revisar. Los errores permiten otra elección; los aciertos muestran una explicación, una estrella y el botón Siguiente. No hay avance automático. Las posiciones se mezclan por separado: el mediano no aparece siempre al centro. Cada ejercicio tiene una sola respuesta válida. Las rondas no repiten una imagen y, en modo 3, reparten las categorías antes de repetirlas.

Se eligen rondas de 4, 8 o 12 ejercicios. Si las categorías seleccionadas ofrecen menos imágenes, la ronda usa las disponibles y lo indica en configuración. No se permite dejar todas las categorías desactivadas.

## Imágenes

- Se conservaron los ocho pares originales de `imagenes/`.
- Se generaron **38 imágenes nuevas** con tres grados cada una, en `imagenes/caracteristicas/`. Cada archivo conserva sus tres paneles; la interfaz muestra cada panel por separado y mezcla su posición.
- Se reutilizan las seis ilustraciones transparentes de `../Ordenar_Objetos_Tamano/imagenes/` para ofrecer más familias en tamaño, usando escalas visuales progresivas. No se duplican sus archivos.
- El catálogo y la dirección de cada rasgo están en `caracteristicas.js`. Los prompts de los pares originales están en `prompts-imagenes.md`; los de las variantes nuevas y sus revisiones están en `prompts-caracteristicas.md`.

Las ilustraciones nuevas se generaron con la herramienta integrada de imágenes y se optimizaron a WebP. Se revisaron visualmente los tres grados y se corrigieron dos generaciones para conservar la cantidad de libros y eliminar una pelota adicional en distancia.

## Preferencias y compatibilidad

Se conserva la clave `mayorMenorObjetos.config.v1`. Se guardan modo, tamaño objetivo, tipo de comparación, categorías, cantidad, voz y ayuda. Las preferencias antiguas mayor/menor se migran a grande/pequeño. El nombre comparte `nombreNinoGabrielApps`. Si el navegador bloquea el almacenamiento, se puede seguir jugando.

Las pestañas cambian de modo inmediatamente. Cantidad, tamaño objetivo y categorías se aplican con Nueva ronda; voz y ayuda cambian de inmediato. La carga de imágenes permite reintentar y descarta respuestas de cargas antiguas al cambiar rápidamente de actividad.

Se mantienen créditos, referencia a Gabriel, controles de zoom y pantalla completa. Se comprobó el uso táctil, la adaptación a teléfono/tableta y zoom al 85 %, las tres actividades, el guardado, la migración de preferencias y las respuestas únicas de todos los rasgos y comparadores.

## Recortes, escala y alineación

`recortes.js` define el área completa de cada dibujo sobre su archivo original. No se supone que los objetos estén dentro de mitades o tercios exactos: se localizan los espacios en blanco entre ellos. Las escenas y los grupos mantienen sus límites de panel originales.

Cada ejercicio utiliza un mismo lienzo, margen, línea de base y factor de escala para todas sus opciones. Los recortes se centran por su contenido visible; ningún dibujo se amplía por separado para llenar la tarjeta. Así se conservan las diferencias reales de tamaño, altura, longitud y anchura. Las tarjetas y sus etiquetas tienen medidas uniformes; seleccionar o corregir una opción no mueve el dibujo. Las cintas y otras ilustraciones muy anchas usan una tarjeta más baja para evitar espacio vacío excesivo.

Las 52 imágenes están medidas, incluidos los ocho pares anteriores y las seis ilustraciones transparentes reutilizadas. Para volver a medir después de cambiar una ilustración: ejecutar `tools/medir_recortes_objetos.cjs` con Node.js y Sharp. La opción `--revision` crea hojas temporales de inspección. La aplicación normal solo necesita los archivos estáticos y no ejecuta ese proceso.
