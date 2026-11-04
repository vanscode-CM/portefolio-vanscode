// Metteur en scène : une timeline GSAP par chapitre où l'avatar vit l'année
// (essais, bugs, colère, sommeil, réussite, objet qui jaillit et se colle au mur, saut de joie).
import * as THREE from 'three';
import { screenMode } from './room.js';
import { BADGES } from './story.js';

/* ------------------------------------------------------------- sous-titres */
export const CAPTIONS = [
    { fr: ['2020. Un téléphone, YouTube… on se lance !', "IndentationError ? C'est quoi ce truc ?", "ENCORE ?! J'ai rien touché !", 'Bon. Dodo. Demain ça ira mieux.', 'Nouveau jour, nouvel essai…', '« Hello World »… ÇA MARCHE !!!', 'Et la tortue dessine sa première spirale. Victoire !'],
      en: ["2020. A phone, YouTube… let's go!", 'IndentationError? What is that?', "AGAIN?! I didn't touch anything!", 'Fine. Bedtime. Tomorrow will be better.', 'New day, new try…', '“Hello World”… IT WORKS!!!', 'And the turtle draws its first spiral. Victory!'] },
    { fr: ['Début 2021 : objectif Tkinter, de vraies fenêtres !', "Rien ne s'ouvre.", 'Toujours rien…', 'Le téléphone a ses limites.', 'Pourquoi ça marche dans le tuto ?!', '…mais moi, pas encore.'],
      en: ['Early 2021: goal Tkinter, real windows!', 'Nothing opens.', 'Still nothing…', 'The phone has its limits.', 'Why does it work in the tutorial?!', "…but I don't. Not yet."] },
    { fr: ['2022 : MON PREMIER PC !!!', 'Tkinter, deuxième round. Avec un vrai clavier.', "NameError… j'ai oublié de déclarer la variable.", 'Ma calculatrice ! (Elle plante sur ÷ 0, mais chut.)', "Puis une galerie d'images.", 'Le mur Tkinter est tombé !'],
      en: ['2022: MY FIRST PC!!!', 'Tkinter, round two. With a real keyboard.', 'NameError… I forgot to declare the variable.', 'My calculator! (It crashes on ÷ 0, but shhh.)', 'Then an image gallery.', 'The Tkinter wall is down!'] },
    { fr: ['2023 : HTML, CSS, JavaScript… cap sur le web.', '« is undefined ». Mon nouvel ennemi juré.', 'Petite pause… sur le clavier.', 'ATTENDS. Le script est chargé trop tôt !', 'Mes premiers sites vitrines animés.', 'HTML, CSS, JS, jQuery, GSAP : débloqués !'],
      en: ['2023: HTML, CSS, JavaScript… heading for the web.', '“is undefined”. My new nemesis.', 'Quick break… on the keyboard.', 'WAIT. The script loads too early!', 'My first animated showcase websites.', 'HTML, CSS, JS, jQuery, GSAP: unlocked!'] },
    { fr: ['2025 : Baileys. Objectif : un bot WhatsApp.', 'QR code expiré. Encore. Et un await oublié.', 'Scanner, rescanner, rerescanner…', 'Allez… !ping', "pong. IL M'A RÉPONDU !!!", 'Baileys + TypeScript : débloqués !'],
      en: ['2025: Baileys. Goal: a WhatsApp bot.', 'QR code expired. Again. And a forgotten await.', 'Scan, rescan, rerescan…', 'Come on… !ping', 'pong. IT ANSWERED ME!!!', 'Baileys + TypeScript: unlocked!'] },
    { fr: ['2026 : je construis VansTech, un vrai SaaS.', 'Un VPS, rien que pour moi.', '502 Bad Gateway. Classique.', 'Nginx, Docker, PostgreSQL, NestJS…', 'docker compose up… du premier coup ?!', 'Plus de 3 000 inscrits. Plus de 100 actifs.', 'VansTech est en ligne !'],
      en: ["2026: I'm building VansTech, a real SaaS.", 'A VPS, all mine.', '502 Bad Gateway. Classic.', 'Nginx, Docker, PostgreSQL, NestJS…', 'docker compose up… on the first try?!', 'Over 3,000 sign-ups. Over 100 active users.', 'VansTech is live!'] },
    { fr: ['Six ans plus tard… salut !', 'Je suis disponible en freelance.', "Votre projet, c'est le prochain chapitre. Cliquez sur moi !"],
      en: ['Six years later… hi there!', "I'm available for freelance work.", 'Your project is the next chapter. Click on me!'] }
];

