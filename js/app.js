// VansCode 3D : l'histoire racontée dans une chambre qui évolue de 2020 à aujourd'hui.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CHAPTERS, HOTSPOTS, UI } from './story.js';
import { buildRoom, ENVS } from './room.js';
import { buildAvatar, buildCat } from './avatar.js';
import { createDirector } from './scenes.js';

const $ = s => document.querySelector(s);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(pointer: coarse)').matches;
const D = s => (reduced ? 0 : s);   // durée d'animation (0 si mouvement réduit)

/* ------------------------------------------------------------------ état */
const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem('vc3d-' + k)) ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('vc3d-' + k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } }
};
const state = {
    ch: 0,
    lang: store.get('lang', (navigator.language || 'fr').startsWith('fr') ? 'fr' : 'en'),
    seen: new Set(store.get('seen', [])),
    found: new Set(store.get('found', [])),
    focused: null
};
const STORY_IDS = HOTSPOTS.filter(h => !h.action).map(h => h.id);
const tr = obj => (obj && typeof obj === 'object' && !Array.isArray(obj) ? obj[state.lang] : obj);
const ui = k => UI[state.lang][k];

/* ------------------------------------------------------------- WebGL ? */
let renderer;
try {
    renderer = new THREE.WebGLRenderer({ canvas: $('#scene'), antialias: true, powerPreference: 'high-performance' });
} catch (e) {
    document.body.classList.add('no-webgl');
    $('#webgl-msg').textContent = UI.fr.webglError;
    $('#loader').classList.add('is-done');
    throw e;
}

/* ------------------------------------------------------------- loader */
const loaderLine = $('#loader-line');
let loaderIdx = 0;
const loaderTimer = setInterval(() => {
    loaderIdx = (loaderIdx + 1) % UI[state.lang].loading.length;
    loaderLine.textContent = UI[state.lang].loading[loaderIdx];
}, 700);
const setLoad = p => { $('#loader-bar').style.width = p + '%'; };
setLoad(20);

