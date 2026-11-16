# Artículo y sujeto

Entrada: `articulos_sujeto.html`, enlazada en la pestaña Español del índice, antes de Generador de oraciones.

La actividad es completar: dos huecos para artículo y nombre, seguidos del predicado y de la imagen. Se puede responder escribiendo con el teclado o arrastrando fichas; las fichas también se pueden colocar mediante toques. No hay actividad de corregir ni de tachar palabras.

El sujeto completo incluye el artículo y el nombre: por ejemplo, **El perro**. Los huecos se llaman Artículo y Nombre para no enseñar que únicamente el sustantivo es el sujeto completo.

Banco: ocho sujetos y seis predicados por sujeto, en singular y plural: 96 ejercicios semánticos, disponibles en español e inglés. El inicio para usuarios nuevos mezcla singular y plural. Las rondas no repiten ejercicios y evitan repetir el último al comenzar otra ronda. Si una selección ofrece menos ejercicios que la cantidad solicitada, la ronda usa todos los disponibles.

Se admite el artículo definido que concuerda. Al activar los indefinidos también se aceptan un/una/unos/unas; en inglés, a/an solamente en singular. No se presenta some como artículo. La validación distingue el artículo el del pronombre él. También admite algunos nombres equivalentes usuales (perrito, gatito, profesora; puppy, kitten, turtle, child) con su número correspondiente y conserva la palabra escrita al leer la respuesta.

Preferencias: `articulosSujeto.config.v1`; idioma y voz: `idiomaVoz.articulosSujeto.v1`; nombre compartido: `nombreNinoGabrielApps`. El panel inicia visible. La falta de almacenamiento no impide jugar. Se ignora cualquier preferencia antigua del modo de corrección.

## Imágenes

Se generaron con la herramienta integrada image_gen.imagegen y se guardaron en `imagenes`: perro.png, gato.png, conejo.png y tortuga.png, más las láminas plurales gatos.png, conejos.png y elefantes.png. Cada lámina plural contiene tres animales, separados y contables. Los prompts finales están en `prompts-imagenes.json`. No se sobrescribieron imágenes anteriores.

Se reutilizan las ilustraciones existentes de mariposa, elefante, maestra y niño mediante rutas relativas a `../ImagenesGeneradorOraciones`. Las oraciones de gatos, conejos y elefantes usan sus láminas nuevas. Para los demás plurales se muestran dos copias separadas del pictograma sin crear archivos duplicados. Las pistas y etiquetas accesibles indican la cantidad representada.

## Verificación

`tools/probar_articulos_sujeto.cjs` comprueba gramática, variantes, teclado y fichas, persistencia, banco, nombre, integración, orientación, zoom, pantalla completa, teclado táctil, imágenes plurales y arrastre.
