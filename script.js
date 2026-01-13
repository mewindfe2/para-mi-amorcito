const canvas = document.getElementById('canvasArbol');
const ctx = canvas.getContext('2d');

let POSICION_SUELO_Y, PUNTO_INICIO_ARBOL;

function ajustarDimensiones() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    POSICION_SUELO_Y = window.innerHeight * 0.85;
    PUNTO_INICIO_ARBOL = POSICION_SUELO_Y; // Exactamente sobre el suelo
}
window.addEventListener('resize', ajustarDimensiones);
ajustarDimensiones();

let ramas = [], petalosEstaticos = [], petalosCayendo = [];
let arbolListo = false, desplazamientoX = 0, mensajeFinalMostrado = false, tiempoViento = 0;

const misFotosLinks = ["https://i.imgur.com/NavCR0Z.jpeg", "https://i.imgur.com/eNZAcIv.jpeg", "https://i.imgur.com/PtWIQEk.jpeg"];
const palabrasBonitas = ["tqm", "mgm", "tqms", "mgms", "tnemv", "tqtcdm"];

// Iniciar con clic o toque
const figura = document.getElementById('figura');
figura.addEventListener('click', iniciarCaida);
figura.addEventListener('touchstart', (e) => { e.preventDefault(); iniciarCaida(); });

function iniciarCaida() {
    const cancion = document.getElementById('musica');
    if (cancion) { cancion.volume = 0.6; cancion.play(); }

    document.getElementById('figura').style.display = "none";
    document.getElementById('instruccion').style.display = "none";
    document.getElementById('suelo').style.display = "block";

    const bolita = document.createElement('div');
    document.body.appendChild(bolita);
    Object.assign(bolita.style, {
        position: "absolute", left: "50%", top: "50%", width: "15px", height: "15px",
        backgroundColor: "#ff4d6d", borderRadius: "50%", transform: "translate(-50%, -50%)"
    });

    let posY = window.innerHeight / 2, velocidad = 0;
    function caer() {
        velocidad += 0.5; posY += velocidad;
        bolita.style.top = posY + "px";
        if (posY >= PUNTO_INICIO_ARBOL) {
            bolita.remove();
            escribirTexto("espacio-titulo", "FELICES 3 MESES MI AMORCITO ❤️", 60);
            dibujarArbol(canvas.width / 2, PUNTO_INICIO_ARBOL, -Math.PI / 2, 8, window.innerWidth < 800 ? 65 : 100, -1);
            requestAnimationFrame(bucleAnimacion);
            return;
        }
        requestAnimationFrame(caer);
    }
    caer();
}

function escribirTexto(id, texto, vel) {
    const el = document.getElementById(id);
    let i = 0; el.innerHTML = "";
    function tip() { if(i < texto.length) { el.innerHTML += texto.charAt(i); i++; setTimeout(tip, vel); } }
    tip();
}

function dibujarArbol(x1, y1, ang, prof, mag, pIdx) {
    const x2 = x1 + Math.cos(ang) * mag, y2 = y1 + Math.sin(ang) * mag;
    const idx = ramas.length;
    ramas.push({x1, y1, x2, y2, anguloOriginal: ang, magnitud: mag, grosor: prof * 2, profundidad: prof, padreIdx: pIdx, x2_animado: x2, y2_animado: y2});
    if (prof < 6) agregarPetalos(idx, 4);
    if (ramas.length >= 511) { setTimeout(() => { arbolListo = true; iniciarLluvia(); }, 500); }
    if (prof <= 0) return;
    setTimeout(() => {
        dibujarArbol(x2, y2, ang - 0.35, prof - 1, mag * 0.8, idx);
        setTimeout(() => dibujarArbol(x2, y2, ang + 0.35, prof - 1, mag * 0.8, idx), 40);
    }, 100);
}