/* ------------------------------------------------------------- scène */
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isTouch ? 1.5 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
const shadows = !isTouch;
renderer.shadowMap.enabled = shadows;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(ENVS[0].bg);
scene.fog = new THREE.Fog(ENVS[0].bg, 14, 28);

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.05, 60);
const HOME = { pos: new THREE.Vector3(6.2, 4.6, 6.9), target: new THREE.Vector3(-0.2, 1.0, -0.6) };
function homePos() {
    // Sur écran étroit, on recule pour garder toute la chambre visible
    const aspect = window.innerWidth / window.innerHeight;
    const k = aspect < 1 ? 1 + (1 - aspect) * 0.9 : 1;
    return HOME.target.clone().add(HOME.pos.clone().sub(HOME.target).multiplyScalar(k));
}
// Sur grand écran, la carte occupe la droite : on décale le rendu pour centrer la chambre dans l'espace libre
function applyViewOffset() {
    const w = window.innerWidth, h = window.innerHeight;
    if (w > 900) camera.setViewOffset(w, h, Math.min(220, w * 0.16), 0, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
}
camera.position.copy(homePos()).add(new THREE.Vector3(6, 5, 8));

applyViewOffset();
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(HOME.target);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.minDistance = 1.0;
controls.maxDistance = 18;
controls.minPolarAngle = 0.35;
controls.maxPolarAngle = 1.45;
controls.minAzimuthAngle = -0.1;
controls.maxAzimuthAngle = 1.62;
controls.rotateSpeed = 0.6;

const room = buildRoom(scene, { shadows });

// Avatar + chat + metteur en scène (une scène animée par chapitre)
const avatar = buildAvatar();
const cat = buildCat();
scene.add(avatar.root, cat.root);
const director = createDirector({
    scene, room, avatar, cat, reduced,
    lang: () => state.lang,
    flyTo,
    home: () => ({ pos: homePos(), target: HOME.target }),
    caption: showCaption,
    onEnd: onSceneEnd
});
setLoad(70);

/* ------------------------------------------------------- marqueurs « ! » */
// Un anneau doré pulse au-dessus de chaque objet dont l'anecdote n'a pas encore été lue.
const ringTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d');
    x.strokeStyle = '#ffb547'; x.lineWidth = 10; x.beginPath(); x.arc(64, 64, 48, 0, Math.PI * 2); x.stroke();
    x.fillStyle = '#ffb547'; x.font = '700 64px "Space Grotesk", sans-serif'; x.textAlign = 'center'; x.fillText('?', 64, 86);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const markerMat = new THREE.SpriteMaterial({ map: ringTex, depthTest: false, transparent: true, toneMapped: false });
const markers = new Map(); // key d'objet -> sprite

function objectsByKey(key) {
    const out = [];
    room.items.forEach(it => { if (it.group.userData.key === key) out.push(it); });
    return out;
}
function activeHotspot(key, ch = state.ch) {
    return HOTSPOTS.find(h => h.obj === key && ch >= h.ch[0] && ch <= h.ch[1]);
}
function visibleBox(key) {
    const box = new THREE.Box3();
    objectsByKey(key).forEach(it => { if (inRange(it.ch)) box.expandByObject(it.group); });
    return box;
}
const inRange = (ch, i = state.ch) => i >= ch[0] && i <= ch[1];

let markerCall = null;
function clearMarkers() {
    markers.forEach(s => scene.remove(s));
    markers.clear();
}
// Les marqueurs sont placés une fois les objets arrivés (apparition + déplacement du téléphone)
function scheduleMarkers() {
    clearMarkers();
    if (markerCall) markerCall.kill();
    markerCall = gsap.delayedCall(D(1.6), updateMarkers);
}
function updateMarkers() {
    clearMarkers();
    const keys = new Set(HOTSPOTS.filter(h => inRange(h.ch) && !h.action && !state.found.has(h.id)).map(h => h.obj));
    keys.forEach(key => {
        const box = visibleBox(key);
        if (box.isEmpty()) return;
        const s = new THREE.Sprite(markerMat);
        const c = box.getCenter(new THREE.Vector3());
        s.position.set(c.x, box.max.y + 0.22, c.z);
        s.scale.setScalar(0.22);
        s.renderOrder = 10;
        s.userData.baseY = s.position.y;
        scene.add(s);
        markers.set(key, s);
    });
}

/* ------------------------------------------------------------ chapitres */
function setChapter(i, { silent = false } = {}) {
    i = Math.max(0, Math.min(CHAPTERS.length - 1, i));
    const prev = state.ch;
    state.ch = i;
    state.seen.add(i);
    store.set('seen', [...state.seen]);

    // objets : apparition / disparition
    room.items.forEach(it => {
        const show = inRange(it.ch, i), wasShown = it.group.visible && inRange(it.ch, prev);
        const base = it.group.userData.baseScale;
        gsap.killTweensOf(it.group.scale);
        if (show && (!wasShown || !it.group.visible)) {
            it.group.visible = true;
            gsap.fromTo(it.group.scale, { x: 0.001, y: 0.001, z: 0.001 },
                { x: base.x, y: base.y, z: base.z, duration: D(0.9), delay: D(0.15 + Math.random() * 0.35), ease: 'back.out(1.6)' });
        } else if (!show && it.group.visible) {
            gsap.to(it.group.scale, { x: 0.001, y: 0.001, z: 0.001, duration: D(0.4), ease: 'power2.in', onComplete: () => { it.group.visible = false; } });
        } else if (show) {
            it.group.scale.copy(base);
        }
    });
    room.badges.forEach((b, n) => {
        const show = inRange(b.ch, i);
        if (show && !b.group.visible) {
            b.group.visible = true;
            gsap.fromTo(b.group.scale, { x: 0.001, y: 0.001, z: 0.001 }, { x: 1, y: 1, z: 1, duration: D(0.7), delay: D(0.5 + n * 0.05), ease: 'back.out(2.5)' });
            if (!reduced) gsap.fromTo(b.group.position, { y: b.group.position.y + 0.4 }, { y: b.group.position.y, duration: 0.7, delay: 0.5 + n * 0.05, ease: 'bounce.out' });
        } else if (!show && b.group.visible) {
            b.group.visible = false;
        }
    });
    room.secondPlank.visible = i >= 3;

    // le téléphone change de place
    const spot = room.PHONE_SPOTS[room.phoneSpotFor(i)];
    gsap.to(room.phone.position, { x: spot.pos[0], y: spot.pos[1], z: spot.pos[2], duration: D(1.2), ease: 'power3.inOut' });
    gsap.to(room.phone.rotation, { x: spot.rot[0], y: spot.rot[1], z: spot.rot[2], duration: D(1.2), ease: 'power3.inOut' });
    room.phoneStand.visible = room.phoneSpotFor(i) === 'stand';
    room.phoneStand.position.set(spot.pos[0], 0.8, spot.pos[2] - 0.03);

    // ambiance lumineuse
    const env = ENVS[i];
    const L = room.lights;
    const tweenColor = (target, hex) => { const c = new THREE.Color(hex); gsap.to(target, { r: c.r, g: c.g, b: c.b, duration: D(1.4) }); };
    tweenColor(scene.background, env.bg);
    tweenColor(scene.fog.color, env.bg);
    tweenColor(L.hemi.color, env.sky);
    tweenColor(L.hemi.groundColor, env.ground);
    tweenColor(L.sun.color, env.sunColor);
    tweenColor(room.windowMat.color, env.window);
    tweenColor(room.wallMat.color, env.wall);
    gsap.to(L.hemi, { intensity: env.hemi, duration: D(1.4) });
    gsap.to(L.sun, { intensity: env.sun, duration: D(1.4) });
    gsap.to(L.lampLight, { intensity: env.lamp, duration: D(1.4) });
    room.lampHead.material.emissiveIntensity = env.lamp > 0 ? 1.2 : 0.15;
    gsap.to(L.phoneLight, { intensity: i <= 1 ? 6 : i === 4 ? 2 : 0, duration: D(1) });
    gsap.to(L.monitorLight, { intensity: i >= 2 ? 4 : 0, duration: D(1) });
    gsap.to(L.serverLight, { intensity: i >= 5 ? 5 : 0, duration: D(1) });
    gsap.to(L.neonLight, { intensity: i === 6 ? 6 : 0, duration: D(1) });
    room.moon.material.color.set(i === 2 || i === 6 ? '#fff3c4' : i === 3 ? '#ffd27a' : '#f2f0ff');
    gsap.killTweensOf(L.alarm);
    L.alarm.intensity = 0;
    if (env.alarm && !reduced) gsap.to(L.alarm, { intensity: 5, duration: 0.6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    else if (env.alarm) L.alarm.intensity = 2.5;

    // calendrier : on tourne la page
    const label = tr(CHAPTERS[i].year);
    if (!reduced && prev !== i) {
        const page = room.calendar.userData.page;
        gsap.timeline()
            .to(page.rotation, { x: -Math.PI / 2, duration: 0.25, ease: 'power2.in' })
            .add(() => room.redraw(i, state.lang, clock.elapsedTime, label))
            .fromTo(page.rotation, { x: Math.PI / 2 }, { x: 0, duration: 0.35, ease: 'back.out(2)' });
    } else {
        room.redraw(i, state.lang, clock.elapsedTime, label);
    }

    unfocus(false);
    clearMarkers();
    renderTimeline();
    renderObjectsList();
    renderProgress();
    card.hidden = true;
    director.play(i);
}

/* --------------------------------------------------------------- caméra */
function flyTo(pos, target, duration = 1.4) {
    gsap.killTweensOf(camera.position); gsap.killTweensOf(controls.target);
    gsap.to(camera.position, { x: pos.x, y: pos.y, z: pos.z, duration: D(duration), ease: 'power3.inOut' });
    gsap.to(controls.target, { x: target.x, y: target.y, z: target.z, duration: D(duration), ease: 'power3.inOut' });
}

function focusOn(key) {
    const box = visibleBox(key);
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()).length();
    // on se place face à l'objet, du côté ouvert de la chambre
    const dir = camera.position.clone().sub(controls.target).normalize();
    dir.y = Math.max(dir.y, 0.25); dir.normalize();
    const dist = Math.max(1.4, size * 1.6) * (window.innerWidth < 720 ? 1.5 : 1);
    flyTo(center.clone().add(dir.multiplyScalar(dist)), center, 1.2);
    state.focused = key;
    $('#overview-btn').hidden = false;
}

function unfocus(fly = true) {
    state.focused = null;
    $('#overview-btn').hidden = true;
    if (fly) flyTo(homePos(), HOME.target);
}

/* ------------------------------------------------------------- carte UI */
const card = $('#card');
function openCard() {
    card.hidden = false;
    if (!reduced) gsap.fromTo(card, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' });
}
let cardMode = { type: 'chapter' };

function showChapterCard() {
    cardMode = { type: 'chapter' };
    const c = CHAPTERS[state.ch];
    $('#card-year').textContent = tr(c.year);
    $('#card-title').textContent = tr(c.title);
    $('#card-text').textContent = tr(c.text);
    const skills = (Array.isArray(c.skills) ? c.skills : c.skills[state.lang]).map(tr);
    $('#card-extra').innerHTML = '';
    const bugBlock = document.createElement('div');
    bugBlock.innerHTML = `<p class="card__label">${ui('bugLabel')}</p>`;
    const bug = document.createElement('p'); bug.className = 'bug'; bug.textContent = tr(c.bug);
    bugBlock.appendChild(bug);
    const skillBlock = document.createElement('div');
    skillBlock.innerHTML = `<p class="card__label">${ui('skillsLabel')}</p>`;
    const ul = document.createElement('ul'); ul.className = 'chips';
    skills.forEach(s => { const li = document.createElement('li'); li.textContent = s; ul.appendChild(li); });
    skillBlock.appendChild(ul);
    $('#card-extra').append(bugBlock, skillBlock);

    const nav = $('#card-nav'); nav.innerHTML = '';
    const left = HOTSPOTS.filter(h => inRange(h.ch) && !h.action && !state.found.has(h.id)).length;
    if (left) nav.appendChild(btn(`<i class="ri-search-eye-line" aria-hidden="true"></i>${ui('objectsBtn')} (${left})`, toggleObjects));
    nav.appendChild(btn(`<i class="ri-replay-line" aria-hidden="true"></i>${ui('replay')}`, () => { card.hidden = true; unfocus(); director.replay(); }));
    if (state.ch < CHAPTERS.length - 1) nav.appendChild(btn(`${ui('next')} <i class="ri-arrow-right-line" aria-hidden="true"></i>`, () => setChapter(state.ch + 1), true));
    else nav.appendChild(btn(`<i class="ri-mail-send-line" aria-hidden="true"></i>${ui('contact')}`, openContact, true));
    openCard();
}

function showHotspotCard(h) {
    cardMode = { type: 'hotspot', id: h.id };
    $('#card-year').textContent = tr(CHAPTERS[state.ch].year);
    $('#card-title').textContent = tr(h.title);
    $('#card-text').textContent = tr(h.text);
    $('#card-extra').innerHTML = '';
    if (h.link) {
        const a = document.createElement('a');
        a.href = h.link.href; a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.className = 'card__link'; a.innerHTML = `${h.link.label} <i class="ri-arrow-right-up-line" aria-hidden="true"></i>`;
        $('#card-extra').appendChild(a);
    }
    const nav = $('#card-nav'); nav.innerHTML = '';
    nav.appendChild(btn(`<i class="ri-arrow-left-line" aria-hidden="true"></i>${ui('back')}`, () => { unfocus(); showChapterCard(); }));
    openCard();
}

function btn(html, onClick, accent = false) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'pill' + (accent ? ' pill--accent' : '');
    b.innerHTML = html; b.addEventListener('click', onClick);
    return b;
}

$('#card-close').addEventListener('click', () => { card.hidden = true; });

/* ------------------------------------------------------- interactions */
function activate(key) {
    hideHint();
    if (key === 'calendar') {
        const next = state.ch < CHAPTERS.length - 1 ? state.ch + 1 : 0;
        setChapter(next);
        return;
    }
    if (key === 'me') {
        if (state.ch === CHAPTERS.length - 1) openContact();
        else { card.hidden = true; unfocus(); director.replay(); }
        return;
    }
    if (key === 'cat') { director.petCat(); showCaption(ui('catSays')); hideCaptionSoon(); return; }
    const h = activeHotspot(key);
    if (!h) return;
    if (h.action === 'contact') { openContact(); return; }
    if (!state.found.has(h.id)) {
        state.found.add(h.id);
        store.set('found', [...state.found]);
        const m = markers.get(key);
        if (m) gsap.to(m.scale, { x: 0, y: 0, duration: D(0.3), onComplete: () => { scene.remove(m); markers.delete(key); } });
        renderProgress(); renderObjectsList();
    }
    focusOn(key);
    showHotspotCard(h);
    // petit « boing » de l'objet cliqué
    objectsByKey(key).forEach(it => {
        if (!inRange(it.ch) || reduced) return;
        const b = it.group.userData.baseScale;
        gsap.fromTo(it.group.scale, { x: b.x * 1.12, y: b.y * 1.12, z: b.z * 1.12 }, { x: b.x, y: b.y, z: b.z, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    });
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const tooltip = $('#tooltip');
let hoverKey = null;

function pick(clientX, clientY) {
    pointer.set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(scene.children, true);
    for (const hit of hits) {
        let o = hit.object, visible = true;
        while (o) { if (!o.visible) { visible = false; break; } if (o.userData.key) break; o = o.parent; }
        if (!visible) continue;
        if (o && o.userData.key) {
            const key = o.userData.key;
            if (key === 'calendar' || key === 'me' || key === 'cat' || activeHotspot(key)) return key;
            return null;
        }
        if (hit.object.isSprite) continue;
        return null; // un mur ou un meuble masque l'objet
    }
    return null;
}

function labelFor(key) {
    if (key === 'calendar') return ui('calendarHint');
    if (key === 'me') return state.ch === CHAPTERS.length - 1 ? ui('meContact') : ui('meReplay');
    if (key === 'cat') return ui('cat');
    const h = activeHotspot(key);
    return h ? tr(h.title) : '';
}

const canvas = renderer.domElement;
canvas.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    const key = pick(e.clientX, e.clientY);
    if (key !== hoverKey) {
        hoverKey = key;
        document.body.classList.toggle('is-hovering', !!key);
        tooltip.classList.toggle('is-visible', !!key);
        if (key) tooltip.textContent = labelFor(key);
    }
    if (key) { tooltip.style.left = e.clientX + 'px'; tooltip.style.top = e.clientY + 'px'; }
});
canvas.addEventListener('pointerleave', () => { hoverKey = null; tooltip.classList.remove('is-visible'); document.body.classList.remove('is-hovering'); });

// Un clic = appui + relâchement sans glisser (sinon c'est une rotation de caméra)
let down = null;
canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; });
canvas.addEventListener('pointerup', e => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    down = null;
    if (moved > 6) { hideHint(); return; }
    const key = pick(e.clientX, e.clientY);
    if (key) activate(key);
});
controls.addEventListener('start', () => {
    // l'utilisateur reprend la main : on arrête les vols de caméra en cours
    gsap.killTweensOf(camera.position); gsap.killTweensOf(controls.target);
});

