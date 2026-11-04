// Construction procédurale de la chambre (aucun modèle externe).
// Repère : sol en y=0, mur du fond en z=-3, mur de gauche en x=-3. Le visiteur regarde depuis +x/+z.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { BADGES } from './story.js';

/* ---------------------------------------------------------------- helpers */
const matCache = new Map();
function std(color, o = {}) {
    const key = color + JSON.stringify(o);
    if (!matCache.has(key)) {
        matCache.set(key, new THREE.MeshStandardMaterial({
            color, roughness: o.rough ?? 0.8, metalness: o.metal ?? 0,
            emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 1, flatShading: !!o.flat
        }));
    }
    return matCache.get(key);
}

function rbox(w, h, d, color, o = {}) {
    const r = Math.min(o.r ?? 0.03, Math.min(w, h, d) / 2 - 0.001);
    const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.max(r, 0.001)), o.mat ?? std(color, o));
    m.castShadow = o.cast ?? true;
    m.receiveShadow = true;
    return m;
}

function at(obj, x, y, z, ry = 0) { obj.position.set(x, y, z); obj.rotation.y = ry; return obj; }

// Texture dessinée sur un canvas (écrans, affiches, calendrier…)
function canvasTex(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return { c, ctx, tex, w, h };
}

function screenPlane(w, h, ct, glow = 1) {
    const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ map: ct.tex, toneMapped: false, color: new THREE.Color(glow, glow, glow) })
    );
    return m;
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
}

const MONO = '"JetBrains Mono", ui-monospace, monospace';
const SANS = '"Space Grotesk", system-ui, sans-serif';

/* ---------------------------------------------------------------- dessins */
const T = (lang, fr, en) => (lang === 'en' ? en : fr);

// État forcé des écrans pendant les scènes animées (null = état final du chapitre)
export const screenMode = { phone: null, monitor: null, stats: null };

function drawPhone(ct, ch, lang, t) {
    const { ctx, w, h } = ct;
    ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
    if (ch === 2 || ch === 3) {             // téléphone posé, écran éteint
        ctx.fillStyle = '#05070a'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w * 0.6, 0); ctx.lineTo(0, h * 0.5); ctx.fill();
        return;
    }
    if (ch <= 1) {                           // Pydroid
        ctx.fillStyle = '#c4302b'; ctx.fillRect(0, 0, w, 64);
        ctx.fillStyle = '#fff'; ctx.font = `600 22px ${SANS}`;
        ctx.fillText('▶  Code avec Jonathan', 18, 41);
        ctx.fillStyle = '#2e7d32'; ctx.fillRect(0, 64, w, 44);
        ctx.font = `600 20px ${SANS}`; ctx.fillStyle = '#fff'; ctx.fillText('Pydroid 3', 18, 93);
        ctx.font = `20px ${MONO}`;
        const code = ch === 0
            ? [['#c586c0', 'print'], ['#ce9178', '("Hello World")']]
            : [['#c586c0', 'import '], ['#9cdcfe', 'tkinter']];
        let x = 18; code.forEach(([col, s]) => { ctx.fillStyle = col; ctx.fillText(s, x, 150); x += ctx.measureText(s).width; });
        if (ch === 1) {
            ctx.fillStyle = '#9cdcfe'; ctx.fillText('root = tkinter.Tk()', 18, 180);
            ctx.fillText('root.mainloop()', 18, 210);
        }
        ctx.fillStyle = '#161b22'; ctx.fillRect(0, 300, w, h - 300);
        ctx.fillStyle = '#8b949e'; ctx.font = `16px ${MONO}`; ctx.fillText('>>> run', 18, 334);
        if (screenMode.phone === 'typing') {
            if (Math.floor(t * 3) % 2) { ctx.fillStyle = '#ffb547'; ctx.fillRect(18, 366, 12, 24); }
        } else if (ch === 0 && screenMode.phone === 'error') {
            ctx.fillStyle = 'rgba(255,80,80,0.15)'; ctx.fillRect(0, 350, w, 120);
            ctx.fillStyle = '#ff6b6b'; ctx.font = `600 19px ${MONO}`;
            ctx.fillText('IndentationError:', 18, 390); ctx.fillText('unexpected indent', 18, 420);
        } else if (ch === 0) {
            ctx.fillStyle = '#4ade80'; ctx.font = `600 30px ${MONO}`; ctx.fillText('Hello World', 18, 384);
            ctx.fillStyle = '#8b949e'; ctx.font = `14px ${MONO}`;
            ctx.fillText(T(lang, '(après 1000 IndentationError)', '(after 1000 IndentationErrors)'), 18, 440);
        } else {
            const blink = Math.floor(t * 2) % 2 === 0;
            ctx.fillStyle = blink ? '#ff6b6b' : '#a33'; ctx.font = `600 18px ${MONO}`;
            ctx.fillText(T(lang, 'Erreur : aucune fenêtre', 'Error: no window'), 18, 384);
            ctx.fillStyle = '#8b949e'; ctx.font = `15px ${MONO}`;
            ctx.fillText(T(lang, '(tentative n°47)', '(attempt #47)'), 18, 414);
        }
        return;
    }
    if (ch === 4) {                          // WhatsApp : ping -> pong
        ctx.fillStyle = '#0b141a'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#1f2c34'; ctx.fillRect(0, 0, w, 76);
        ctx.fillStyle = '#25d366'; ctx.beginPath(); ctx.arc(40, 38, 20, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = `600 22px ${SANS}`; ctx.fillText(T(lang, 'Mon bot', 'My bot'), 72, 36);
        ctx.fillStyle = '#8696a0'; ctx.font = `15px ${SANS}`; ctx.fillText(T(lang, 'en ligne', 'online'), 72, 58);
        const step = screenMode.phone === 'typing' ? -1 : screenMode.phone === 'ping' ? 0 : Math.floor(t * 0.7) % 4;
        ctx.font = `22px ${SANS}`;
        if (step >= 0) {
            ctx.fillStyle = '#005c4b'; roundRect(ctx, w - 150, 120, 130, 46, 12); ctx.fill();
            ctx.fillStyle = '#e9edef'; ctx.fillText('!ping', w - 130, 151);
        }
        if (step >= 1) {
            ctx.fillStyle = '#202c33'; roundRect(ctx, 20, 190, 150, 46, 12); ctx.fill();
            ctx.fillStyle = '#e9edef'; ctx.fillText('pong 🏓', 38, 221);
        }
        if (step >= 2) {
            ctx.fillStyle = '#005c4b'; roundRect(ctx, w - 200, 260, 180, 46, 12); ctx.fill();
            ctx.fillStyle = '#e9edef'; ctx.fillText(T(lang, 'IL MARCHE !!!', 'IT WORKS!!!'), w - 186, 291);
        }
        return;
    }
    if (ch === 5) {
        ctx.fillStyle = '#0b1220'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#25d366'; ctx.font = `700 34px ${SANS}`; ctx.fillText('VansTech', 30, 120);
        ctx.fillStyle = '#9fb0c8'; ctx.font = `18px ${SANS}`;
        ctx.fillText(T(lang, 'Bot déployé ✓', 'Bot deployed ✓'), 30, 160);
        ctx.fillText('vanstech.space', 30, 190);
        return;
    }
    // ch 6 : contact
    ctx.fillStyle = '#16110a'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffb547'; ctx.font = `700 64px ${SANS}`; ctx.fillText('✉', w / 2 - 28, 190);
    ctx.font = `700 26px ${SANS}`; ctx.textAlign = 'center';
    ctx.fillText(T(lang, 'Écrivez-moi', 'Write to me'), w / 2, 250);
    ctx.fillStyle = '#d8cbb4'; ctx.font = `18px ${SANS}`;
    ctx.fillText(T(lang, 'Missions freelance', 'Freelance projects'), w / 2, 286);
    ctx.textAlign = 'left';
}

