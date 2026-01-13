const canvas = document.getElementById('canvasArbol');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ramas = []; 
let petalosEstaticos = [];
let petalosCayendo = [];
let arbolListo = false; 
let desplazamientoX = 0; 
let mensajeFinalMostrado = false;
let tiempoViento = 0;

const palabrasBonitas = ["tqm", "mgm", "tqms", "mgms", "tnemv", "tqtcdm"];
const misFotosLinks = [
    "https://i.imgur.com/NavCR0Z.jpeg",
    "https://i.imgur.com/eNZAcIv.jpeg",
    "https://i.imgur.com/PtWIQEk.jpeg"
];

const POSICION_SUELO_Y = window.innerHeight * 0.85;
const PUNTO_INICIO_ARBOL = POSICION_SUELO_Y - 2; 

function iniciarCaida() {
    const cancion = document.getElementById('musica');
    if (cancion) { 
        cancion.volume = 0.6; 
        cancion.play().catch(e => console.log("Audio activo")); 
    }

    document.getElementById('figura').style.display = "none"; 
    document.getElementById('instruccion').style.display = "none"; 
    document.getElementById('suelo').style.display = "block"; 

    const bolita = document.createElement('div');
    document.body.appendChild(bolita);
    Object.assign(bolita.style, {
        position: "absolute", left: "50%", top: "50%",
        width: "20px", height: "20px", backgroundColor: "#ff4d6d",
        borderRadius: "50%", transform: "translate(-50%, -50%)", zIndex: "99"
    });

    let posY = window.innerHeight / 2;
    let velocidad = 0;

    function caer() {
        velocidad += 0.6;
        posY += velocidad;
        bolita.style.top = posY + "px";
        if (posY >= PUNTO_INICIO_ARBOL) {
            bolita.remove(); 
            escribirTexto("espacio-titulo", "FELICES 3 MESES MI AMORCITO ❤️", 80);
            dibujarArbol(canvas.width / 2, PUNTO_INICIO_ARBOL, -Math.PI / 2, 8, 110, -1);
            requestAnimationFrame(bucleAnimacion);
            return;
        }
        requestAnimationFrame(caer);
    }
    requestAnimationFrame(caer);
}

function escribirTexto(id, texto, velocidad) {
    const cont = document.getElementById(id);
    let i = 0; cont.innerHTML = "";
    function letra() { if (i < texto.length) { cont.innerHTML += texto.charAt(i); i++; setTimeout(letra, velocidad); } }
    letra();
}

function dibujarArbol(x1, y1, angulo, profundidad, magnitud, padreIdx) {
    const x2 = x1 + Math.cos(angulo) * magnitud;
    const y2 = y1 + Math.sin(angulo) * magnitud;
    const idx = ramas.length;
    ramas.push({x1, y1, x2, y2, anguloOriginal: angulo, magnitud, grosor: profundidad * 2.5, profundidad, padreIdx, x2_animado: x2, y2_animado: y2});

    if (profundidad < 6) { agregarPetalos(idx, 5); }
    if (ramas.length >= 511) {
        setTimeout(() => { arbolListo = true; iniciarLluvia(); }, 800);
    }

    if (profundidad <= 0) return;
    setTimeout(() => {
        dibujarArbol(x2, y2, angulo - 0.35, profundidad - 1, magnitud * 0.8, idx);
        setTimeout(() => { dibujarArbol(x2, y2, angulo + 0.35, profundidad - 1, magnitud * 0.8, idx); }, 60);
    }, 120);
}

function bucleAnimacion() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tiempoViento += 0.02;

    if (arbolListo && desplazamientoX < canvas.width * 0.25) { 
        desplazamientoX += 3.5; 
    } else if (arbolListo && !mensajeFinalMostrado) { 
        mensajeFinalMostrado = true; 
        mostrarMensajeFinal(); 
    }

    ramas.forEach(r => {
        if (r.padreIdx !== -1) {
            const p = ramas[r.padreIdx];
            r.x1 = p.x2_animado; r.y1 = p.y2_animado;
        } else {
            r.x1 = (canvas.width / 2) + desplazamientoX;
            r.y1 = PUNTO_INICIO_ARBOL;
        }
        let oscilacion = Math.sin(tiempoViento) * (0.015 * (8 - r.profundidad));
        r.x2_animado = r.x1 + Math.cos(r.anguloOriginal + oscilacion) * r.magnitud;
        r.y2_animado = r.y1 + Math.sin(r.anguloOriginal + oscilacion) * r.magnitud;
        
        ctx.lineWidth = r.grosor; ctx.strokeStyle = '#107a7a'; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(r.x1, r.y1); ctx.lineTo(r.x2_animado, r.y2_animado); ctx.stroke();
    });

    petalosEstaticos.forEach(p => {
        const r = ramas[p.ramaIndex];
        if (r) dibujarCorazon(r.x2_animado + p.offX, r.y2_animado + p.offY, p.size, p.color);
    });

    if (arbolListo && Math.random() < 0.06 && petalosEstaticos.length > 0) {
        let p = petalosEstaticos.splice(Math.floor(Math.random() * petalosEstaticos.length), 1)[0];
        const r = ramas[p.ramaIndex];
        p.x = r.x2_animado + p.offX; p.y = r.y2_animado + p.offY;
        p.vx = -1.2 - Math.random(); p.vy = 1 + Math.random();
        petalosCayendo.push(p);
    }
    petalosCayendo.forEach((p, idx) => {
        p.x += p.vx; p.y += p.vy;
        dibujarCorazon(p.x, p.y, p.size, p.color);
        if (p.y > canvas.height) petalosCayendo.splice(idx, 1);
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
            setTimeout(esc, 25); 
        } 
    }
    esc();
}

function iniciarLluvia() {
    const cont = document.getElementById('lluvia-contenedor');
    const div = document.createElement('div');
    div.className = 'elemento-lluvia';
    let randomNum = Math.random();
    
    if (randomNum < 0.35) { 
        const img = document.createElement('img');
        img.className = 'foto-lluvia';
        img.src = misFotosLinks[Math.floor(Math.random() * misFotosLinks.length)];
        div.appendChild(img);
    } else if (randomNum < 0.75) { 
        const cora = document.createElement('span');
        cora.className = 'corazon-lluvia';
        cora.innerText = Math.random() > 0.5 ? "❤️" : "💖";
        div.appendChild(cora);
    } else { 
        const p = document.createElement('span');
        p.innerText = palabrasBonitas[Math.floor(Math.random() * palabrasBonitas.length)];
        p.style.color = '#ff4d6d'; p.style.fontFamily = 'Verdana'; p.style.fontWeight = 'bold';
        div.appendChild(p);
    }
    
    div.style.left = (Math.random() * 95) + "vw"; 
    div.style.animationDuration = (Math.random() * 3 + 4) + "s";
    cont.appendChild(div);
    setTimeout(() => div.remove(), 7000);
    setTimeout(iniciarLluvia, 650); 
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
        petalosEstaticos.push({ ramaIndex: idx, offX: (Math.random()-0.5)*45, offY: (Math.random()-0.5)*45, size: Math.random()*3+2, color: cols[Math.floor(Math.random()*cols.length)] });
    }
}