/* ----------------------------------------------------------- frise / HUD */
function renderTimeline() {
    const ol = $('#timeline'); ol.innerHTML = '';
    CHAPTERS.forEach((c, i) => {
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = (tr(c.year) + '').split(' ')[0];
        b.title = tr(c.title);
        b.setAttribute('aria-label', `${tr(c.year)} : ${tr(c.title)}`);
        if (i === state.ch) { b.classList.add('is-current'); b.setAttribute('aria-current', 'step'); }
        if (state.seen.has(i)) b.classList.add('is-seen');
        b.addEventListener('click', () => { hideHint(); setChapter(i); });
        li.appendChild(b); ol.appendChild(li);
    });
    $('#prev-btn').disabled = state.ch === 0;
    $('#next-btn').disabled = state.ch === CHAPTERS.length - 1;
    const cur = ol.querySelector('.is-current');
    if (cur) cur.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'auto' : 'smooth' });
}
function renderProgress() {
    const found = STORY_IDS.filter(id => state.found.has(id)).length;
    $('#progress-txt').textContent = `${ui('chapters')} ${state.seen.size}/${CHAPTERS.length}  ·  ${ui('stories')} ${found}/${STORY_IDS.length}`;
}
$('#prev-btn').addEventListener('click', () => setChapter(state.ch - 1));
$('#next-btn').addEventListener('click', () => setChapter(state.ch + 1));
$('#overview-btn').addEventListener('click', () => { unfocus(); showChapterCard(); });