function drawMonitor(ct, ch, lang, t) {
    const { ctx, w, h } = ct;
    const line = (txt, x, y, col, size = 18) => { ctx.fillStyle = col; ctx.font = `${size}px ${MONO}`; ctx.fillText(txt, x, y); };
    if (ch === 2) {                          // IDLE + Tkinter
        ctx.fillStyle = '#fdfdfd'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#dfe6ee'; ctx.fillRect(0, 0, w, 34);
        line('calculatrice.py', 14, 23, '#334', 16);
        const L = [['from tkinter import *', '#ff7700'], ['fen = Tk()', '#000'], ["fen.title('Calculatrice')", '#008000'],
            ['ecran = Entry(fen)', '#000'], ["Button(fen, text='=',", '#000'], ['       command=calcul)', '#000'], ['fen.mainloop()', '#000']];
        L.forEach(([s, c], i) => line(s, 20, 70 + i * 32, c));
        if (Math.floor(t * 2) % 2) { ctx.fillStyle = '#000'; ctx.fillRect(190, 70 + 6 * 32 - 18, 2, 22); }
        if (screenMode.monitor === 'error') {
            ctx.fillStyle = '#ffe5e5'; ctx.fillRect(0, h - 64, w, 64);
            line("NameError: name 'resultat'", 14, h - 38, '#d00', 17);
            line('           is not defined', 14, h - 14, '#d00', 17);
        }
        return;
    }
    if (ch === 3) {                          // navigateur + console rouge
        ctx.fillStyle = '#e8eaed'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#dadce0'; ctx.fillRect(0, 0, w, 36);
        ['#ff5f56', '#ffbd2e', '#27c93f'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(18 + i * 18, 18, 6, 0, 7); ctx.fill(); });
        ctx.fillStyle = '#fff'; roundRect(ctx, 80, 8, 300, 20, 10); ctx.fill();
        line('mon-site-vitrine.html', 92, 23, '#555', 13);
        const g = ctx.createLinearGradient(0, 36, w, 200);
        g.addColorStop(0, '#2b1055'); g.addColorStop(1, '#ff6a3d');
        ctx.fillStyle = g; ctx.fillRect(0, 36, w, 180);
        ctx.fillStyle = '#fff'; ctx.font = `700 34px ${SANS}`; ctx.fillText(T(lang, 'Bienvenue', 'Welcome'), 30, 110);
        const bx = 300 + Math.sin(t * 2.4) * 120;
        ctx.fillStyle = '#ffd43b'; ctx.beginPath(); ctx.arc(bx, 150 - Math.abs(Math.sin(t * 4.8)) * 50, 16, 0, 7); ctx.fill();
        ctx.fillStyle = '#202124'; ctx.fillRect(0, 216, w, h - 216);
        line('Console', 12, 238, '#9aa0a6', 13);
        if (screenMode.monitor === 'ok') { line(T(lang, '✓ 0 erreur. Enfin.', '✓ 0 errors. Finally.'), 12, 268, '#4ade80', 15); return; }
        if (screenMode.monitor === 'typing') { return; }
        if (Math.floor(t * 1.5) % 2 === 0) {
            ctx.fillStyle = 'rgba(255,80,80,0.15)'; ctx.fillRect(0, 248, w, 30);
        }
        line('✖ Uncaught TypeError: $(...) is undefined', 12, 268, '#ff6b6b', 15);
        line('✖ Cannot read properties of undefined', 12, 298, '#ff6b6b', 15);
        return;
    }
    if (ch === 4) {                          // terminal du bot
        ctx.fillStyle = '#0c0f14'; ctx.fillRect(0, 0, w, h);
        const logs = [
            ['$ npm run dev', '#c9d1d9'], [T(lang, '✓ Connexion à WhatsApp…', '✓ Connecting to WhatsApp…'), '#4ade80'],
            ['✖ TypeError: Cannot read properties', '#ff6b6b'], ["  of undefined (reading 'id')", '#ff6b6b'],
            [T(lang, '⚠ QR expiré, rescanner (encore)', '⚠ QR expired, scan again (again)'), '#ffb547'],
            [T(lang, '✖ Promise oubliée : await manquant', '✖ Forgot the await again'), '#ff6b6b'],
            ['$ tsc --noEmit', '#c9d1d9'], [T(lang, '✓ 0 erreur. Merci TypeScript.', '✓ 0 errors. Thanks TypeScript.'), '#4ade80'],
            ['> !ping', '#79c0ff'], ['< pong 🏓', '#4ade80']
        ];
        const shown = Math.floor(t * 1.6) % (logs.length + 4);
        logs.slice(0, Math.min(shown, logs.length)).forEach(([s, c], i) => line(s, 16, 30 + i * 28, c, 16));
        return;
    }
    if (ch === 5 && screenMode.monitor === 'error') {   // la page qui fait peur
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#111'; ctx.font = `700 40px ${SANS}`; ctx.textAlign = 'center';
        ctx.fillText('502 Bad Gateway', w / 2, 140);
        ctx.fillStyle = '#ccc'; ctx.fillRect(40, 170, w - 80, 2);
        ctx.fillStyle = '#333'; ctx.font = `20px ${MONO}`; ctx.fillText('nginx', w / 2, 210); ctx.textAlign = 'left';
        return;
    }
    if (ch === 5 && screenMode.monitor === 'typing') {
        ctx.fillStyle = '#0c0f14'; ctx.fillRect(0, 0, w, h);
        [['$ docker compose up -d', '#c9d1d9'], ['$ sudo nginx -t', '#c9d1d9'], ['$ npx prisma migrate deploy', '#c9d1d9']]
            .slice(0, 1 + Math.floor(t * 1.5) % 3).forEach(([s2, c], i) => line(s2, 16, 34 + i * 30, c, 16));
        return;
    }
    if (ch === 5) {                          // tableau de bord VansTech
        ctx.fillStyle = '#0b1220'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#111a2e'; ctx.fillRect(0, 0, 120, h);
        ctx.fillStyle = '#25d366'; ctx.font = `700 20px ${SANS}`; ctx.fillText('VansTech', 14, 34);
        [T(lang, 'Bots', 'Bots'), T(lang, 'Déploiements', 'Deploys'), 'Logs'].forEach((s, i) => line(s, 14, 80 + i * 30, '#7f8ea8', 14));
        const card = (x, label, val) => {
            ctx.fillStyle = '#16213a'; roundRect(ctx, x, 20, 175, 90, 10); ctx.fill();
            line(label, x + 14, 48, '#7f8ea8', 14);
            ctx.fillStyle = '#fff'; ctx.font = `700 32px ${SANS}`; ctx.fillText(val, x + 14, 92);
        };
        card(138, T(lang, 'Inscrits', 'Sign-ups'), '3 000+');
        card(325, T(lang, 'Actifs', 'Active'), '100+');
        for (let i = 0; i < 12; i++) {
            const bh = 30 + (Math.sin(i * 1.3 + t * 1.2) * 0.5 + 0.5) * 120;
            ctx.fillStyle = i % 3 === 0 ? '#25d366' : '#2f6fed';
            ctx.fillRect(140 + i * 30, 300 - bh, 18, bh);
        }
        return;
    }
    // ch 6 : disponible
    ctx.fillStyle = '#16130f'; ctx.fillRect(0, 0, w, h);
    const L = [['const ', '#c586c0'], ['vanscode', '#9cdcfe'], [' = {', '#d4d4d4']];
    let x = 20; L.forEach(([s, c]) => { line(s, x, 50, c); ctx.font = `18px ${MONO}`; x += ctx.measureText(s).width; });
    line(T(lang, '  disponible: ', '  available: ') + 'true,', 20, 84, '#d4d4d4');
    line("  missions: ['web', 'api',", 20, 118, '#ce9178');
    line("             'bots', 'saas'],", 20, 152, '#ce9178');
    line(T(lang, "  depuis: 2020,", "  since: 2020,"), 20, 186, '#b5cea8');
    line('};', 20, 220, '#d4d4d4');
    if (Math.floor(t * 2) % 2) { ctx.fillStyle = '#ffb547'; ctx.fillRect(48, 204, 10, 20); }
}

