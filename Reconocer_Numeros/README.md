# Reconocer números

Abrir `reconocer_numeros.html`, también disponible desde el índice principal.

## Vacas del corral

Los cuatro estilos son clásica, caramelo, dorada y lavanda. En `assets/`, cada estilo tiene un GIF `-caminar` (cabeza, patas y cola animadas), un GIF `-quieta` (cola y movimiento suave de cabeza) y un SVG original. Los GIF son transparentes, tienen 24 fotogramas y se repiten continuamente.

Las imágenes se reutilizan entre los animales. El número se dibuja como una etiqueta independiente: se mantiene derecho aunque la vaca mire hacia la izquierda. Las vacas capturadas usan el GIF de reposo.

El potrero tiene césped y el corral una cerca de madera con entrada. La vaca correcta se suelta en la entrada marcada y camina por sí misma hasta una plaza reservada; depositarla directamente en el interior no la captura. El portón se abre durante la caminata. Las pausas, giros de pantalla y cambios de ronda conservan o limpian esta transición según corresponda.

El arte vectorial y la animación se generan con `tools/build-cows.cjs` (Node.js y Sharp) y `tools/encode-cows.py` (Python y Pillow). No se necesitan estas herramientas para usar la aplicación.

## Rendimiento y configuración

La celebración del pareo usa un único lienzo, dibujos reutilizables y sonidos precalculados. La resolución y la cantidad de partículas se limitan para tabletas; los efectos y el audio se detienen al abandonar la actividad. Las preferencias conservan su clave de almacenamiento local anterior.

El archivo `../reconocer_numeros.html` mantiene el acceso desde los enlaces anteriores mediante una redirección.

Los números de las vacas se muestran sin recuadro, con cifras oscuras y contorno blanco de alto contraste; su tamaño se adapta a las cifras y al espacio de cada plaza del corral.