// Liste accessible des objets (alternative clavier au clic 3D)
const objectsPanel = $('#objects-panel');
function renderObjectsList() {
    const ul = $('#objects-list'); ul.innerHTML = '';
    const entries = [{ key: 'calendar', title: `${ui('calendarTitle')} : ${ui('calendarHint')}`, done: false }]
        .concat(HOTSPOTS.filter(h => inRange(h.ch)).map(h => ({ key: h.obj, title: tr(h.title), done: state.found.has(h.id) })));
    entries.forEach(en => {
        const li = document.createElement('li');
        const b = document.createElement('button'); b.type = 'button';
        b.innerHTML = `<span></span>${en.done ? `<i class="ri-check-line done" aria-label="${ui('discovered')}"></i>` : '<i class="ri-arrow-right-s-line" aria-hidden="true"></i>'}`;
        b.querySelector('span').textContent = en.title;
        b.addEventListener('click', () => { objectsPanel.hidden = true; activate(en.key); });
        li.appendChild(b); ul.appendChild(li);
    });
}
function toggleObjects() {
    objectsPanel.hidden = !objectsPanel.hidden;
    $('#objects-btn').setAttribute('aria-expanded', String(!objectsPanel.hidden));
    if (!objectsPanel.hidden) { card.hidden = true; objectsPanel.querySelector('button')?.focus(); }
}
$('#objects-btn').addEventListener('click', toggleObjects);