function drawCalendar(ct, ch, label, lang) {
    const { ctx, w, h } = ct;
    ctx.fillStyle = '#fbfaf6'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#d64545'; ctx.fillRect(0, 0, w, 110);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    ctx.font = `700 ${label.length > 6 ? 46 : 72}px ${SANS}`;
    ctx.fillText(label, w / 2, label.length > 6 ? 72 : 84);
    ctx.fillStyle = '#d7d2c5';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) ctx.fillRect(28 + c * 46, 140 + r * 40, 34, 26);
    ctx.fillStyle = '#d64545'; ctx.fillRect(28 + ((ch * 3) % 7) * 46, 140 + (ch % 4) * 40, 34, 26);
    ctx.fillStyle = '#5b5446'; ctx.font = `600 20px ${SANS}`;
    ctx.fillText(T(lang, 'Cliquez → année suivante', 'Click → next year'), w / 2, h - 22);
    ctx.textAlign = 'left';
}

function drawTurtlePoster(ct) {
    const { ctx, w, h } = ct;
    ctx.fillStyle = '#fffdf6'; ctx.fillRect(0, 0, w, h);
    ctx.translate(w / 2, h / 2 - 20);
    const cols = ['#e63946', '#f4a261', '#2a9d8f', '#457b9d', '#8338ec'];
    let len = 4;
    ctx.lineWidth = 2;
    let x = 0, y = 0, a = 0;
    for (let i = 0; i < 150; i++) {
        const nx = x + Math.cos(a) * len, ny = y + Math.sin(a) * len;
        ctx.strokeStyle = cols[i % cols.length];
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx, ny); ctx.stroke();
        x = nx; y = ny; a += (91 * Math.PI) / 180; len += 1.3;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#2e7d32'; ctx.font = `600 22px ${MONO}`; ctx.textAlign = 'center';
    ctx.fillText('turtle.py 🐢', w / 2, h - 24); ctx.textAlign = 'left';
}

