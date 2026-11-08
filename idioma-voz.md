# Idioma y voz en las actividades adaptadas

Explora y compara, Ordenar objetos, Reconocer números y Mayor y menor incluyen la misma sección **Idioma y voz** en su configuración. Las demás aplicaciones conservan su comportamiento anterior. Los detalles de Mayor y menor están en [su documentación](mayor-menor.md).

- Español o inglés. Se traducen títulos, menús, opciones, instrucciones, ayudas, feedback, felicitaciones, textos accesibles y controles de pantalla completa y zoom.
- Velocidades 0.7x, 0.8x, 0.9x, 1.0x, 1.1x, 1.2x, 1.3x, 1.4x y 1.5x. La velocidad inicial es 1.0x.
- Tres espacios para voces femeninas y tres para masculinas. Se muestran voces reales que el navegador proporciona para el idioma activo, priorizando las identificadas como naturales, neuronales o mejoradas. Si hay más, se eligen las tres mejor clasificadas de cada grupo. Las voces sin género reconocido aparecen aparte.
- Por defecto se usa la voz femenina disponible con mayor prioridad. Una selección explícita tiene preferencia y se recuerda por idioma. Si desaparece, se usa una disponible del mismo idioma sin borrar la preferencia guardada.
- El botón de prueba reproduce la voz a la velocidad elegida. Funciona aunque estén desactivadas las lecturas automáticas de la actividad.

Las referencias preferidas en español son Dalia, Elvira y María; Jorge, Álvaro y Diego. En inglés son Ava, Jenny y Sonia; Andrew, Guy y Ryan. La disponibilidad depende del navegador y del sistema operativo: no se instalan ni se simulan voces. Los espacios no disponibles se muestran deshabilitados y se informa de cuántas voces reales de cada grupo se encontraron. Se actualiza la selección cuando el navegador termina de cargar su lista de voces.

El reconocimiento del género se basa en nombres conocidos, porque Web Speech no proporciona un campo de género. No se altera el tono para convertir una voz masculina en femenina. Tampoco se añade ningún servicio externo, clave de API ni servidor de audio.

Referencias: [voces disponibles en Web Speech, MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices), [catálogo de voces y géneros de Microsoft](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=text-to-speech).

## Preferencias

Cada aplicación conserva su configuración anterior y guarda las nuevas preferencias en una clave independiente:

| Aplicación | Clave local |
| --- | --- |
| Explora y compara | `idiomaVoz.comparar.v1` |
| Ordenar objetos | `idiomaVoz.ordenar.v1` |
| Reconocer números | `idiomaVoz.numeros.v1` |
| Mayor y menor | `idiomaVoz.mayorMenor.v1` |

Se guardan idioma, velocidad y voz elegida para cada idioma. Los fallos o el bloqueo del almacenamiento no impiden jugar, aunque las elecciones no puedan persistir en ese caso.

## Números en inglés

Los cuatro modos utilizan nombres de números en el idioma elegido, de 0 a 999 999. El teclado inglés omite ñ y permite guion. La validación acepta espacios o guiones entre decenas y unidades, y el uso opcional de «and» en centenas, sin cambiar el número esperado. El área de la respuesta del niño queda excluida de la traducción: no se corrige ni se transforma automáticamente lo escrito.

El cambio de idioma desde la configuración general detiene audio y temporizadores y vuelve al inicio. En las otras dos aplicaciones se mantiene el ejercicio actual: sus imágenes y respuestas no cambian al traducir la interfaz.

## Implementación y comprobación

`idioma-voz.js` gestiona preferencias, selección de voces, lectura y actualización de la interfaz. `idioma-voz-textos.js` contiene las traducciones explícitas y el módulo aplica plantillas a los mensajes con cantidades y nombres. Un observador procesa solo los textos y atributos accesibles que cambian; conserva el original español, sin modificar identificadores, opciones internas, animaciones ni respuestas.

Las tres páginas cargan estos archivos y `idioma-voz.css`. En Reconocer números se cargan antes del bloque de juego; en las otras dos, antes del código diferido de la actividad. Al añadir un texto nuevo a estas tres aplicaciones, añadir su traducción al diccionario o a las plantillas.

`tools/probar_idioma_voz.cjs` comprueba selección predeterminada, velocidades, voces separadas por idioma, persistencia tras recarga, disponibilidad incompleta, juegos en ambos idiomas, nombres de números, teclado y validación inglesa, felicitaciones completas, etiquetas accesibles y adaptación a teléfono/tableta con zoom. Usa voces simuladas para no producir audio durante las pruebas. Se revisó además la lista real que ofrecen los navegadores instalados y la cobertura de textos en todos los criterios y modos.