/* ------------------------------------------------------------ langue */
function applyLang() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-ui]').forEach(el => { el.textContent = ui(el.dataset.ui); });
    $('#lang-btn').setAttribute('aria-label', state.lang === 'fr' ? 'Switch to English' : 'Passer en français');
    $('#timeline-nav').setAttribute('aria-label', ui('timeline'));
    $('#prev-btn').setAttribute('aria-label', ui('prev'));
    $('#next-btn').setAttribute('aria-label', ui('next'));
    $('#card-close').setAttribute('aria-label', ui('close'));
    $('#contact-close').setAttribute('aria-label', ui('close'));
    room.redrawStatic(state.lang);
    room.redraw(state.ch, state.lang, clock.elapsedTime, tr(CHAPTERS[state.ch].year));
    renderTimeline(); renderProgress(); renderObjectsList();
    if (!card.hidden) {
        if (cardMode.type === 'hotspot') showHotspotCard(HOTSPOTS.find(h => h.id === cardMode.id));
        else showChapterCard();
    }
}
$('#lang-btn').addEventListener('click', () => {
    state.lang = state.lang === 'fr' ? 'en' : 'fr';
    store.set('lang', state.lang);
    applyLang();
});

/* ------------------------------------------------------- sous-titres */
const captionBox = $('#caption');
let captionTimer = null;
function showCaption(text) {
    clearTimeout(captionTimer);
    $('#caption-text').textContent = text;
    $('#skip-btn').hidden = !director.isPlaying();
    if (captionBox.hidden) {
        captionBox.hidden = false;
        if (!reduced) gsap.fromTo(captionBox, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 });
    } else if (!reduced) {
        gsap.fromTo('#caption-text', { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.25 });
    }
}
function hideCaptionSoon(delay = 2600) {
    clearTimeout(captionTimer);
    captionTimer = setTimeout(() => { captionBox.hidden = true; }, delay);
}
function onSceneEnd(ch, played) {
    if (ch !== state.ch) return;
    $('#skip-btn').hidden = true;
    if (played) hideCaptionSoon(); else captionBox.hidden = true;
    scheduleMarkers();
    showChapterCard();
}
$('#skip-btn').addEventListener('click', () => director.skip());