function drawWebPoster(ct, variant, lang) {
    const { ctx, w, h } = ct;
    if (variant === 0) {
        const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#0f2027'); g.addColorStop(1, '#2c5364');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#e34c26'; ctx.font = `700 46px ${SANS}`; ctx.fillText('<html>', 26, 80);
        ctx.fillStyle = '#fff'; ctx.font = `700 34px ${SANS}`;
        ctx.fillText(T(lang, 'Site', 'Showcase'), 26, 170); ctx.fillText(T(lang, 'vitrine', 'website'), 26, 210);
        ctx.fillStyle = '#ffd43b'; roundRect(ctx, 26, 250, 150, 44, 22); ctx.fill();
        ctx.fillStyle = '#111'; ctx.font = `600 18px ${SANS}`; ctx.fillText(T(lang, 'Découvrir', 'Discover'), 52, 279);
    } else {
        ctx.fillStyle = '#0e100f'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#0ae448'; ctx.font = `800 64px ${SANS}`; ctx.fillText('GSAP', 26, 110);
        ctx.fillStyle = '#fffce1'; ctx.font = `20px ${MONO}`;
        ctx.fillText('gsap.to(".box", {', 26, 180); ctx.fillText('  x: 300,', 26, 210); ctx.fillText('  ease: "bounce"', 26, 240); ctx.fillText('});', 26, 270);
        ctx.fillStyle = '#ff8709'; roundRect(ctx, 200, 300, 40, 40, 8); ctx.fill();
    }
}

function drawNeon(ct, lines, color) {
    const { ctx, w, h } = ct;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(10,8,18,0.92)'; roundRect(ctx, 4, 4, w - 8, h - 8, 24); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.shadowColor = color; ctx.shadowBlur = 18;
    roundRect(ctx, 10, 10, w - 20, h - 20, 20); ctx.stroke();
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
    lines.forEach(([txt, size, y]) => { ctx.font = `700 ${size}px ${SANS}`; ctx.fillText(txt, w / 2, y); });
    ctx.shadowBlur = 0; ctx.textAlign = 'left';
}

function drawPostit(ct, text, color, ink) {
    const { ctx, w, h } = ct;
    ctx.fillStyle = color; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, 0, w, 14);
    ctx.fillStyle = ink; ctx.font = `700 22px ${MONO}`; ctx.textAlign = 'center';
    text.split('\n').forEach((s, i, arr) => ctx.fillText(s, w / 2, h / 2 + (i - (arr.length - 1) / 2) * 28 + 8));
    ctx.textAlign = 'left';
}

function drawCalcWindow(ct) {
    const { ctx, w, h } = ct;
    ctx.fillStyle = '#ececec'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#3c3c3c'; ctx.fillRect(0, 0, w, 34);
    ctx.fillStyle = '#fff'; ctx.font = `600 16px ${SANS}`; ctx.fillText('🐍 Calculatrice', 12, 23);
    ctx.fillStyle = '#fff'; ctx.fillRect(14, 48, w - 28, 54);
    ctx.fillStyle = '#111'; ctx.font = `600 28px ${MONO}`; ctx.textAlign = 'right'; ctx.fillText('2 + 2 = 4', w - 26, 86); ctx.textAlign = 'center';
    const keys = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'];
    keys.forEach((k, i) => {
        const x = 14 + (i % 4) * ((w - 28) / 4), y = 116 + Math.floor(i / 4) * 54;
        ctx.fillStyle = k === '=' ? '#ffb547' : '#d6d6d6'; ctx.fillRect(x + 3, y, (w - 28) / 4 - 6, 46);
        ctx.fillStyle = '#111'; ctx.font = `600 22px ${MONO}`; ctx.fillText(k, x + (w - 28) / 8, y + 31);
    });
    ctx.textAlign = 'left';
}

function drawGalleryWindow(ct) {
    const { ctx, w, h } = ct;
    ctx.fillStyle = '#ececec'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#3c3c3c'; ctx.fillRect(0, 0, w, 34);
    ctx.fillStyle = '#fff'; ctx.font = `600 16px ${SANS}`; ctx.fillText('🐍 Galerie', 12, 23);
    const skies = ['#87ceeb', '#ffb347', '#6a5acd', '#4ecdc4', '#ff8fa3', '#98d8a0'];
    skies.forEach((s, i) => {
        const tw = (w - 48) / 3, th = (h - 70) / 2, x = 12 + (i % 3) * (tw + 12), y = 46 + Math.floor(i / 3) * (th + 10);
        ctx.fillStyle = s; ctx.fillRect(x, y, tw, th);
        ctx.fillStyle = 'rgba(30,60,40,0.75)';
        ctx.beginPath(); ctx.moveTo(x, y + th); ctx.lineTo(x + tw * 0.35, y + th * 0.45); ctx.lineTo(x + tw * 0.6, y + th * 0.75);
        ctx.lineTo(x + tw * 0.8, y + th * 0.5); ctx.lineTo(x + tw, y + th); ctx.fill();
        ctx.fillStyle = '#fff6b0'; ctx.beginPath(); ctx.arc(x + tw * 0.78, y + th * 0.25, 8, 0, 7); ctx.fill();
    });
}

function drawBadge(ct, b) {
    const { ctx, w, h } = ct;
    ctx.fillStyle = b.color; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = b.ink; ctx.textAlign = 'center';
    ctx.font = `700 ${b.label.length > 5 ? 26 : 38}px ${SANS}`;
    ctx.fillText(b.label, w / 2, h / 2 + 12); ctx.textAlign = 'left';
}

