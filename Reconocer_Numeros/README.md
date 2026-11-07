# Reconocer números

Abrir `reconocer_numeros.html`, también disponible desde el índice principal.

## Vacas del corral

Los cuatro estilos son clásica, caramelo, dorada y lavanda. En `assets/`, cada estilo tiene un GIF `-caminar` (cabeza, patas y cola animadas), un GIF `-quieta` (cola y movimiento suave de cabeza) y un SVG original. Los GIF son transparentes, tienen 24 fotogramas y se repiten continuamente.

Las imágenes se reutilizan entre los animales. El número se dibuja como una etiqueta independiente: se mantiene derecho aunque la vaca mire hacia la izquierda. Las vacas capturadas usan el GIF de reposo.

El arte vectorial y la animación se generan con `tools/build-cows.cjs` (Node.js y Sharp) y `tools/encode-cows.py` (Python y Pillow). No se necesitan estas herramientas para usar la aplicación.

## Rendimiento y configuración

La celebración del pareo usa un único lienzo, dibujos reutilizables y sonidos precalculados. La resolución y la cantidad de partículas se limitan para tabletas; los efectos y el audio se detienen al abandonar la actividad. Las preferencias conservan su clave de almacenamiento local anterior.

El archivo `../reconocer_numeros.html` mantiene el acceso desde los enlaces anteriores mediante una redirección.