function bucleAnimacion() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tiempoViento += 0.02;
    // Mover el árbol a la izquierda para dejar espacio a la carta
    let metaX = -(canvas.width * 0.2); 
    if (arbolListo && desplazamientoX > metaX) { desplazamientoX -= 2; } 
    else if (arbolListo && !mensajeFinalMostrado) { mensajeFinalMostrado = true; mostrarMensajeFinal(); }

    ramas.forEach(r => {
        if (r.padreIdx !== -1) { r.x1 = ramas[r.padreIdx].x2_animado; r.y1 = ramas[r.padreIdx].y2_animado; }
        else { r.x1 = (canvas.width / 2) + desplazamientoX; r.y1 = PUNTO_INICIO_ARBOL; }
        let osc = Math.sin(tiempoViento) * (0.02 * (8 - r.profundidad));
        r.x2_animado = r.x1 + Math.cos(r.anguloOriginal + osc) * r.magnitud;
        r.y2_animado = r.y1 + Math.sin(r.anguloOriginal + osc) * r.magnitud;
        ctx.lineWidth = r.grosor; ctx.strokeStyle = '#107a7a'; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(r.x1, r.y1); ctx.lineTo(r.x2_animado, r.y2_animado); ctx.stroke();
    });
    petalosEstaticos.forEach(p => {
        const r = ramas[p.ramaIndex];
        if (r) dibujarCorazon(r.x2_animado + p.offX, r.y2_animado + p.offY, p.size, p.color);
    });
    requestAnimationFrame(bucleAnimacion);
}

function mostrarMensajeFinal() {
    const m = document.createElement('div');
    m.className = 'carta-antigua';
    document.body.appendChild(m);
    const txt = "Amorcito ya pasaron 3 meses desde que decidimos ser pareja y han sido suficientes para darme cuenta de que tu eres la persona que quiero que este a mi lado, que quiero compartir toda mi vida contigo mi amorcito, cada dia que pasa te amo mas mi Luana...\n\nNo sabes lo muy bonito que se siente tenerte a ti como pareja y poder amarte mucho muchisimo mi amorcito. Siempre me encantara recordar de como empezó todo, de comenzar con hablando muy noche de cualquier tema, a stikers de corazones, despues decirnos tqm, mgm, tqemv...\n\nAque despues me digas teamodoro, luego decirnos te amo aunque no era tan recurrente, despues eso era a diario porque nos amamos mucho y despues pasamos a decirnos amor, aunque al principio decias que no me lo dirias siempre o que era rarito decirme, ahora es la palabra que mas nos decimos y despues de todo este tiempo, podemos decir que progresamos muchisimo mi amorcito ❤️\n\nQuiero que sigamos por mas. Porque enserio quiero algo mas que solo 3 o 4 meses contigo, quiero una vida estando a tu lado, claro si tu me lo permites. Gracias por quererme tanto como yo te amo y nunca olvides que siempre te amare mi Luanita.";
    let i = 0;
    function esc() { 
        if (i < txt.length) { 
            m.innerHTML += txt.charAt(i); 
            i++; 
            m.scrollTop = m.scrollHeight; 
            setTimeout(esc, 30); 
        } 
    }
    esc();
}

function iniciarLluvia() {
    const cont = document.getElementById('lluvia-contenedor');
    setInterval(() => {
        const div = document.createElement('div');
        div.className = 'elemento-lluvia';
        let r = Math.random();
        if (r < 0.3) {
            const img = document.createElement('img'); img.className = 'foto-lluvia';
            img.src = misFotosLinks[Math.floor(Math.random()*misFotosLinks.length)];
            div.appendChild(img);
        } else {
            const s = document.createElement('span'); s.className = 'corazon-lluvia';
            s.innerText = r < 0.7 ? "❤️" : palabrasBonitas[Math.floor(Math.random()*palabrasBonitas.length)];
            s.style.color = "#d81b60"; div.appendChild(s);
        }
        div.style.left = Math.random() * 90 + "vw";
        div.style.animationDuration = (Math.random()*3+4)+"s";
        cont.appendChild(div);
        setTimeout(() => div.remove(), 7000);
    }, 600);
}

function dibujarCorazon(x, y, size, color) {
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y);
    ctx.bezierCurveTo(x, y - size, x - size * 1.5, y - size, x - size * 1.5, y);
    ctx.bezierCurveTo(x - size * 1.5, y + size, x, y + size * 2, x, y + size * 2);
    ctx.bezierCurveTo(x, y + size * 2, x + size * 1.5, y + size, x + size * 1.5, y);
    ctx.bezierCurveTo(x + size * 1.5, y - size, x, y - size, x, y); ctx.fill();
}

function agregarPetalos(idx, cant) {
    const cols = ['#FF007F', '#FF4D6D', '#FFD700', '#FF85A1', '#FF0000'];
    for (let i = 0; i < cant; i++) {
        petalosEstaticos.push({ ramaIndex: idx, offX: (Math.random()-0.5)*40, offY: (Math.random()-0.5)*40, size: Math.random()*2+2, color: cols[Math.floor(Math.random()*cols.length)] });
    }
}