/* ---------------------------------------------------------------- chambre */
export const ENVS = [
    // 2020 : nuit, seul le téléphone éclaire
    { hemi: 0.95, sky: '#4a5d9a', ground: '#1a1410', sun: 0.25, sunColor: '#8fa8ff', window: '#0d1530', lamp: 0, bg: '#06080f', wall: '#3a4470' },
    // 2021 : nuit + alarme rouge
    { hemi: 0.85, sky: '#53406a', ground: '#1a1010', sun: 0.15, sunColor: '#8f8fff', window: '#0a0f22', lamp: 0, bg: '#0a0608', wall: '#463a5c', alarm: true },
    // 2022-23 : journée, arrivée du PC
    { hemi: 1.45, sky: '#ffeccc', ground: '#3a2a1f', sun: 1.1, sunColor: '#ffe2b0', window: '#86c8ff', lamp: 3, bg: '#121826', wall: '#3d4a6e' },
    // 2023-24 : coucher de soleil
    { hemi: 1.35, sky: '#ffcfa8', ground: '#3a2a1f', sun: 0.9, sunColor: '#ffb27a', window: '#ff9a6a', lamp: 5, bg: '#1a1420', wall: '#3f3f68' },
    // 2025 : nuit de code
    { hemi: 1.05, sky: '#6a7fd0', ground: '#1a1410', sun: 0.3, sunColor: '#9fb0ff', window: '#141c44', lamp: 7, bg: '#080b16', wall: '#2c3558' },
    // 2026 : nuit, serveurs allumés
    { hemi: 1.05, sky: '#5fa8ff', ground: '#10161a', sun: 0.3, sunColor: '#9fd0ff', window: '#0c1838', lamp: 7, bg: '#060a12', wall: '#273352' },
    // Aujourd'hui : lumière dorée
    { hemi: 1.55, sky: '#ffe2b0', ground: '#3a2a1f', sun: 1.2, sunColor: '#ffd28a', window: '#ffc77a', lamp: 4, bg: '#141018', wall: '#43456b' }
];

