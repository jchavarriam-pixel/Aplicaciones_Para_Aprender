# Ordenar objetos

Abrir `ordenar_objetos_tamano.html` directamente o desde el índice principal: Matemáticas → Comparación de tamaños / Orden y secuencias. Actividad posterior a Explora y compara.

## Dinámica

- Elegir de dos a seis objetos por ronda (tres inicialmente).
- Escoger tamaño, grosor, longitud, tono de color, inclinación, número de lados, altura o anchura. En Mixto se recorren los ocho criterios en orden aleatorio, sin repetirlos antes de completar una vuelta ni repetir el último al empezar la siguiente.
- Cada ronda utiliza una sola familia, con entre dos y seis valores distintos de la propiedad correspondiente. Se puede escoger una familia concreta o variarlas; en Mixto se elige una familia del criterio que toque. Las familias de cada criterio también forman mazos sin repetición.
- Elegir de mayor a menor, de menor a mayor o alternar ambos sentidos. La instrucción nombra la característica: por ejemplo, del más oscuro al más claro o del más derecho al más inclinado.
- Ordenar de izquierda a derecha. Cuando los espacios se distribuyen en dos filas, continuar en la siguiente fila. Banco y destino comparten el mismo número de columnas y dimensiones de tarjetas.
- Arrastrar con dedo o ratón, o tocar primero un objeto y después el espacio de destino. Al colocar un objeto sobre otro, ambos intercambian sus lugares. Los objetos pueden volver al banco.
- Pulsar Revisar cuando todos estén colocados. Los espacios correctos quedan verdes; los demás se pueden corregir. Al completar, se felicita al niño y se muestra una celebración breve, respetando movimiento reducido.

El orden inicial se mezcla y no se presenta ya resuelto. La guía visual opcional aparece sobre la actividad y en el panel lateral: círculos y flechas para tamaño y tono, barras para dimensiones, postes para inclinación y polígonos para lados. Refleja el criterio, la cantidad y el sentido actuales. Al desactivarla se ocultan ambas ilustraciones, manteniendo la instrucción del ejercicio. Los números de posición y la lectura se pueden activar por separado.

## Archivos y preferencias

Se conservan las seis ilustraciones WebP de tamaño en `imagenes/`. Los prompts originales están en `prompts-imagenes.md`. Las series nuevas incluyen 234 SVG en `imagenes/series/`, agrupados en 39 familias. Hay 45 familias en total:

- Tamaño: las seis familias originales, coches y cohetes de juguete.
- Grosor: tubos, velas encendidas, marcadores, lápices, tarros de mermelada y vasos de vidrio.
- Longitud: cintas de tela, reglas de madera, dos familias de lápices y cuerdas.
- Tono: globos, camisetas, hojas, ovillos de lana, tazas y mochilas. En cada familia solo cambia el tono, con la misma geometría y decoración.
- Inclinación: postes, tablas de madera, lápices, flores y brochas.
- Lados: cinco familias de piezas geométricas, cada una con figuras de tres a ocho lados.
- Altura: edificios, torres de bloques, velas, lápices y botellas.
- Anchura: puertas con ventana, marcos de fotos, regalos, libros y maletas.

`tools/crear_series_ordenar.cjs` genera los SVG y su catálogo `series.js`; `tools/ilustraciones_ordenar.cjs` contiene los dibujos, materiales, detalles y ventanas de visualización. Las ilustraciones tienen contornos suaves, reflejos y detalles reconocibles: madera y grafito en lápices, mecha y llama en velas, tapas y etiquetas en tarros, bordes ovalados en vasos, cremalleras en mochilas y asas y ruedas en maletas. No utilizan filtros, animaciones ni recursos externos.

Las ilustraciones de una familia comparten ventana de visualización, márgenes, color y características no evaluadas. En grosor se conserva la altura; en longitud, el grosor; en anchura, la altura; y en tono, la geometría. Se verifica tanto la progresión como las dimensiones constantes sobre los píxeles renderizados. Las imágenes se escalan dentro de su ventana sin recortarlas ni deformarlas en el navegador. Se verificaron los bordes de las 234 imágenes, incluidos puntas, asas y llamas. Para los tamaños originales se reutiliza un mismo WebP con escala uniforme; los nuevos coches y cohetes también crecen con escala uniforme.

Una muestra de las nuevas ilustraciones está en `vista-previa-ilustraciones.png`.

La configuración se guarda en `ordenarObjetosTamano.config.v1`: cantidad, criterio, sentido, familia, lectura, guía visual y números de posición. Se conservan los ajustes anteriores de tamaño. El nombre usa la clave compartida `nombreNinoGabrielApps`. Cantidad, criterio, sentido y familia se aplican al iniciar otra ronda; las ayudas cambian inmediatamente sobre la ronda actual. El bloqueo del almacenamiento no impide jugar.

Incluye los créditos de Gabriel, autores y TEC, así como los controles compartidos de zoom y pantalla completa. El arrastre compensa el zoom de la página y permite desplazar todo el documento al acercar el dedo al borde de la pantalla. Mantiene los espacios de origen para evitar que los objetos cambien de posición durante el arrastre.

Comprobación: 450 rondas (45 familias × cinco cantidades × dos sentidos), rechazo de órdenes invertidos, corrección por intercambio y final correcto. También se comprueban el mazo mixto, la migración y persistencia de preferencias, las ayudas, la interacción táctil para colocar y revisar, el arrastre con zoom al 85/100/125 %, el almacenamiento bloqueado y la ausencia de desbordamiento horizontal en teléfono y tableta en ambas orientaciones. Con seis objetos y pantalla horizontal pequeña se comprueba el arrastre hasta la última fila mediante desplazamiento automático. Al mantener el dedo junto al borde, la página continúa desplazándose aunque haya una casilla visible del banco bajo el dedo.
