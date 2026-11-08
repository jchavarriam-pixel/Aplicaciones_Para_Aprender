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

La aplicación carga exclusivamente imágenes PNG con transparencia desde `imagenes/png/`: 234 ilustraciones de las 39 series nuevas y seis PNG preparados a partir de las ilustraciones originales. Hay 240 archivos y 45 familias en total. Los WebP originales se conservan como fuentes, ya que también los utiliza otra aplicación.

- Tamaño: las seis familias originales, coches y cohetes de juguete.
- Grosor: tubos, velas encendidas, marcadores, lápices, tarros de mermelada y vasos de vidrio.
- Longitud: cintas de tela, reglas de madera, dos familias de lápices y cuerdas.
- Tono: globos, camisetas, hojas, ovillos de lana, tazas y mochilas, con una progresión de oscuro a claro y el mismo tipo de objeto y decoración.
- Inclinación: postes, tablas de madera, lápices, flores y brochas.
- Lados: cinco familias de piezas geométricas, cada una con figuras de tres a ocho lados.
- Altura: edificios, torres de bloques, velas, lápices y botellas.
- Anchura: puertas con ventana, marcos de fotos, regalos, libros y maletas.

Las ilustraciones nuevas se crearon con la herramienta integrada de generación de imágenes, no convirtiendo los SVG anteriores. Tienen texturas, volumen, reflejos y detalles infantiles: madera y grafito en lápices, mecha y llama en velas, tapas y etiquetas en tarros, bordes ovalados en vasos, cremalleras en mochilas y asas y ruedas en maletas. La aplicación no necesita servicios externos para mostrarlas.

El conjunto de prompts está en `prompts-png.json`; los prompts de las seis fuentes originales siguen en `prompts-imagenes.md`. Cada familia nueva se generó como una lámina de seis variantes. Las láminas completas se conservan localmente en `imagenes/fuentes-png/`, fuera del control de versiones porque no se necesitan para jugar. `tools/exportar_png_ordenar.cjs` separa las variantes, detectando el espacio transparente entre filas para no cortar objetos altos, y crea los archivos PNG individuales y el catálogo `series.js`.

La preparación utiliza siempre escala uniforme y conserva el canal alfa y los colores completos, con compresión PNG sin pérdida. No estira los dibujos por un solo eje ni rasteriza los SVG anteriores. En grosor y anchura se normaliza la altura; en longitud, el grosor; en altura, la anchura. En tamaño se preparan seis escalas uniformes del mismo dibujo, y en inclinación se guarda la misma ilustración con seis rotaciones precisas. Cada familia comparte un marco y una base comunes; el navegador conserva las proporciones de cada PNG.

Se verifican transparencia y márgenes en los 240 PNG, la progresión de dimensiones y luminosidad y, mediante el contorno de las imágenes, los lados de las 30 piezas geométricas (8, 7, 6, 5, 4 y 3). El conjunto completo de PNG ocupa aproximadamente 22 MB; solo se cargan las imágenes de la ronda. Las herramientas y los SVG de la versión anterior quedan como referencia; el generador vectorial escribe un catálogo separado y no reemplaza el catálogo PNG de la aplicación.

Una muestra de las nuevas ilustraciones está en `vista-previa-ilustraciones.png`.

La configuración se guarda en `ordenarObjetosTamano.config.v1`: cantidad, criterio, sentido, familia, lectura, guía visual y números de posición. Se conservan los ajustes anteriores de tamaño. El nombre usa la clave compartida `nombreNinoGabrielApps`. Cantidad, criterio, sentido y familia se aplican al iniciar otra ronda; las ayudas cambian inmediatamente sobre la ronda actual. El bloqueo del almacenamiento no impide jugar.

Incluye los créditos de Gabriel, autores y TEC, así como los controles compartidos de zoom y pantalla completa. El arrastre compensa el zoom de la página y mantiene los espacios de origen para evitar que los objetos cambien de posición durante el arrastre. La actividad completa permanece dentro del alto útil, sin necesitar desplazamiento para llegar al destino.

La comprobación original de contenido incluyó 450 rondas (45 familias × cinco cantidades × dos sentidos), rechazo de órdenes invertidos, corrección por intercambio y final correcto; también el mazo mixto, migración y persistencia de preferencias, ayudas, interacción táctil y almacenamiento bloqueado. La comprobación actual de distribución se describe a continuación.


## Idioma y voz

La configuración permite español o inglés, voz femenina o masculina y velocidad de 0.7x a 1.5x en pasos de 0.1x. Las preferencias se guardan localmente; cada idioma recuerda su voz. Se prioriza la voz femenina más natural disponible. Las voces no ofrecidas por el navegador se indican como no disponibles. Véase [la documentación compartida](../idioma-voz.md).

## Orientación, zoom y pantalla completa

`adaptable.css` y `adaptable.js` reservan el alto útil para la instrucción, el banco, todos los espacios de respuesta y Revisar/Otra ronda. En vertical, título, instrucciones y configuración quedan en una franja superior desplazable; el juego ocupa todo el ancho. En horizontal, las herramientas quedan en una columna izquierda, incluido el título. Abrir o recorrer los ajustes no desplaza el juego. La guía visual y los créditos se mantienen en las herramientas y conservan sus opciones actuales.

En horizontal se usa una fila por zona; en vertical, cuatro a seis objetos se distribuyen en dos filas. Las casillas adaptan su altura al espacio restante y los PNG conservan sus proporciones. Se recalcula al girar, cambiar el zoom o entrar/salir de pantalla completa, compensando la escala de la página.

`tools/probar_ordenar_adaptable.cjs` comprueba los espacios y Revisar dentro de la vista en nueve tamaños entre 360×640 y 1920×1080, con siete valores de zoom entre 50% y 200%, y dos, cuatro y seis objetos. También comprueba arrastre táctil con zoom, validación del orden, textos ingleses y pantalla completa en tres tamaños con cuatro valores de zoom, incluyendo ajustes abiertos y desplazados.
