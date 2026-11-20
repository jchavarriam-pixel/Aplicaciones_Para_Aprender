(() => {
  "use strict";

  const ruta = "ImagenesSituacionesProblemas/Ilustraciones/";
  const recienLlegan = () => state.operation === "addition";
  const idioma = () => isEnglish() ? "en" : "es";
  const reducirMovimiento = matchMedia("(prefers-reduced-motion: reduce)");
  const capacidad = 25; // Máximo del formulario: 15 iniciales y 10 llegadas.
  const escalera = {x:70, y:57};
  const bordePiscina = {x:78, y:57};
  const accesoTerraza = {x:81.5, y:57};
  const nadadores = [
    {nado:"nadador", pie:"nadador-pie", miraIzquierda:true},
    ...["luna","nico","ines","teo","ema"].map(nombre => ({
      nado:`Nadadores/${nombre}-nado`, pie:`Nadadores/${nombre}-pie`
    }))
  ];

  function lugarTerraza(indice, cantidad) {
    const filas = cantidad > 6 ? [50,32,68,14,86] : [52,31,73];
    return {x:indice % 2 ? 84.8 : 94.2, y:filas[Math.floor(indice / 2)]};
  }

  function posicionarFigura(figura, punto) {
    figura.style.left = punto.x + "%";
    figura.style.top = punto.y + "%";
  }

  function lugaresAgua(inicioX, pasoX, filas) {
    return Array.from({length:capacidad}, (_, i) => {
      // Recorrer las filas por turnos para esparcir también los grupos pequeños.
      const fila = (i * 3) % 5;
      const columna = (Math.floor(i / 5) + fila * 2 + 2) % 5;
      return {x:inicioX + columna * pasoX + (fila % 2 ? 1.8 : 0), y:filas[fila]};
    });
  }

  function lugaresNevera(cantidad) {
    const columnas = Math.ceil(cantidad / 3);
    const paso = Math.min(9, 39 / Math.max(1, columnas - 1));
    const estantes = [49.2,64.6,81.7];
    return Array.from({length:cantidad}, (_, i) => {
      const fila = i % estantes.length;
      const columna = (Math.floor(i / estantes.length) + fila) % columnas;
      return {x:44.1 + (columna - (columnas - 1) / 2) * paso, y:estantes[fila]};
    });
  }

  const escenas = [
    {
      id:"patosEstanque", clase:"estanque", emoji:"🦆", lugares:lugaresAgua(20, 15, [25,37,49,62,75]),
      fichas:["pato-sprite"], transito:"pato-vuelo",
      es:{title:"Patos en el estanque", lugar:"en el estanque", plural:"patos", singular:"pato",
        entra:["aterriza","aterrizan"], sale:["se va volando","se van volando"],
        short:"Mira cómo nadan, aterrizan o despegan los patos.", animateLabel:"▶ Mover patos",
        sceneTitle:"Observa los patos del estanque", answerQuestion:"¿Cuántos patos hay ahora en el estanque?"},
      en:{title:"Ducks in the pond", lugar:"in the pond", plural:"ducks", singular:"duck",
        entra:["lands","land"], sale:["flies away","fly away"],
        short:"Watch the ducks swim, land or take off.", animateLabel:"▶ Move the ducks",
        sceneTitle:"Watch the ducks in the pond", answerQuestion:"How many ducks are in the pond now?"}
    },
    {
      id:"frutasNevera", clase:"nevera", emoji:"🍎",
      lugares:lugaresNevera,
      fichas:["manzana","pera"],
      es:{title:"Frutas en la nevera", lugar:"en la nevera", plural:"frutas", singular:"fruta",
        entra:["se guarda","se guardan"], sale:["se saca","se sacan"],
        short:"Mira cómo se guardan o se sacan frutas de la nevera.", animateLabel:"▶ Mover frutas",
        sceneTitle:"Observa las frutas de la nevera", answerQuestion:"¿Cuántas frutas hay ahora en la nevera?"},
      en:{title:"Fruit in the fridge", lugar:"in the fridge", plural:"pieces of fruit", singular:"piece of fruit",
        entra:["is put in","are put in"], sale:["is taken out","are taken out"],
        short:"Watch fruit go into or come out of the fridge.", animateLabel:"▶ Move the fruit",
        sceneTitle:"Watch the fruit in the fridge", answerQuestion:"How many pieces of fruit are in the fridge now?"}
    },
    {
      id:"ninosPiscina", clase:"piscina", emoji:"🏊", lugares:lugaresAgua(13, 12.1, [19,33,47,61,75]),
      es:{title:"Niños en la piscina", lugar:"en la piscina", plural:"niños", singular:"niño",
        entra:["entra","entran"], sale:["sale","salen"],
        short:"Mira cómo nadan los niños y usan las escaleras para entrar o salir.", animateLabel:"▶ Mover nadadores",
        sceneTitle:"Observa los niños en la piscina", answerQuestion:"¿Cuántos niños hay ahora en la piscina?"},
      en:{title:"Children in the pool", lugar:"in the pool", plural:"children", singular:"child",
        entra:["gets in","get in"], sale:["gets out","get out"],
        short:"Watch the children swim and use the steps to get in or out.", animateLabel:"▶ Move the swimmers",
        sceneTitle:"Watch the children in the pool", answerQuestion:"How many children are in the pool now?"}
    }
  ];

  for (const config of escenas) {
    const {id, clase, es, en, emoji, fichas, lugares, transito} = config;
    const piscina = clase === "piscina";
    const selector = ".figura-situacion-nueva[data-lugar]";
    const texto = () => config[idioma()];
    let lugaresRonda;
    let elenco;
    const modo = preferenciasProblemas[id];
    if (!["alternado","azar","addition","subtraction"].includes(modo)) preferenciasProblemas[id] = "alternado";

    function cambiarOperacion(anterior) {
      const opcion = preferenciasProblemas[id];
      if (opcion === "alternado") return alternarOperacionSituaciones(anterior);
      if (opcion === "azar") return randInt(0, 1) ? "addition" : "subtraction";
      return opcion;
    }

    function cambioExplicado(cantidad, visual, resaltar) {
      const palabras = texto();
      const verbo = palabras[recienLlegan() ? "entra" : "sale"][cantidad === 1 ? 0 : 1];
      const accion = resaltar ? `<span class="keyAction">${verbo}</span>` : verbo;
      const numero = visual ? `<strong>${cantidad}</strong>` : cantidad;
      const objetos = cantidad === 1 ? palabras.singular : palabras.plural;
      return isEnglish() ? `${numero} ${objetos} ${accion}` : `${accion} ${numero} ${objetos}`;
    }

    function enunciado(total, cambio, visual = false, resaltar = false) {
      const {lugar, plural, answerQuestion} = texto();
      const numero = visual ? `<strong>${total}</strong>` : total;
      const cambioTexto = cambioExplicado(cambio, visual, resaltar);
      return isEnglish()
        ? `There are ${numero} ${plural} ${lugar}. Then ${cambioTexto}. ${answerQuestion}`
        : `Hay ${numero} ${plural} ${lugar}. Después, ${cambioTexto}. ${answerQuestion}`;
    }

    function renderizar({repetir = false} = {}) {
      clearIllustratedScene();
      const plano = document.createElement("div");
      plano.className = `plano-situacion-nueva plano-${clase}`;
      plano.setAttribute("aria-hidden", "true");
      const cantidad = recienLlegan() ? state.answer : state.total;
      plano.classList.toggle("muchas-figuras", cantidad > 12 || (piscina && !recienLlegan() && state.change > 6));
      lugaresRonda = typeof lugares === "function" ? lugares(cantidad) : lugares;
      if (clase === "nevera") {
        plano.style.setProperty("--ancho-figura", Math.min(6.8, 41 / Math.ceil(cantidad / 3)) + "cqw");
      }
      if (!piscina || !repetir) {
        state.movingIds = recienLlegan()
          ? Array.from({length:state.change}, (_, i) => state.total + i)
          : shuffle(Array.from({length:state.total}, (_, i) => i)).slice(0, state.change);
        if (piscina) elenco = shuffle([...nadadores]);
      }

      for (let i = 0; i < cantidad; i++) {
        const punto = lugaresRonda[i];
        const figura = document.createElement("span");
        figura.className = "figura-situacion-nueva";
        figura.dataset.lugar = i;
        figura.hidden = i >= state.total;
        posicionarFigura(figura, punto);
        figura.style.setProperty("--fase-nado", -(i * 313 % 3950) + "ms");
        figura.style.setProperty("--direccion-nado", (i % 2 ? -1 : 1));
        const personaje = piscina ? elenco[i % elenco.length] : null;
        const principal = personaje ? personaje.nado : fichas[i % fichas.length];
        const alterna = personaje ? personaje.pie : transito;
        if (personaje?.miraIzquierda) figura.style.setProperty("--direccion-pie", "-1");
        for (const [nombre, css] of [[principal, "pose-principal"], [alterna, "pose-transito"]]) {
          if (!nombre) continue;
          const imagen = new Image();
          imagen.className = css;
          imagen.src = ruta + nombre + ".webp";
          imagen.alt = "";
          figura.append(imagen);
        }
        plano.append(figura);
      }
      scene.append(plano);
    }

    function onda(plano, punto) {
      const marca = document.createElement("span");
      marca.className = "onda-situacion-nueva";
      marca.style.left = punto.x + "%";
      marca.style.top = (punto.y + 2.5) + "%";
      marca.addEventListener("animationend", () => marca.remove(), {once:true});
      plano.append(marca);
    }

    function recorrer(figura, base, ruta, duracion, listo) {
      // Solo se anima la traslación. La posición final sigue anclada al dibujo.
      const animacion = figura.animate(ruta.map(punto => ({
        translate:`${punto.x - base.x}cqw ${punto.y - base.y}cqh`,
        scale:punto.escala ?? 1,
        opacity:punto.opacidad ?? 1
      })), {duration:duracion, easing:"ease-in-out", fill:"forwards"});
      animacion.onfinish = () => {
        listo();
        animacion.cancel();
      };
    }

    function mover(figura, punto, orden, entrada) {
      const plano = figura.parentElement;
      const dejaPiscina = piscina && !entrada;
      const destino = dejaPiscina ? lugarTerraza(orden, state.change) : null;
      if (!entrada && !piscina) dejarRastroSituacion(figura);
      figura.hidden = false;
      const finalizar = () => {
        figura.classList.remove("en-transito","usando-escalera");
        figura.hidden = !entrada && !dejaPiscina;
        if (entrada) figura.classList.add("agregado-situacion");
        if (dejaPiscina) {
          posicionarFigura(figura, destino);
          figura.classList.add("fuera-piscina");
        }
      };
      if (piscina) figura.classList.toggle("se-retira", !entrada);
      if (reducirMovimiento.matches) {
        finalizar();
        return;
      }
      figura.classList.add("en-transito");

      if (piscina) {
        const nadar = [escalera, {x:Math.min(60,punto.x + 17), y:punto.y}, punto];
        if (entrada) {
          const caminar = [{x:94.2, y:57}, bordePiscina, escalera];
          figura.classList.add("usando-escalera");
          recorrer(figura, punto, caminar, 720, () => {
            figura.classList.remove("usando-escalera");
            onda(plano, escalera);
            recorrer(figura, punto, nadar, 900, finalizar);
          });
        } else {
          recorrer(figura, punto, nadar.reverse(), 950, () => {
            figura.classList.add("usando-escalera");
            onda(plano, escalera);
            const caminar = [escalera, bordePiscina, accesoTerraza, {x:accesoTerraza.x, y:destino.y}, destino];
            recorrer(figura, punto, caminar, 990, finalizar);
          });
        }
        return;
      }

      if (clase === "estanque") {
        const extremoX = entrada ? -6 - (orden % 3) * 5 : 105 + (orden % 3) * 5;
        const cielo = {x:extremoX, y:-8, escala:.62, opacidad:.25};
        const arco = {x:(punto.x + extremoX) / 2, y:Math.max(8,punto.y - 32), escala:1.22};
        recorrer(figura, punto, entrada ? [cielo, arco, punto] : [punto, arco, cielo], 1180, () => {
          finalizar();
          if (entrada) onda(plano, punto);
        });
        return;
      }

      const fuera = {x:44.1 + (orden % 3 - 1) * 9, y:104, opacidad:.15};
      const entradaNevera = {x:punto.x, y:Math.min(91, punto.y + 12), escala:1.14};
      const sobreEstante = {x:punto.x, y:punto.y - 1.6};
      const pasos = [fuera, entradaNevera, sobreEstante, punto];
      recorrer(figura, punto, entrada ? pasos : pasos.reverse(), 880, finalizar);
    }

    function animar() {
      if (state.animated) return;
      state.animated = true;
      const entrada = recienLlegan();
      const figuras = scene.querySelectorAll(selector);
      for (const [orden, indice] of state.movingIds.entries()) {
        const empezar = () => mover(figuras[indice], lugaresRonda[indice], orden, entrada);
        if (reducirMovimiento.matches) empezar();
        else esperarEnEscena(empezar, 55 + orden * (piscina ? 390 : 165));
      }
      feedback.className = "feedback";
      feedback.textContent = entrada
        ? (isEnglish() ? "Find the new arrivals with the yellow glow." : "Fíjate en los que llegaron con brillo amarillo.")
        : piscina
          ? (isEnglish() ? "Count only the children still in the water." : "Cuenta solo a los niños que siguen en el agua.")
        : (isEnglish() ? "Count only the objects in color." : "Cuenta solo los que quedaron en color.");
      speak(enunciado(state.total, state.change));
    }

    registerScene({
      id, operation:"addition", chooseOperation:cambiarOperacion,
      itemSingular:es.singular, itemPlural:es.plural, itemSingularEn:en.singular, itemPluralEn:en.plural,
      texts:{
        es:{...es, badge:`${emoji} Suma y resta`},
        en:{...en, badge:`${emoji} Addition and subtraction`}
      },
      renderPreview(box) {
        const imagen = new Image();
        imagen.src = `ImagenesSituacionesProblemas/Fichas/${clase}.webp`;
        imagen.alt = "";
        box.replaceChildren(imagen);
      },
      renderScene:renderizar, animate:animar,
      story:(_, total, cambio, resaltar) => enunciado(total,cambio,true,resaltar),
      speak:(_, total, cambio) => enunciado(total,cambio),
      hintData:(total,cambio) => isEnglish()
        ? `At the start: <strong>${total}</strong> ${en.plural}. Then ${cambioExplicado(cambio,true,true)}.`
        : `Al inicio: <strong>${total}</strong> ${es.plural}. Después, ${cambioExplicado(cambio,true,true)}.`,
      hintKeyword:() => isEnglish()
        ? "Does the highlighted action add to the group or take away from it?"
        : "¿La acción destacada agrega elementos al grupo o los quita?",
      hintOperation:(total,cambio) => isEnglish()
        ? `Use <strong>${recienLlegan() ? "addition" : "subtraction"}</strong>: ${total} ${getExpectedSymbol()} ${cambio}.`
        : `Usa una <strong>${recienLlegan() ? "suma" : "resta"}</strong>: ${total} ${getExpectedSymbol()} ${cambio}.`
    });
  }
})();