/* -------------------------------------------------- emplacements et cadrages */
const P = Math.PI;
export const SPOTS = {
    bedSit: { pos: [-1.72, 0.64, -1.35], rot: [0, P / 2, 0] },
    bedLie: { pos: [-2.25, 0.66, -1.75], rot: [-P / 2, 0, 0] },
    bedStand: { pos: [-1.05, 0.9, -1.0], rot: [0, 0.75, 0] },
    deskSit: { pos: [1.28, 0.63, -1.9], rot: [0, P - 0.12, 0] },
    deskStand: { pos: [1.0, 0.9, -1.15], rot: [0, 0.75, 0] },
    center: { pos: [0.4, 0.9, 0.2], rot: [0, 0.75, 0] },
    server: { pos: [-1.72, 0.9, 1.95], rot: [0, -P / 2, 0] }
};
const SHOTS = {
    bed: { pos: [0.9, 2.6, 1.5], target: [-1.8, 1.0, -1.5] },
    desk: { pos: [3.9, 2.7, 0.9], target: [1.15, 1.1, -2.0] }
};

// Objets qui « appartiennent » à la scène : cachés au début, révélés par l'animation
const OWNED = [
    [{ key: 'postits', ch: [0, 1], parts: true }, { key: 'turtle' }],
    [{ key: 'postits', ch: [1, 1], parts: true }, { key: 'paper', parts: true }],
    [{ key: 'pc' }, { key: 'calc' }, { key: 'gallery' }],
    [{ key: 'jsnote', parts: true }, { key: 'posters', parts: true }],
    [],
    [{ key: 'server' }, { key: 'whale' }, { key: 'stats' }],
    [{ key: 'neon' }]
];
const FINAL = [
    { spot: 'bedStand', pose: 'stand', face: 'happy' },
    { spot: 'bedSit', pose: 'sit', face: 'neutral' },
    { spot: 'deskStand', pose: 'stand', face: 'happy' },
    { spot: 'deskStand', pose: 'stand', face: 'happy', monitor: 'ok' },
    { spot: 'deskStand', pose: 'stand', face: 'happy' },
    { spot: 'deskStand', pose: 'stand', face: 'happy' },
    { spot: 'center', pose: 'stand', face: 'happy' }
];

const v3 = a => new THREE.Vector3(a[0], a[1], a[2]);