/* ------------------------------------------------------------- astuce */
const hint = $('#hint');
let hintTimer = null;
function showHint() {
    if (store.get('hinted', false)) return;
    hint.textContent = ui('hint'); hint.hidden = false;
    hintTimer = setTimeout(hideHint, 9000);
}
function hideHint() {
    if (hint.hidden) return;
    clearTimeout(hintTimer); hint.hidden = true; store.set('hinted', true);
}

/* ------------------------------------------------------------ contact */
const dialog = $('#contact');
function openContact() {
    hideHint();
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
}
$('#contact-btn').addEventListener('click', openContact);
$('#contact-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

const form = $('#contact-form');
const rules = {
    name: v => v.trim().length >= 2 || ui('errName'),
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || ui('errEmail'),
    message: v => v.trim().length >= 10 || ui('errMsg')
};
function check(input) {
    const res = rules[input.name](input.value);
    const err = document.getElementById(input.id + '-err');
    const ok = res === true;
    input.setAttribute('aria-invalid', String(!ok));
    if (ok) input.removeAttribute('aria-describedby'); else input.setAttribute('aria-describedby', err.id);
    err.textContent = ok ? '' : res;
    return ok;
}
const fields = ['#f-name', '#f-email', '#f-msg'].map(s => $(s));
fields.forEach(f => {
    f.addEventListener('blur', () => { if (f.value) check(f); });
    f.addEventListener('input', () => { if (f.getAttribute('aria-invalid') === 'true') check(f); });
});
form.addEventListener('submit', async e => {
    e.preventDefault();
    const ok = fields.map(check).every(Boolean);
    if (!ok) { fields.find(f => f.getAttribute('aria-invalid') === 'true').focus(); return; }
    const send = $('#send-btn'), status = $('#form-status'), icon = send.querySelector('i'), label = send.querySelector('span');
    send.disabled = true; icon.className = 'ri-loader-4-line spin'; label.textContent = ui('sending');
    status.className = 'status'; status.textContent = '';
    try {
        const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(form) });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json.success === false) throw new Error(json.message || 'error');
        status.classList.add('is-ok'); status.textContent = ui('sent');
        form.reset();
    } catch (err) {
        status.classList.add('is-err'); status.textContent = ui('failed');
    } finally {
        send.disabled = false; icon.className = 'ri-send-plane-2-line'; label.textContent = ui('send');
    }
});