export function buildRoom(scene, { shadows }) {
    const items = [];          // { group, ch:[a,b], base }
    const register = (group, ch, key) => {
        if (key) group.userData.key = key;
        group.userData.baseScale = group.scale.clone();
        items.push({ group, ch });
        scene.add(group);
        return group;
    };
    const textures = {};       // canvas textures à redessiner
    const floaters = [];       // objets qui flottent doucement

    /* --- structure --- */
    const structure = new THREE.Group();
    const wallMat = new THREE.MeshStandardMaterial({ color: ENVS[0].wall, roughness: 0.95 });
    const floor = rbox(6.2, 0.2, 6.2, '#5e4433', { r: 0.04, cast: false });
    at(floor, 0, -0.1, 0);
    const back = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3.2, 0.2), wallMat);
    at(back, 0, 1.5, -3.1); back.receiveShadow = true;
    const left = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.2, 6.2), wallMat);
    at(left, -3.1, 1.5, 0); left.receiveShadow = true;
    // plinthes
    const trimB = rbox(6, 0.12, 0.04, '#1c2238', { r: 0.01 }); at(trimB, 0, 0.06, -2.98);
    const trimL = rbox(0.04, 0.12, 6, '#1c2238', { r: 0.01 }); at(trimL, -2.98, 0.06, 0);
    // lattes du parquet
    for (let i = -2; i <= 2; i++) {
        const l = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.002, 6.2), std('#4a3527'));
        at(l, i * 1.2, 0.001, 0); structure.add(l);
    }
    structure.add(floor, back, left, trimB, trimL);

    // fenêtre
    const windowGroup = new THREE.Group();
    const windowMat = new THREE.MeshBasicMaterial({ color: ENVS[0].window, toneMapped: false });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.0), windowMat);
    const frameMat = std('#e9e4d8');
    [[0, 0.52, 1.3, 0.06], [0, -0.52, 1.3, 0.06], [-0.62, 0, 0.06, 1.1], [0.62, 0, 0.06, 1.1], [0, 0, 0.04, 1.0], [0, 0, 1.2, 0.04]]
        .forEach(([x, y, w, h]) => { const f = rbox(w, h, 0.06, '#e9e4d8', { mat: frameMat, r: 0.01 }); at(f, x, y, 0.03); windowGroup.add(f); });
    const moon = new THREE.Mesh(new THREE.CircleGeometry(0.09, 24), new THREE.MeshBasicMaterial({ color: '#fff6d8', toneMapped: false }));
    at(moon, 0.35, 0.25, 0.005);
    windowGroup.add(glass, moon);
    at(windowGroup, -0.8, 1.75, -2.99);
    structure.add(windowGroup);
    scene.add(structure);

    /* --- lit --- */
    const bed = new THREE.Group();
    const bedFrame = rbox(1.4, 0.32, 2.2, '#5a3e2b'); at(bedFrame, 0, 0.16, 0);
    const mattress = rbox(1.3, 0.2, 2.1, '#e8e4da', { r: 0.06 }); at(mattress, 0, 0.42, 0);
    const blanket = rbox(1.34, 0.1, 1.3, '#3d6ea8', { r: 0.05 }); at(blanket, 0, 0.5, 0.42);
    const pillow = rbox(0.9, 0.14, 0.38, '#f6f3ec', { r: 0.07 }); at(pillow, 0, 0.58, -0.8);
    const headboard = rbox(1.4, 0.8, 0.08, '#4a3324'); at(headboard, 0, 0.55, -1.1);
    bed.add(bedFrame, mattress, blanket, pillow, headboard);
    at(bed, -2.25, 0, -1.85);
    scene.add(bed);

    /* --- bureau + chaise + lampe --- */
    const desk = new THREE.Group();
    const top = rbox(2.3, 0.06, 0.9, '#c49a6c', { r: 0.02 }); at(top, 0, 0.75, 0);
    [[-1.08, -0.38], [1.08, -0.38], [-1.08, 0.38], [1.08, 0.38]].forEach(([x, z]) => {
        const leg = rbox(0.06, 0.75, 0.06, '#3a3f4b', { r: 0.01 }); at(leg, x, 0.375, z); desk.add(leg);
    });
    const drawer = rbox(0.5, 0.35, 0.8, '#b38a5e'); at(drawer, -0.8, 0.55, 0);
    desk.add(top, drawer);
    at(desk, 1.2, 0, -2.5);
    scene.add(desk);

    const chair = new THREE.Group();
    const seat = rbox(0.55, 0.08, 0.55, '#262b38', { r: 0.03 }); at(seat, 0, 0.5, 0);
    const backrest = rbox(0.55, 0.6, 0.07, '#262b38', { r: 0.03 }); at(backrest, 0, 0.85, 0.27);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.42), std('#888', { metal: 0.6, rough: 0.4 })); at(pole, 0, 0.27, 0);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 5), std('#1a1d26')); at(base, 0, 0.05, 0);
    chair.add(seat, backrest, pole, base);
    at(chair, 1.3, 0, -1.7, 0.2);
    scene.add(chair);

    const lamp = new THREE.Group();
    const lb = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.03, 16), std('#1d2230')); at(lb, 0, 0.015, 0);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.45), std('#1d2230'));
    arm.position.set(0, 0.23, 0); arm.rotation.z = 0.25;
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.14, 16, 1, true), std('#ffb547', { emissive: '#ffb547', ei: 0.3, rough: 0.5 }));
    head.material.side = THREE.DoubleSide;
    head.position.set(-0.08, 0.45, 0.02); head.rotation.z = -0.6;
    lamp.add(lb, arm, head);
    at(lamp, 2.15, 0.78, -2.75);
    scene.add(lamp);
    const lampLight = new THREE.PointLight('#ffb36b', 0, 4.5, 1.6);
    lampLight.position.set(2.0, 1.15, -2.6);
    scene.add(lampLight);

    // tapis (le confort arrive avec le PC)
    const rug = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.015, 40), std('#8c3b4a'));
    rug.receiveShadow = true;
    register(at(new THREE.Group().add(rug), 0.9, 0.008, -1.0), [2, 6]);

    /* --- calendrier (machine à remonter le temps) --- */
    const cal = new THREE.Group();
    textures.calendar = canvasTex(360, 400);
    const calPage = screenPlane(0.62, 0.69, textures.calendar, 0.92);
    calPage.position.z = 0.012;
    const calBoard = rbox(0.68, 0.76, 0.02, '#7a5a3a', { r: 0.01 }); calBoard.position.set(0, 0, 0);
    cal.add(calBoard, calPage);
    [-0.18, 0.18].forEach(x => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 6, 16), std('#999', { metal: 0.8, rough: 0.3 }));
        ring.position.set(x, 0.37, 0.02); cal.add(ring);
    });
    at(cal, -2.98, 1.75, 0.95, Math.PI / 2);
    cal.userData.page = calPage;
    register(cal, [0, 6], 'calendar');

    /* --- étagère + badges de compétences --- */
    const shelf = new THREE.Group();
    const planks = [];
    [1.95, 2.5].forEach((y, i) => {
        const p = rbox(1.5, 0.05, 0.28, '#8b5e3c', { r: 0.01 }); at(p, 0, y, 0);
        shelf.add(p); planks.push(p);
        if (i === 1) p.userData.secondPlank = true;
    });
    at(shelf, 2.05, 0, -2.84);
    register(shelf, [0, 6], 'shelf');
    const secondPlank = planks[1];
    const badges = [];
    BADGES.forEach((b, i) => {
        const row = i < 7 ? 0 : 1, col = i % 7;
        const ct = canvasTex(128, 128);
        drawBadge(ct, b);
        const g = new THREE.Group();
        const body = rbox(0.17, 0.17, 0.05, b.color, { r: 0.025 });
        const face = screenPlane(0.15, 0.15, ct, 0.95); face.position.z = 0.027;
        g.add(body, face);
        g.position.set(-0.6 + col * 0.2, (row === 0 ? 1.95 : 2.5) + 0.115, 0.02);
        g.rotation.y = (Math.random() - 0.5) * 0.25;
        shelf.add(g);
        g.userData.baseScale = g.scale.clone();
        g.visible = false;
        badges.push({ group: g, ch: [b.ch, 6] });
    });

    /* --- téléphone (il change de place selon l'année) --- */
    const phone = new THREE.Group();
    const phoneBody = rbox(0.17, 0.33, 0.016, '#15171c', { r: 0.008, metal: 0.4, rough: 0.35 });
    textures.phone = canvasTex(256, 512);
    const phoneScreen = screenPlane(0.152, 0.304, textures.phone, 1.15);
    phoneScreen.position.z = 0.0085;
    phone.add(phoneBody, phoneScreen);
    const phoneStand = rbox(0.12, 0.04, 0.12, '#2a2f3a', { r: 0.01 });
    phoneStand.visible = false;
    scene.add(phoneStand);
    const phoneLight = new THREE.PointLight('#7fb2ff', 0, 2.2, 1.8);
    scene.add(phoneLight);
    register(phone, [0, 6], 'phone');
    const PHONE_SPOTS = {
        bed: { pos: [-2.05, 0.64, -1.15], rot: [-Math.PI / 2 + 0.25, 0, 0.5] },
        deskFlat: { pos: [0.55, 0.79, -2.25], rot: [-Math.PI / 2, 0, 0.3] },
        stand: { pos: [0.55, 1.0, -2.3], rot: [-0.12, 0.35, 0] }
    };
    const phoneSpotFor = ch => (ch <= 1 ? 'bed' : ch <= 3 ? 'deskFlat' : 'stand');

    /* --- post-it rouges (IndentationError) --- */
    const notes = (list, ch, key) => {
        const g = new THREE.Group();
        list.forEach(([x, y, rz, txt, col, ink]) => {
            const ct = canvasTex(160, 160); drawPostit(ct, txt, col, ink);
            const n = screenPlane(0.2, 0.2, ct, 0.95); n.position.set(x, y, 0); n.rotation.z = rz;
            g.add(n);
        });
        at(g, 0, 0, -2.985);
        return register(g, ch, key);
    };
    notes([[0.25, 1.95, 0.08, 'Indentation\nError', '#ff8a80', '#5a0000'], [0.55, 1.75, -0.1, 'unexpected\nindent', '#ff8a80', '#5a0000'],
        [0.85, 2.0, 0.12, 'expected\n":"', '#ff8a80', '#5a0000'], [0.4, 1.5, -0.05, 'Syntax\nError', '#ff8a80', '#5a0000'],
        [0.75, 1.45, 0.06, 'IndentationError\n(encore)', '#ff8a80', '#5a0000']], [0, 1], 'postits');
    notes([[1.05, 1.7, -0.14, 'TclError ?!', '#ff5252', '#fff'], [0.15, 1.25, 0.1, 'pourquoi\n???', '#ff5252', '#fff'],
        [1.0, 1.3, 0.04, 'no\ndisplay', '#ff5252', '#fff'], [0.6, 2.25, -0.08, 'Tkinter\n😭', '#ff5252', '#fff']], [1, 1], 'postits');
    notes([[0.5, 1.7, -0.06, 'is\nundefined\n?!', '#ffe066', '#3b2f00'], [0.85, 1.9, 0.1, '$ is not\ndefined', '#ffe066', '#3b2f00']], [3, 3], 'jsnote');

    /* --- affiche turtle (2020-2021) puis affiches web (2023-2024) --- */
    textures.turtle = canvasTex(400, 500); drawTurtlePoster(textures.turtle);
    const poster = (ct, w, h) => {
        const g = new THREE.Group();
        const frame = rbox(w + 0.06, h + 0.06, 0.03, '#20232c', { r: 0.01 });
        const p = screenPlane(w, h, ct, 0.95); p.position.z = 0.017;
        g.add(frame, p);
        return g;
    };
    register(at(poster(textures.turtle, 0.64, 0.8), -2.98, 1.8, -1.3, Math.PI / 2), [0, 1], 'turtle');
    textures.web0 = canvasTex(400, 500); textures.web1 = canvasTex(400, 500);
    const posters = new THREE.Group();
    posters.add(at(poster(textures.web0, 0.56, 0.7), 0.45, 0, 0), at(poster(textures.web1, 0.56, 0.7), -0.3, 0, 0));
    register(at(posters, -2.98, 1.8, -1.25, Math.PI / 2), [3, 3], 'posters');

    /* --- boulettes de papier (échecs 2021) --- */
    const paper = new THREE.Group();
    const paperMat = std('#f2f0ea', { flat: true, rough: 1 });
    [[0.2, 0.6], [0.6, 0.2], [-0.3, 0.9], [1.0, 0.7], [0.45, 1.1], [-0.6, 0.4], [1.3, 1.2], [0.0, 1.5]].forEach(([x, z], i) => {
        const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07 + (i % 3) * 0.015, 0), paperMat);
        b.position.set(x, 0.07, z); b.rotation.set(i, i * 2, i * 3); b.castShadow = true; paper.add(b);
    });
    // une corbeille qui déborde
    const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.13, 0.38, 16, 1, true), std('#5a6378', { rough: 0.6 }));
    bin.material.side = THREE.DoubleSide; bin.position.set(-0.4, 0.19, 0.0); paper.add(bin);
    register(at(paper, -0.6, 0, -1.6), [1, 1], 'paper');
    const alarm = new THREE.PointLight('#ff2a2a', 0, 7, 1.5);
    alarm.position.set(0, 2.6, 0);
    scene.add(alarm);

    /* --- PC (2022 →) --- */
    const pc = new THREE.Group();
    const monitor = rbox(0.95, 0.58, 0.04, '#111318', { r: 0.015, rough: 0.4 }); at(monitor, 0, 0.42, 0);
    textures.monitor = canvasTex(512, 320);
    const screen = screenPlane(0.9, 0.53, textures.monitor, 1.1); screen.position.set(0, 0.42, 0.021);
    const neck = rbox(0.06, 0.2, 0.04, '#2a2e38', { r: 0.01 }); at(neck, 0, 0.1, -0.03);
    const foot = rbox(0.3, 0.02, 0.18, '#2a2e38', { r: 0.008 }); at(foot, 0, 0.01, 0);
    const kb = rbox(0.62, 0.025, 0.2, '#2b2f3a', { r: 0.008 }); at(kb, 0, 0.012, 0.4);
    const mouse = rbox(0.07, 0.03, 0.11, '#2b2f3a', { r: 0.014 }); at(mouse, 0.42, 0.015, 0.42);
    pc.add(monitor, screen, neck, foot, kb, mouse);
    at(pc, 1.25, 0.78, -2.75);
    const tower = rbox(0.24, 0.5, 0.48, '#1b1e26', { r: 0.02 }); at(tower, 2.05, 0.25, -2.55);
    const towerLed = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.3, 0.01), new THREE.MeshBasicMaterial({ color: '#4ade80', toneMapped: false }));
    at(towerLed, 1.925, 0.3, -2.33);
    const pcRoot = new THREE.Group(); pcRoot.add(pc, tower, towerLed);
    register(pcRoot, [2, 6], 'pc');
    const monitorLight = new THREE.PointLight('#8fc0ff', 0, 2.5, 1.8);
    monitorLight.position.set(1.25, 1.3, -2.2);
    scene.add(monitorLight);

    /* --- fenêtres Tkinter flottantes (calculatrice, galerie) --- */
    textures.calc = canvasTex(320, 340); drawCalcWindow(textures.calc);
    textures.gallery = canvasTex(400, 300); drawGalleryWindow(textures.gallery);
    const floatWin = (ct, w, h) => {
        const g = new THREE.Group();
        const shadowBox = rbox(w + 0.02, h + 0.02, 0.02, '#222', { r: 0.01 });
        const p = screenPlane(w, h, ct, 1.0); p.position.z = 0.012;
        g.add(shadowBox, p);
        return g;
    };
    const calc = register(at(floatWin(textures.calc, 0.5, 0.53), 0.25, 1.95, -1.75, 0.45), [2, 2], 'calc');
    const gallery = register(at(floatWin(textures.gallery, 0.66, 0.5), 2.15, 1.55, -1.4, 0.15), [2, 2], 'gallery');
    floaters.push({ obj: calc, y: 1.95, amp: 0.06, speed: 1.1 }, { obj: gallery, y: 1.55, amp: 0.05, speed: 0.9, phase: 1.5 });

    /* --- plante (la vie s'installe) --- */
    const plant = new THREE.Group();
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.28, 16), std('#d9825b'));
    pot.position.y = 0.14; pot.castShadow = true;
    plant.add(pot);
    for (let i = 0; i < 7; i++) {
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.45, 5), std('#3f9c5a', { flat: true }));
        leaf.position.set(Math.cos(i) * 0.05, 0.45, Math.sin(i) * 0.05);
        leaf.rotation.set(Math.cos(i * 1.7) * 0.5, 0, Math.sin(i * 1.7) * 0.5); leaf.castShadow = true;
        plant.add(leaf);
    }
    register(at(plant, -0.15, 0, -2.6), [3, 6]);

    /* --- serveur VPS (2026) --- */
    const server = new THREE.Group();
    const rack = rbox(0.6, 1.3, 0.6, '#151923', { r: 0.02, rough: 0.5 }); at(rack, 0, 0.65, 0);
    server.add(rack);
    const leds = [];
    for (let i = 0; i < 5; i++) {
        const unit = rbox(0.52, 0.18, 0.02, '#232a38', { r: 0.005 }); at(unit, 0, 0.25 + i * 0.22, 0.305);
        const led = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.01), new THREE.MeshBasicMaterial({ color: '#4ade80', toneMapped: false }));
        at(led, 0.2, 0.25 + i * 0.22, 0.32);
        const led2 = led.clone(); led2.material = new THREE.MeshBasicMaterial({ color: '#38bdf8', toneMapped: false }); led2.position.x = 0.14;
        server.add(unit, led, led2); leds.push(led, led2);
    }
    register(at(server, -2.5, 0, 2.0, Math.PI / 2), [5, 6], 'server');
    const serverLight = new THREE.PointLight('#4ade80', 0, 2, 2);
    serverLight.position.set(-2.0, 0.9, 2.0);
    scene.add(serverLight);

    /* --- baleine Docker --- */
    const whale = new THREE.Group();
    const whaleMat = std('#2496ed', { rough: 0.5 });
    const wbody = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 16), whaleMat);
    wbody.scale.set(1.5, 0.75, 0.9); wbody.castShadow = true;
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 4), whaleMat);
    tail.position.set(-0.5, 0.1, 0); tail.rotation.z = Math.PI / 2 + 0.5;
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), std('#0b1020'));
    eye.position.set(0.32, 0.04, 0.2);
    const eye2 = eye.clone(); eye2.position.z = -0.2;
    whale.add(wbody, tail, eye, eye2);
    ['#ff6b6b', '#ffd43b', '#4ade80', '#38bdf8', '#c084fc'].forEach((c, i) => {
        const box = rbox(0.11, 0.11, 0.11, c, { r: 0.012 });
        box.position.set(-0.17 + (i % 3) * 0.13, 0.27 + Math.floor(i / 3) * 0.12, 0);
        whale.add(box);
    });
    const whaleRoot = register(at(new THREE.Group().add(whale), -1.2, 1.55, 0.7, 0.6), [5, 6], 'whale');
    floaters.push({ obj: whaleRoot, y: 1.55, amp: 0.1, speed: 0.8, sway: true });

    /* --- néons : chiffres VansTech + freelance --- */
    textures.stats = canvasTex(512, 300);
    const stats = new THREE.Group();
    stats.add(screenPlane(0.95, 0.56, textures.stats, 1.2));
    const statsMat = stats.children[0].material; statsMat.transparent = true;
    register(at(stats, -2.15, 2.4, -2.985), [5, 6], 'stats');

    textures.neon = canvasTex(640, 160);
    const neon = new THREE.Group();
    const neonPlane = screenPlane(1.5, 0.375, textures.neon, 1.25); neonPlane.material.transparent = true;
    neon.add(neonPlane);
    register(at(neon, -0.8, 2.6, -2.985), [6, 6], 'neon');
    const neonLight = new THREE.PointLight('#ffb547', 0, 3, 2);
    neonLight.position.set(-0.8, 2.5, -2.5);
    scene.add(neonLight);

    /* --- lumières --- */
    const hemi = new THREE.HemisphereLight(ENVS[0].sky, ENVS[0].ground, ENVS[0].hemi);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(ENVS[0].sunColor, ENVS[0].sun);
    sun.position.set(3, 6, 4);
    if (shadows) {
        sun.castShadow = true;
        sun.shadow.mapSize.set(1024, 1024);
        sun.shadow.camera.left = -5; sun.shadow.camera.right = 5;
        sun.shadow.camera.top = 5; sun.shadow.camera.bottom = -5;
        sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02;
    }
    scene.add(sun);

    /* ------------------------------------------------------------ API */
    function redraw(ch, lang, t, label) {
        drawPhone(textures.phone, ch, lang, t); textures.phone.tex.needsUpdate = true;
        if (ch >= 2) { drawMonitor(textures.monitor, ch, lang, t); textures.monitor.tex.needsUpdate = true; }
        if (label !== undefined) { drawCalendar(textures.calendar, ch, label, lang); textures.calendar.tex.needsUpdate = true; }
    }
    function redrawStatic(lang) {
        drawWebPoster(textures.web0, 0, lang); textures.web0.tex.needsUpdate = true;
        drawWebPoster(textures.web1, 1, lang); textures.web1.tex.needsUpdate = true;
        redrawStats(lang);
        drawNeon(textures.neon, [[lang === 'en' ? 'Available for freelance ✦' : 'Disponible en freelance ✦', 52, 98]], '#ffb547');
        textures.neon.tex.needsUpdate = true;
    }

    function redrawStats(lang) {
        const v = screenMode.stats || { a: 3000, b: 100 };
        const fmt = n => (lang === 'en' ? n.toLocaleString('en-US') : n.toLocaleString('fr-FR').replace(/ | /g, ' '));
        const plus = screenMode.stats ? '' : '+';
        drawNeon(textures.stats, [['vanstech.space', 30, 64],
            [fmt(v.a) + plus + (lang === 'en' ? ' sign-ups' : ' inscrits'), 56, 150],
            [fmt(v.b) + plus + (lang === 'en' ? ' active users' : ' actifs'), 56, 230]], '#25d366');
        textures.stats.tex.needsUpdate = true;
    }

    return {
        redrawStats, monitorScreen: screen,
        items, badges, floaters, leds, textures,
        phone, phoneStand, phoneLight, PHONE_SPOTS, phoneSpotFor,
        calendar: cal, secondPlank,
        lights: { hemi, sun, lampLight, monitorLight, alarm, serverLight, neonLight, phoneLight },
        lampHead: head, windowMat, wallMat, moon,
        redraw, redrawStatic
    };
}