export function createDirector(ctx) {
    const { scene, room, avatar: A, cat } = ctx;
    let T = null;               // timeline en cours
    let idle = null;            // boucle d'attente après la scène
    let current = -1;
    let playing = false;
    const temps = new Set();    // objets temporaires (bulles, confettis, boulettes)
    const emojiTex = new Map();

    // queue du chat : balancement permanent (une seule fois pour toute la page)
    if (!ctx.reduced) gsap.to(cat.tail.rotation, { z: 0.5, duration: 1.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    cat.root.position.set(-2.62, 0.55, -0.92);
    cat.root.rotation.y = P / 2 + 0.4;

    /* ---------------------------------------------------------- utilitaires */
    const itemOf = (key, ch) => room.items.find(it => it.group.userData.key === key && (!ch || (it.ch[0] === ch[0] && it.ch[1] === ch[1])));
    const store = o => {
        if (!o.userData.home) o.userData.home = { p: o.position.clone(), r: o.rotation.clone(), s: (o.userData.baseScale || o.scale).clone() };
        return o.userData.home;
    };
    const restore = o => { const h = store(o); o.position.copy(h.p); o.rotation.copy(h.r); o.scale.copy(h.s); };
    const ownedObjects = ch => {
        const out = [];
        (OWNED[ch] || []).forEach(spec => {
            const it = itemOf(spec.key, spec.ch);
            if (!it) return;
            if (spec.parts) it.group.children.forEach(c => out.push({ obj: c, group: it.group }));
            else out.push({ obj: it.group, group: it.group });
        });
        return out;
    };
    const badgesOf = ch => room.badges.filter((b, i) => BADGES[i].ch === ch);

    function caption(ch, i) { T.call(() => ctx.caption(CAPTIONS[ch][ctx.lang()][i])); }
    function wait(s) { T.to({}, { duration: s }); }

    // placement immédiat de l'avatar
    function place(spot, pose) {
        const s = SPOTS[spot];
        A.root.position.copy(v3(s.pos));
        A.root.rotation.set(s.rot[0], s.rot[1], s.rot[2]);
        A.setPose(pose);
    }
    // déplacement animé vers un emplacement + pose
    function move(spot, pose, d = 0.8) {
        const s = SPOTS[spot];
        T.to(A.root.position, { x: s.pos[0], y: s.pos[1], z: s.pos[2], duration: d, ease: 'power2.inOut' });
        T.to(A.root.rotation, { x: s.rot[0], y: s.rot[1], z: s.rot[2], duration: d, ease: 'power2.inOut' }, '<');
        T.add(A.pose(pose, d), '<');
    }
    function pose(name, d = 0.4, at) { T.add(A.pose(name, d), at); }
    function face(name) { T.call(() => A.face(name)); }

    // marche : le corps se tourne, les jambes alternent
    function walk(x, z, d) {
        let from;
        T.call(() => { from = A.root.position.clone(); });
        T.to(A.root.rotation, { x: 0, z: 0, y: () => Math.atan2(x - from.x, z - from.z), duration: 0.25 });
        const steps = Math.max(2, Math.round(d / 0.32));
        const legs = gsap.timeline();
        for (let i = 0; i < steps; i++) legs.add(A.pose(i % 2 ? 'walkB' : 'walkA', d / steps, 'sine.inOut'));
        legs.add(A.pose('stand', 0.2));
        T.add(legs);
        T.to(A.root.position, { x, z, y: 0.9, duration: d, ease: 'none' }, '<');
    }
    function turnTo(y, d = 0.3) { T.to(A.root.rotation, { y, duration: d }); }

    // pianotage (clavier ou téléphone)
    function typing(d) {
        const r = 2 * Math.max(1, Math.round(d / 0.24)) - 1;
        T.to(A.J.lEl.rotation, { x: '-=0.18', duration: 0.12, yoyo: true, repeat: r, ease: 'sine.inOut' });
        T.to(A.J.rEl.rotation, { x: '+=0.18', duration: 0.12, yoyo: true, repeat: r, ease: 'sine.inOut' }, '<0.06');
    }
    function shake(n = 6) { T.to(A.J.spine.rotation, { z: '+=0.12', duration: 0.07, yoyo: true, repeat: n * 2 - 1 }); }
    function jump(n = 2) {
        for (let i = 0; i < n; i++) {
            pose('crouch', 0.15);
            T.to(A.root.position, { y: 0.78, duration: 0.15 }, '<');
            T.to(A.root.position, { y: 1.35, duration: 0.3, ease: 'power2.out' });
            T.add(A.pose('joy', 0.25), '<');
            T.to(A.root.position, { y: 0.9, duration: 0.3, ease: 'power2.in' });
        }
        pose('joy', 0.2);
    }
    function dance(beats = 6) {
        for (let i = 0; i < beats; i++) {
            pose(i % 2 ? 'danceB' : 'danceA', 0.28);
            T.to(A.root.position, { y: '-=0.06', duration: 0.14, yoyo: true, repeat: 1 }, '<');
        }
    }

    // bulle d'émotion au-dessus de la tête
    function emojiTexture(e) {
        if (emojiTex.has(e)) return emojiTex.get(e);
        const c = document.createElement('canvas'); c.width = c.height = 128;
        const x = c.getContext('2d');
        x.font = '92px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
        x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillText(e, 64, 70);
        const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
        emojiTex.set(e, t);
        return t;
    }
    function emote(e, d = 1.3, at) {
        const sub = gsap.timeline();
        let s;
        sub.call(() => {
            s = new THREE.Sprite(new THREE.SpriteMaterial({ map: emojiTexture(e), transparent: true, depthTest: false, toneMapped: false }));
            s.renderOrder = 20;
            s.position.copy(A.headWorld()).add(new THREE.Vector3(0, 0.38, 0));
            s.scale.setScalar(0.01);
            scene.add(s); temps.add(s);
            gsap.to(s.scale, { x: 0.38, y: 0.38, z: 0.38, duration: 0.35, ease: 'back.out(3)' });
            gsap.to(s.position, { y: '+=0.2', duration: d, ease: 'sine.out' });
            gsap.to(s.material, { opacity: 0, duration: 0.3, delay: d - 0.3, onComplete: () => removeTemp(s) });
        });
        T.add(sub, at);
    }
    function removeTemp(o) {
        if (!temps.has(o)) return;
        temps.delete(o);
        gsap.killTweensOf(o.position); gsap.killTweensOf(o.scale); gsap.killTweensOf(o.rotation);
        if (o.material) gsap.killTweensOf(o.material);
        scene.remove(o);
        if (o.material) o.material.dispose();
        if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose();
    }

    // confettis
    const confettiGeo = new THREE.PlaneGeometry(0.05, 0.03);
    confettiGeo.userData.shared = true;
    const CONF_COLORS = ['#ffb547', '#4ade80', '#38bdf8', '#f472b6', '#facc15', '#a78bfa'];
    function confetti(n = 70) {
        T.call(() => {
            const origin = A.headWorld();
            for (let i = 0; i < n; i++) {
                const m = new THREE.Mesh(confettiGeo, new THREE.MeshBasicMaterial({ color: CONF_COLORS[i % CONF_COLORS.length], side: THREE.DoubleSide, toneMapped: false }));
                m.position.copy(origin);
                scene.add(m); temps.add(m);
                const dx = (Math.random() - 0.5) * 2.4, dz = (Math.random() - 0.5) * 2.4;
                gsap.timeline({ onComplete: () => removeTemp(m) })
                    .to(m.position, { x: `+=${dx * 0.6}`, z: `+=${dz * 0.6}`, y: `+=${0.6 + Math.random() * 0.8}`, duration: 0.5, ease: 'power2.out' })
                    .to(m.position, { x: `+=${dx * 0.4}`, z: `+=${dz * 0.4}`, y: 0.02, duration: 1.6 + Math.random(), ease: 'power1.in' })
                    .to(m.rotation, { x: Math.random() * 12, y: Math.random() * 12, duration: 2.1, ease: 'none' }, 0);
            }
        });
    }

    // un objet jaillit d'un point (téléphone, écran…) et file à sa place
    function fly(obj, fromFn, { d = 0.9, spin = 3, arc = 0, at } = {}) {
        const sub = gsap.timeline();
        const h = store(obj);
        sub.call(() => {
            obj.visible = true;
            obj.userData.flying = true;
            const start = obj.parent.worldToLocal(fromFn().clone());
            obj.position.copy(start);
            obj.scale.setScalar(0.01);
            obj.rotation.set(h.r.x, h.r.y, h.r.z + spin);
            const ctl = { t: 0 };
            gsap.to(ctl, {
                t: 1, duration: d, ease: 'power2.out',
                onUpdate: () => {
                    obj.position.lerpVectors(start, h.p, ctl.t);
                    obj.position.y += Math.sin(ctl.t * P) * arc;
                },
                onComplete: () => { obj.userData.flying = false; }
            });
            gsap.to(obj.scale, { x: h.s.x, y: h.s.y, z: h.s.z, duration: d * 0.8, ease: 'back.out(1.8)' });
            gsap.to(obj.rotation, { z: h.r.z, duration: d, ease: 'power3.out' });
        });
        T.add(sub, at);
        T.to({}, { duration: d * 0.6 });
    }
    // chute depuis le plafond avec rebond
    function drop(obj) {
        const h = store(obj);
        T.call(() => { obj.visible = true; obj.scale.copy(h.s); obj.position.set(h.p.x, h.p.y + 3.2, h.p.z); });
        T.to(obj.position, { y: h.p.y, duration: 1.0, ease: 'bounce.out' });
    }
    const phoneWorld = () => room.phone.getWorldPosition(new THREE.Vector3());
    const monitorWorld = () => room.monitorScreen.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0, 0.15));
    const handWorld = () => A.handWorld(-1);

    function screen(which, mode) { T.call(() => { screenMode[which] = mode; }); }

    // téléphone en main
    function holdPhone(instant = false) {
        const doIt = () => {
            gsap.killTweensOf(room.phone.position); gsap.killTweensOf(room.phone.rotation);
            A.holdPoint.attach(room.phone);
            const target = { p: [0, 0, 0], r: [-2.3, 0, P] };
            if (instant) { room.phone.position.set(...target.p); room.phone.rotation.set(...target.r); }
            else {
                gsap.to(room.phone.position, { x: 0, y: 0, z: 0, duration: 0.5, ease: 'power2.out' });
                gsap.to(room.phone.rotation, { x: target.r[0], y: 0, z: target.r[2], duration: 0.5 });
            }
        };
        if (instant) doIt(); else { T.call(doIt); wait(0.5); }
    }
    function releasePhone(ch, instant = false) {
        const doIt = () => {
            gsap.killTweensOf(room.phone.position); gsap.killTweensOf(room.phone.rotation);
            scene.attach(room.phone);
            const s = room.PHONE_SPOTS[room.phoneSpotFor(ch)];
            if (instant) { room.phone.position.set(...s.pos); room.phone.rotation.set(...s.rot); }
            else {
                gsap.to(room.phone.position, { x: s.pos[0], y: s.pos[1], z: s.pos[2], duration: 0.6, ease: 'power2.inOut' });
                gsap.to(room.phone.rotation, { x: s.rot[0], y: s.rot[1], z: s.rot[2], duration: 0.6 });
            }
        };
        if (instant) doIt(); else { T.call(doIt); wait(0.4); }
    }

    function badges(ch) {
        badgesOf(ch).forEach((b, i) => fly(b.group, () => A.headWorld(), { d: 0.8, spin: 6, arc: 0.4, at: `>-${i ? 0.35 : 0}` }));
    }
    function catReact(type) {
        T.call(() => {
            if (type === 'startle') {
                gsap.timeline()
                    .to(cat.root.position, { y: '+=0.3', duration: 0.18, ease: 'power2.out' })
                    .to(cat.root.position, { y: 0.55, duration: 0.3, ease: 'bounce.out' });
            } else {
                gsap.fromTo(cat.head.rotation, { z: -0.35 }, { z: 0.35, duration: 0.18, repeat: 5, yoyo: true, onComplete: () => { cat.head.rotation.z = 0; } });
            }
        });
    }
    function dim(on) {
        const L = room.lights.hemi;
        T.call(() => {
            if (on) { L.userData.saved = L.intensity; gsap.to(L, { intensity: L.intensity * 0.35, duration: 0.8 }); }
            else gsap.to(L, { intensity: L.userData.saved ?? L.intensity, duration: 0.8 });
        });
    }
    function shot(name) {
        T.call(() => {
            if (name === 'wide') { const h = ctx.home(); ctx.flyTo(h.pos, h.target, 1.6); return; }
            const s = SHOTS[name]; ctx.flyTo(v3(s.pos), v3(s.target), 1.6);
        });
    }
    // révèle d'un coup (parts.filter) au début de la scène
    function revealNow(list) { T.call(() => list.forEach(o => { o.visible = true; restore(o); })); }

    OWNED.forEach((_, ch) => ownedObjects(ch).forEach(({ obj }) => store(obj)));
    room.badges.forEach(b => store(b.group));

    /* ------------------------------------------------------------- scénarios */
    const SCRIPTS = [
        // 2020 : téléphone, bugs, colère, dodo, réveil, Hello World, la tortue se colle au mur, saut de joie
        () => {
            const notes = itemOf('postits', [0, 1]).group.children;
            const turtle = itemOf('turtle').group;
            place('bedSit', 'phone'); holdPhone(true); A.face('neutral');
            screen('phone', 'typing'); shot('bed');
            caption(0, 0); typing(2.2);
            screen('phone', 'error');
            fly(notes[0], phoneWorld, { arc: 0.3 }); fly(notes[1], phoneWorld, { arc: 0.3 });
            emote('❓'); caption(0, 1); wait(1.0);
            screen('phone', 'typing'); typing(1.4); screen('phone', 'error');
            fly(notes[2], phoneWorld, { arc: 0.3, d: 0.7 }); fly(notes[3], phoneWorld, { arc: 0.3, d: 0.7 }); fly(notes[4], phoneWorld, { arc: 0.3, d: 0.7 });
            face('angry'); pose('angrySit', 0.25); caption(0, 2); emote('💢'); catReact('startle'); shake(6); wait(0.4);
            releasePhone(0);
            move('bedLie', 'lie', 1.0); face('sleep'); dim(true); caption(0, 3);
            emote('💤', 1.2); wait(0.6); emote('💤', 1.2); wait(0.6); emote('💤', 1.2); wait(0.8);
            dim(false); move('bedSit', 'stretch', 0.9); face('happy'); emote('☀️'); caption(0, 4); wait(0.6);
            pose('phone', 0.4); face('neutral'); holdPhone(); screen('phone', 'typing'); typing(1.6);
            screen('phone', null); face('happy'); emote('💡'); caption(0, 5); wait(0.8);
            fly(turtle, phoneWorld, { d: 1.2, spin: 6, arc: 0.6 }); caption(0, 6); wait(0.6);
            releasePhone(0);
            move('bedStand', 'stand', 0.6); jump(2); confetti(); catReact('happy'); emote('🎉', 1.5, '<'); badges(0); wait(0.8);
            pose('stand', 0.5);
        },
        // 2021 : trois échecs Tkinter, boulettes jetées, alarme rouge… puis le poing levé
        () => {
            const notes = itemOf('postits', [1, 1]).group.children;
            const paper = itemOf('paper').group.children;
            const balls = paper.slice(0, 8), bin = paper[8];
            place('bedSit', 'phone'); holdPhone(true); A.face('neutral');
            revealNow([bin]); screen('phone', 'typing'); shot('bed');
            caption(1, 0); typing(1.6);
            const emojis = ['😤', '💢', '😭'];
            const groups = [[0, 1, 2], [3, 4, 5], [6, 7]];
            for (let i = 0; i < 3; i++) {
                screen('phone', null);
                fly(notes[i], phoneWorld, { arc: 0.3, d: 0.7 });
                if (i === 2) fly(notes[3], phoneWorld, { arc: 0.3, d: 0.7 });
                face('angry'); caption(1, i + 1); emote(emojis[i]);
                pose('angrySit', 0.25); if (i === 1) catReact('startle');
                groups[i].forEach(k => fly(balls[k], handWorld, { d: 0.7, arc: 0.5, spin: 8 }));
                pose('phone', 0.3);
                if (i < 2) { screen('phone', 'typing'); face('neutral'); typing(1.0); }
            }
            releasePhone(1);
            pose('facepalm', 0.5); face('sad'); caption(1, 4); wait(1.6);
            pose('sad', 0.6); wait(1.0);
            pose('fistSit', 0.4); face('angry'); emote('💪', 1.6); caption(1, 5); wait(1.4);
            pose('sit', 0.5); face('neutral');
        },
        // 2022 : le PC tombe du ciel, NameError, la calculatrice et la galerie jaillissent de l'écran
        () => {
            const pc = itemOf('pc').group, calc = itemOf('calc').group, gallery = itemOf('gallery').group;
            place('center', 'stand'); A.face('happy');
            shot('wide'); caption(2, 0); drop(pc); emote('🤩', 1.4, '-=0.4'); jump(1); pose('stand', 0.3);
            walk(SPOTS.deskStand.pos[0], SPOTS.deskStand.pos[2], 1.0);
            move('deskSit', 'type', 0.7); shot('desk'); face('neutral');
            caption(2, 1); typing(1.6);
            screen('monitor', 'error'); face('angry'); emote('😤'); caption(2, 2); shake(4); wait(0.6);
            screen('monitor', null); face('neutral'); typing(1.4);
            fly(calc, monitorWorld, { d: 1.0, spin: 2, arc: 0.3 }); face('happy'); emote('😎'); caption(2, 3); wait(1.2);
            typing(1.0); fly(gallery, monitorWorld, { d: 1.0, spin: -2, arc: 0.3 }); caption(2, 4); wait(0.8);
            move('deskStand', 'stand', 0.6); jump(2); confetti(); emote('🎉', 1.5, '<'); caption(2, 5); badges(2); wait(0.6);
            pose('stand', 0.5);
        },
        // 2023 : le web, « is undefined » au mur, dodo sur le clavier, l'idée, les affiches jaillissent
        () => {
            const notes = itemOf('jsnote').group.children, posters = itemOf('posters').group.children;
            place('deskSit', 'type'); A.face('neutral');
            screen('monitor', 'typing'); shot('desk');
            caption(3, 0); typing(1.8);
            screen('monitor', null);
            fly(notes[0], monitorWorld, { arc: 0.3 }); fly(notes[1], monitorWorld, { arc: 0.3 });
            face('shock'); emote('😵'); caption(3, 1); wait(0.8);
            face('angry'); typing(1.0); emote('💢');
            pose('sleepDesk', 0.8); face('sleep'); caption(3, 2); emote('💤', 1.2); wait(0.6); emote('💤', 1.2); wait(0.8);
            pose('type', 0.15); face('shock'); emote('❗'); caption(3, 3); wait(0.3);
            face('neutral'); typing(1.2); screen('monitor', 'ok'); face('happy'); emote('💡');
            posters.forEach((p, i) => fly(p, monitorWorld, { d: 1.1, spin: i ? -3 : 3, arc: 0.5 }));
            caption(3, 4); wait(0.8);
            move('deskStand', 'stand', 0.6); jump(2); confetti(); emote('🎉', 1.5, '<'); caption(3, 5); badges(3); wait(0.6);
            pose('stand', 0.5);
        },
        // 2025 : terminal en erreur, QR à rescanner, !ping… pong, danse de la victoire
        () => {
            place('deskSit', 'type'); A.face('neutral'); releasePhone(4, true);
            screen('phone', 'typing'); shot('desk');
            caption(4, 0); typing(2.0);
            face('angry'); emote('😩'); caption(4, 1); typing(0.8);
            holdPhone(); T.to(A.holdPoint.position, { y: 0.45, z: 0.42, duration: 0.4 });
            emote('📷'); caption(4, 2); T.to(A.holdPoint.rotation, { z: 0.3, duration: 0.15, yoyo: true, repeat: 5 }); wait(0.3);
            T.to(A.holdPoint.position, { y: 0.3, z: 0.3, duration: 0.3 });
            face('neutral'); typing(0.8);
            screen('phone', 'ping'); caption(4, 3); emote('🤞', 1.4); wait(1.2);
            screen('phone', null); face('shock'); emote('🤯');
            releasePhone(4);
            move('deskStand', 'shock', 0.4); catReact('startle'); caption(4, 4); wait(0.6);
            face('happy'); dance(8); confetti(); catReact('happy'); badges(4); caption(4, 5); wait(0.4);
            pose('stand', 0.5);
        },
        // 2026 : le serveur tombe, 502, la baleine Docker sort de l'écran, le compteur grimpe
        () => {
            const server = itemOf('server').group, whale = itemOf('whale').group, stats = itemOf('stats').group;
            place('center', 'stand'); A.face('happy');
            shot('wide'); caption(5, 0); wait(0.5);
            drop(server); emote('😮', 1.2, '-=0.5');
            walk(SPOTS.server.pos[0], SPOTS.server.pos[2], 1.0); turnTo(SPOTS.server.rot[1]);
            pose('crouch', 0.4); T.to(A.root.position, { y: 0.72, duration: 0.4 }, '<'); caption(5, 1); wait(0.8);
            pose('stand', 0.3); T.to(A.root.position, { y: 0.9, duration: 0.3 }, '<');
            screen('monitor', 'error'); turnTo(0.4); face('shock'); emote('😱'); caption(5, 2); shake(4); wait(0.4);
            walk(SPOTS.deskStand.pos[0], SPOTS.deskStand.pos[2], 1.2);
            move('deskSit', 'type', 0.6); screen('monitor', 'typing'); face('neutral'); caption(5, 3); typing(2.0);
            screen('monitor', null);
            fly(whale, monitorWorld, { d: 1.4, spin: 0, arc: 0.6 }); face('happy'); emote('🐳'); caption(5, 4); wait(1.0);
            T.call(() => { screenMode.stats = { a: 0, b: 0 }; room.redrawStats(ctx.lang()); });
            fly(stats, monitorWorld, { d: 0.9, spin: 0, arc: 0.3 });
            const counter = { a: 0, b: 0 };
            T.to(counter, {
                a: 3000, b: 100, duration: 2.2, ease: 'power2.out',
                onStart: () => { counter.a = 0; counter.b = 0; },
                onUpdate: () => { screenMode.stats = { a: Math.round(counter.a), b: Math.round(counter.b) }; room.redrawStats(ctx.lang()); }
            });
            caption(5, 5);
            T.call(() => { screenMode.stats = null; room.redrawStats(ctx.lang()); });
            move('deskStand', 'stand', 0.6); jump(2); confetti(); emote('🎉', 1.5, '<'); caption(5, 6); badges(5); wait(0.6);
            pose('stand', 0.5);
        },
        // Aujourd'hui : il vient vers vous, salue, montre l'enseigne freelance
        () => {
            const neon = itemOf('neon').group;
            place('deskStand', 'stand'); A.face('happy');
            shot('wide');
            walk(SPOTS.center.pos[0], SPOTS.center.pos[2], 1.0); turnTo(0.75);
            pose('wave', 0.4); caption(6, 0); emote('👋', 1.6, '<');
            T.to(A.J.rEl.rotation, { z: 0.5, duration: 0.2, yoyo: true, repeat: 5, ease: 'sine.inOut' });
            fly(neon, handWorld, { d: 1.2, spin: 0, arc: 0.6 });
            turnTo(-0.2, 0.4); pose('point', 0.4); caption(6, 1); wait(1.4);
            turnTo(0.75, 0.4); pose('stand', 0.4); caption(6, 2); wait(1.0);
        }
    ];

    /* ------------------------------------------------------------- contrôle */
    function cleanup() {
        if (T) { T.kill(); T = null; }
        if (idle) { idle.kill(); idle = null; }
        [...temps].forEach(removeTemp);
        gsap.killTweensOf(A.root.position); gsap.killTweensOf(A.root.rotation); gsap.killTweensOf(A.root.scale);
        Object.values(A.J).forEach(j => gsap.killTweensOf(j.rotation));
        A.holdPoint.position.set(0, 0.3, 0.3); A.holdPoint.rotation.set(0, 0, 0);
        A.root.scale.set(1, 1, 1);
        const hemi = room.lights.hemi;
        if (hemi.userData.saved !== undefined) { gsap.killTweensOf(hemi); hemi.intensity = hemi.userData.saved; delete hemi.userData.saved; }
        screenMode.phone = null; screenMode.monitor = null;
        if (screenMode.stats) { screenMode.stats = null; room.redrawStats(ctx.lang()); }
    }

    // état final immédiat (passer la scène, ou mouvement réduit)
    function finalize(ch) {
        cleanup();
        ownedObjects(ch).forEach(({ obj }) => { gsap.killTweensOf(obj.position); gsap.killTweensOf(obj.scale); gsap.killTweensOf(obj.rotation); obj.visible = true; obj.userData.flying = false; restore(obj); });
        room.badges.forEach((b, i) => {
            if (BADGES[i].ch <= ch) { gsap.killTweensOf(b.group.scale); gsap.killTweensOf(b.group.position); b.group.visible = true; restore(b.group); }
        });
        const f = FINAL[ch];
        place(f.spot, f.pose); A.face(f.face);
        releasePhone(ch, true);
        if (f.monitor) screenMode.monitor = f.monitor;
        playing = false;
        startIdle(ch);
    }

    function startIdle(ch) {
        if (ctx.reduced) return;
        idle = gsap.timeline({ repeat: -1 });
        idle.to(A.root.scale, { y: 1.015, duration: 1.6, yoyo: true, repeat: 1, ease: 'sine.inOut' });
        if (ch === 6) {
            idle.add(A.pose('wave', 0.3))
                .to(A.J.rEl.rotation, { z: 0.5, duration: 0.2, yoyo: true, repeat: 3 })
                .add(A.pose('stand', 0.3))
                .to({}, { duration: 2.5 });
        }
    }

    function play(ch) {
        cleanup();
        current = ch;
        // les objets de la scène attendent leur entrée
        ownedObjects(ch).forEach(({ obj }) => {
            store(obj);
            gsap.killTweensOf(obj.scale); gsap.killTweensOf(obj.position);
            obj.visible = false;
        });
        itemsVisible(ch);
        badgesOf(ch).forEach(b => { store(b.group); gsap.killTweensOf(b.group.scale); gsap.killTweensOf(b.group.position); b.group.visible = false; });
        // le téléphone revient à sa place de l'année (sauf s'il est pris en main par la scène)
        releasePhone(ch, true);

        if (ctx.reduced) { finalize(ch); ctx.onEnd(ch, false); return; }

        playing = true;
        T = gsap.timeline({
            onComplete: () => {
                T = null; playing = false;
                const f = FINAL[ch];
                if (f.monitor) screenMode.monitor = f.monitor; else screenMode.monitor = null;
                screenMode.phone = null;
                startIdle(ch);
                ctx.onEnd(ch, true);
            }
        });
        SCRIPTS[ch]();
    }
    // les groupes « à pièces » restent visibles (seules leurs pièces sont cachées)
    function itemsVisible(ch) {
        (OWNED[ch] || []).filter(s => s.parts).forEach(s => {
            const it = itemOf(s.key, s.ch);
            if (it) { gsap.killTweensOf(it.group.scale); it.group.visible = true; it.group.scale.copy(it.group.userData.baseScale); }
        });
        (OWNED[ch] || []).filter(s => !s.parts).forEach(s => {
            const it = itemOf(s.key, s.ch);
            if (it) gsap.killTweensOf(it.group.scale);
        });
    }

    function skip() {
        if (!playing) return;
        finalize(current);
        ctx.onEnd(current, false);
    }

    function petCat() {
        if (ctx.reduced) return;
        gsap.timeline()
            .to(cat.root.position, { y: '+=0.15', duration: 0.15, yoyo: true, repeat: 1 })
            .fromTo(cat.head.rotation, { z: -0.3 }, { z: 0.3, duration: 0.15, repeat: 3, yoyo: true, onComplete: () => { cat.head.rotation.z = 0; } });
    }

    return { play, skip, replay: () => play(current), finalize, petCat, isPlaying: () => playing };
}
