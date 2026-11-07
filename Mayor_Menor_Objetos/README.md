# Mayor y menor con objetos

Abrir `mayor_menor_objetos.html` directamente o desde el índice principal. Funciona como archivo local y desde un servidor, sin dependencias externas para el juego.

Actividad de comparación de tamaños: cada una de las ocho imágenes contiene dos objetos del mismo tipo, diseño y color; cambia su tamaño. Se muestran pelotas, tazas, manzanas, zapatos, mochilas, osos de peluche, cucharas y botellas. Cada par completo está guardado en un solo archivo WebP dentro de `imagenes/`. Las ocho imágenes juntas ocupan aproximadamente 300 KB.

## Dinámica

1. Observar el par y escuchar o leer la pregunta.
2. Tocar el objeto mayor o menor y pulsar Revisar.
3. Si hay un error, volver a observar y elegir. Si hay un acierto, se muestra la explicación, se gana una estrella y se habilita Siguiente.

El modo mixto alterna mayor/menor con un objetivo inicial aleatorio. Se pueden practicar solo mayor o solo menor. En cada ronda se mezclan cuatro u ocho pares sin repetir; se sortea también la orientación de cada imagen, por lo que el objeto grande puede aparecer a cualquiera de los lados. La imagen completa se refleja junto con la lógica de respuesta.

Las preferencias se guardan en `mayorMenorObjetos.config.v1`: modo, longitud de ronda, voz y ayuda. El nombre comparte `nombreNinoGabrielApps` con el resto de aplicaciones. Si el navegador bloquea el almacenamiento, el juego sigue funcionando con las opciones en memoria.

Incluye las mismas referencias a Gabriel, créditos y controles de zoom/pantalla completa del proyecto. La interfaz aprovecha el ancho disponible, se adapta a orientación vertical y horizontal y permite responder con toque, ratón o teclado. La celebración utiliza 28 elementos breves y respeta la preferencia de movimiento reducido.

## Imágenes

Ilustraciones originales generadas con la herramienta integrada de imágenes y optimizadas a WebP de 1200 × 800. No contienen texto, fondos distractores ni marcas que indiquen la respuesta. Los prompts de producción se conservan en `prompts-imagenes.md`.