/* ------------------------------------------------------------ clavier */
document.addEventListener('keydown', e => {
    if (dialog.open || /INPUT|TEXTAREA/.test(document.activeElement?.tagName)) return;
    if (e.key === 'Escape' && director.isPlaying()) { director.skip(); return; }
    if (e.key === 'ArrowRight') setChapter(state.ch + 1);
    else if (e.key === 'ArrowLeft') setChapter(state.ch - 1);
    else if (e.key === 'Escape') {
        if (!objectsPanel.hidden) { objectsPanel.hidden = true; $('#objects-btn').focus(); }
        else if (state.focused) { unfocus(); showChapterCard(); }
        else card.hidden = true;
    }
});

/* -------------------------------------------------------------- boucle */
const clock = new THREE.Clock();
let screenAcc = 0;
function tick() {
    const dt = Math.min(clock.getDelta(), 0.1);
    const t = clock.elapsedTime;
    controls.update();

    if (!reduced) {
        room.floaters.forEach(f => {
            if (!f.obj.visible || f.obj.userData.flying) return;
            f.obj.position.y = f.y + Math.sin(t * f.speed + (f.phase || 0)) * f.amp;
            if (f.sway) f.obj.rotation.y = 0.6 + Math.sin(t * 0.5) * 0.35;
        });
        markers.forEach(s => {
            s.position.y = s.userData.baseY + Math.sin(t * 3) * 0.05;
            s.material.opacity = 0.75 + Math.sin(t * 3) * 0.25;
        });
        if (state.ch >= 5) room.leds.forEach((l, i) => { l.visible = Math.sin(t * (3 + i) + i) > -0.3; });
    }

    // écrans animés (≈ 8 images/s suffisent, et ça ménage le processeur)
    screenAcc += dt;
    if (screenAcc > 0.12) {
        screenAcc = 0;
        room.redraw(state.ch, state.lang, t);
    }
    renderer.render(scene, camera);
}

/* ------------------------------------------------------------ redimension */
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    applyViewOffset();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

/* -------------------------------------------------------------- démarrage */
async function start() {
    // Les canvas utilisent les polices du site : on attend qu'elles soient prêtes (max 2 s)
    await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2000))]);
    setLoad(100);
    applyLang();
    room.items.forEach(it => { it.group.visible = false; });
    setChapter(store.get('lastCh', 0) || 0, { silent: true });
    renderer.setAnimationLoop(tick);
    clearInterval(loaderTimer);
    $('#loader').classList.add('is-done');
    gsap.to(camera.position, {
        x: homePos().x, y: homePos().y, z: homePos().z, duration: D(2.6), ease: 'power3.out',
        onComplete: showHint
    });
}
window.addEventListener('beforeunload', () => store.set('lastCh', state.ch));
start();
