// vanscode3d.js - Corrections finales des positions et rotations

let sceneWebGL, sceneCSS, camera, rendererWebGL, rendererCSS;
let raycaster, mouse;
let roomModel;
let clickableObjects = [];
let currentTarget = 'global';

// --- Animations ---
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const medalObjs = [];          // médailles flottantes (CSS3D)
let pcGlowLight = null;        // lumière pulsante de l'écran PC
const parallax = { x: 0, y: 0 }; // décalage caméra suivant la souris (vue globale)
const parallaxTarget = { x: 0, y: 0 };
let introDone = false;

// Variables globales pour le calibrateur
let compPanelObj = null;
let compHitZone = null;

// Points de vue
const VIEWS = {
    global: { pos: new THREE.Vector3(1.0, 1.5, 3.5), lookAt: new THREE.Vector3(-1.291, 0.765, 1.442) }, // Vue d'ensemble reculée
    pc: { pos: new THREE.Vector3(-0.860, 0.770, 1.455), lookAt: new THREE.Vector3(-1.360, 0.770, 1.455) }, // Face à l'écran PC (distance 50cm)
    tablet: { pos: new THREE.Vector3(-1.198, 1.1, 1.8), lookAt: new THREE.Vector3(-1.698, 1.1, 1.8) }, // Face aux projets (distance 50cm)
    phone: { pos: new THREE.Vector3(-0.975, 0.73, 1.829), lookAt: new THREE.Vector3(-1.000, 0.519, 1.829) }, 
    wall: { pos: new THREE.Vector3(-0.8, 2.0, 0.7), lookAt: new THREE.Vector3(-0.8, 2.0, 0.1) } // Écrasé dynamiquement par placeCompetencesChart
};

function init3D() {
    sceneWebGL = new THREE.Scene();
    sceneWebGL.background = new THREE.Color(0x050505);
    
    sceneCSS = new THREE.Scene();

    // Initialisation de la caméra avec ajustement FOV pour mobile (portrait)
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 100);
    if (camera.aspect < 1) {
        camera.fov = 60 + (1 - camera.aspect) * 45;
        camera.updateProjectionMatrix();
    }
    
    camera.position.copy(VIEWS.global.pos);
    camera.lookAt(VIEWS.global.lookAt);
    camera.userData.targetObj = new THREE.Vector3().copy(VIEWS.global.lookAt);

    rendererWebGL = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true }); // logarithmicDepthBuffer aide pour le z-fighting
    rendererWebGL.setSize(window.innerWidth, window.innerHeight);
    rendererWebGL.shadowMap.enabled = true;
    rendererWebGL.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererWebGL.outputEncoding = THREE.sRGBEncoding;
    document.getElementById('webgl-container').appendChild(rendererWebGL.domElement);

    rendererCSS = new THREE.CSS3DRenderer();
    rendererCSS.setSize(window.innerWidth, window.innerHeight);
    // FORCE pointer-events à 'auto'. Par défaut, Three.js le met sur 'none' pour laisser 
    // passer les clics vers WebGL, mais cela casse le défilement (scroll) dans certains 
    // navigateurs. Comme on utilise un raycaster global, on peut tout mettre en 'auto' !
    rendererCSS.domElement.style.pointerEvents = 'auto';
    document.getElementById('css3d-container').appendChild(rendererCSS.domElement);

    createLights();
    loadModel();

    document.querySelectorAll('.panel-3d, section').forEach(el => {
        if(el.style) el.style.display = 'block';
    });

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('click', onClick, false);
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    
    document.getElementById('btn-back').addEventListener('click', () => {
        goToView('global');
    });

    setupNavigation();
    introFlyIn();
    if (REDUCED_MOTION) introDone = true;
    animate();
}

function createLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); 
    sceneWebGL.add(ambientLight);

    const pcGlow = new THREE.PointLight(0x00aaff, 1, 3);
    pcGlow.position.set(-1.1, 0.765, 1.442);
    sceneWebGL.add(pcGlow);
    pcGlowLight = pcGlow;

    const roomLight = new THREE.PointLight(0xffeebb, 0.8, 10);
    roomLight.position.set(0, 2, 1.5);
    sceneWebGL.add(roomLight);
}

function loadModel() {
    const loader = new THREE.GLTFLoader();
    
    loader.load(
        'models/room/scene.gltf',
        function (gltf) {
            roomModel = gltf.scene;
            sceneWebGL.add(roomModel);
            
            addCustomObjects();
            integrateHTML();
            createMedals();
            placeCompetencesChart(); // Placement dynamique sur le mur du fond
        },
        undefined,
        function (error) {
            console.error('Erreur de chargement GLTF', error);
        }
    );
}

function createClickZone(geo, pos, rot, id, viewId) {
    const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }); 
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    if(rot) mesh.rotation.copy(rot);
    mesh.userData = { id: id, view: viewId };
    sceneWebGL.add(mesh);
    clickableObjects.push(mesh);
    return mesh;
}

function createHelperObject(pos, targetPos) {
    const obj = new THREE.Object3D();
    obj.position.copy(pos);
    obj.lookAt(targetPos);
    return obj;
}

function addCustomObjects() {
    const deskY = 0.519;

    // --- Projets (Anciennement Tablette) - MURAL (A droite) ---
    const projetsPos = new THREE.Vector3(-1.698 + 0.02, 1.1, 1.8);
    createClickZone(new THREE.PlaneGeometry(0.5, 0.7), projetsPos, new THREE.Euler(0, Math.PI / 2 + 0.001, 0), 'projets-zone', 'tablet');

    // --- Compétences - Retiré d'ici (Placé dynamiquement plus tard) ---

    // --- Téléphone (Contact) - POSÉ A PLAT ET TOURNÉ ---
    const phonePos = new THREE.Vector3(-0.980, deskY + 0.005, 1.829);
    const phoneGeo = new THREE.BoxGeometry(0.16, 0.01, 0.08); // Taille très réaliste (Largeur Z=0.08, Longueur X=0.16)
    const phoneMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.1 });
    const phone = new THREE.Mesh(phoneGeo, phoneMat);
    phone.position.copy(phonePos);
    sceneWebGL.add(phone);

    // Rotation : Face +Y, sommet vers -X (+90 degrés pour être à l'endroit)
    const phoneDummy = new THREE.Object3D();
    phoneDummy.rotation.x = -Math.PI / 2 + 0.001; // Éviter l'angle parfait de 90° pour corriger le bug de clic CSS Chrome
    phoneDummy.rotateZ(Math.PI / 2 + 0.001);
    createClickZone(new THREE.PlaneGeometry(0.16, 0.08), new THREE.Vector3(-0.980, deskY + 0.01, 1.829), phoneDummy.rotation, 'contact-zone', 'phone');

    // --- Zone Clic PC ---
    const pcDummy = new THREE.Object3D();
    pcDummy.rotation.set(-0.02, 1.75, 0.02); // Valeurs exactes calibrées par l'utilisateur
    createClickZone(new THREE.PlaneGeometry(0.6, 0.35), new THREE.Vector3(-1.360, 0.770, 1.455), pcDummy.rotation, 'hero-zone', 'pc');
}

function integrateHTML() {
    // Écran PC (Valeurs exactes calibrées par l'utilisateur)
    const pcScale = 0.600 / 1200; 
    const pcDummy = new THREE.Object3D();
    pcDummy.rotation.set(-0.02, 1.75, 0.02);
    createCSS3DPanel('hero', 1200, 685, new THREE.Vector3(-1.360, 0.770, 1.455), pcDummy.rotation, pcScale);

    // Projets (Maintenant affichés sur le mur comme un poster / checklist)
    const projetsScale = 0.5 / 600;
    createCSS3DPanel('projets', 600, 825, new THREE.Vector3(-1.698 + 0.02, 1.1, 1.8), new THREE.Euler(0, Math.PI / 2 + 0.001, 0), projetsScale);

    // Téléphone (Taille réaliste et position de caméra réajustée)
    // On repasse en 400x800 pour que la taille relative de la police CSS soit DEUX FOIS PLUS GRANDE !
    const phoneScale = 0.08 / 400; // Échelle corrigée : la largeur (400) correspond au bord court (Z=0.08)
    const phoneDummy = new THREE.Object3D();
    phoneDummy.rotation.x = -Math.PI / 2 + 0.001;
    phoneDummy.rotateZ(Math.PI / 2 + 0.001);
    createCSS3DPanel('contact', 400, 800, new THREE.Vector3(-0.980, 0.519 + 0.011, 1.829), phoneDummy.rotation, phoneScale);

    const footerElement = document.querySelector('footer');
    if (footerElement) footerElement.style.display = 'none';
}

function createCSS3DPanel(id, width, height, pos, rot, scale) {
    const el = document.getElementById(id);
    if (!el) return;
    
    el.classList.add('panel-3d');
    el.style.width = width + 'px';
    el.style.height = height + 'px';
    el.style.boxSizing = 'border-box';
    
    const cssObj = new THREE.CSS3DObject(el);
    cssObj.position.copy(pos);
    cssObj.rotation.copy(rot);
    cssObj.scale.set(scale, scale, scale);
    
    sceneCSS.add(cssObj);
    return cssObj; // On retourne l'objet pour pouvoir le manipuler !
}

function createMedals() {
    const skills = [
        { name: "React", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" },
        { name: "Node.js", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" },
        { name: "PostgreSQL", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg" },
        { name: "Tailwind", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" },
        { name: "Docker", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg" },
        { name: "Figma", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg" }
    ];

    const wallX = -1.698;
    const startY = 1.25;
    const startZ = 1.2;
    const spacingY = 0.3;
    const spacingZ = 0.3;

    skills.forEach((skill, index) => {
        const row = index % 2; 
        const col = Math.floor(index / 2); 
        
        const pos = new THREE.Vector3(
            wallX + 0.01,
            startY - row * spacingY,
            startZ - col * spacingZ
        );

        // Utilisation de CSS3DObject pour les SVGs au lieu de WebGL TextureLoader
        // Cela évite l'erreur "WebGL: INVALID_VALUE: texImage2D: bad image data"
        const img = document.createElement('img');
        img.src = skill.url;
        img.style.width = '100px';
        img.style.height = '100px';
        img.style.pointerEvents = 'none'; // Laisse le clic passer à la clickZone WebGL
        
        const cssObj = new THREE.CSS3DObject(img);
        cssObj.position.copy(pos);
        cssObj.rotation.y = Math.PI / 2; // Face à +X
        // scale to fit 0.2 units (0.2 / 100 = 0.002)
        cssObj.scale.set(0.002, 0.002, 0.002);
        
        sceneCSS.add(cssObj);
        medalObjs.push({ obj: cssObj, baseY: pos.y, phase: index * 0.9 });

        // Apparition en "pop" élastique, décalée pour chaque médaille
        if (!REDUCED_MOTION) {
            cssObj.scale.set(0, 0, 0);
            gsap.to(cssObj.scale, { x: 0.002, y: 0.002, z: 0.002, duration: 1.2, delay: 2 + index * 0.15, ease: "elastic.out(1, 0.5)" });
        }

        const hitZone = createClickZone(new THREE.PlaneGeometry(0.25, 0.25), pos, new THREE.Euler(0, Math.PI/2, 0), skill.name, 'wall');
        hitZone.userData.skill = skill.name;
    });

    // Le graphique des compétences a été déplacé dans placeCompetencesChart()
}

function placeCompetencesChart() {
    // Placement final calibré par l'utilisateur !
    const targetX = -1.68; 
    const targetY = 1.10;  
    const targetZ = -1.45; 
    
    const finalPos = new THREE.Vector3(targetX, targetY, targetZ);
    const finalRot = new THREE.Euler(0.00, 0.37, 0.00); // Rotation finale calibrée

    // 1. Zone de clic WebGL
    compHitZone = createClickZone(new THREE.PlaneGeometry(1.0, 0.45), finalPos, finalRot, 'comp-zone', 'wall');

    // 2. Panneau CSS3D
    const compScale = 1.0 / 1400; 
    compPanelObj = createCSS3DPanel('competences', 1400, 600, finalPos, finalRot, compScale);

    // 3. Mise à jour dynamique de la caméra avec calcul trigonométrique pour être parfaitement en face
    const distance = 0.5; // Distance équilibrée (50 cm)
    const camX = targetX + Math.sin(0.37) * distance;
    const camY = targetY;
    const camZ = targetZ + Math.cos(0.37) * distance;

    VIEWS.wall.pos.set(camX, camY, camZ);
    VIEWS.wall.lookAt.copy(finalPos);

    // Lancer le calibrateur UI ! (Désactivé car calibrage terminé)
    // createCalibrator();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    
    // Rendre la caméra vraiment responsive sur téléphone !
    // Si l'écran est en portrait (largeur < hauteur), on élargit le champ de vision
    // pour éviter que les éléments 3D ne soient coupés sur les côtés.
    if (camera.aspect < 1) {
        camera.fov = 60 + (1 - camera.aspect) * 45;
    } else {
        camera.fov = 60; // Valeur par défaut pour PC
    }
    
    camera.updateProjectionMatrix();
    rendererWebGL.setSize(window.innerWidth, window.innerHeight);
    rendererCSS.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    parallaxTarget.x = mouse.x;
    parallaxTarget.y = mouse.y;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects);
    
    if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'default';
    }
}

function onClick(event) {
    if (!event.isTrusted) return; // Prevent programmatic clicks from triggering raycaster loops

    if(currentTarget !== 'global') {
        // Fallback for CSS3D hit-testing bugs when zoomed in:
        // Manually check if the click falls within the bounding box of ANY interactive element
        const interactables = Array.from(document.querySelectorAll('a, button, input, textarea')).reverse();
        const idToView = { 'hero': 'pc', 'competences': 'wall', 'projets': 'tablet', 'contact': 'phone' };
        
        let handled = false;
        interactables.forEach(el => {
            if (handled) return;
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                if (event.clientX >= rect.left && event.clientX <= rect.right && 
                    event.clientY >= rect.top && event.clientY <= rect.bottom) {
                    
                    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                        el.focus();
                        handled = true;
                    } else if (el.tagName === 'A') {
                        const href = el.getAttribute('href');
                        if (href && href.startsWith('#')) {
                            const viewId = idToView[href.substring(1)];
                            if (viewId) goToView(viewId);
                        } else if (href) {
                            window.open(href, el.getAttribute('target') || '_self');
                        }
                        handled = true;
                    } else if (el.tagName === 'BUTTON') {
                        el.click();
                        handled = true;
                    }
                }
            }
        });
        
        if (handled) return; // Stop here ONLY if we successfully clicked an HTML element
        // If no HTML element was clicked, we let the raycaster below check for 3D objects!
    }

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects);
    
    if (intersects.length > 0) {
        const viewId = intersects[0].object.userData.view;
        if(viewId) goToView(viewId);
    }
}

// --- GESTION MANUELLE DU SCROLL (CONTOURNEMENT DES BUGS NAVIGATEURS 3D) ---
function onWheel(event) {
    if (currentTarget === 'global') return;
    
    let panelId = null;
    if (currentTarget === 'phone') panelId = 'contact';
    else if (currentTarget === 'tablet') panelId = 'projets';
    else if (currentTarget === 'pc') panelId = 'hero';
    
    if (panelId) {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.scrollTop += event.deltaY;
        }
    }
}

let touchStartY = 0;
function onTouchStart(event) {
    if (event.touches.length > 0) {
        touchStartY = event.touches[0].clientY;
    }
}

function onTouchMove(event) {
    if (currentTarget === 'global') return;
    
    if (event.touches.length > 0) {
        const touchY = event.touches[0].clientY;
        const deltaY = touchStartY - touchY;
        touchStartY = touchY;
        
        let panelId = null;
        if (currentTarget === 'phone') panelId = 'contact';
        else if (currentTarget === 'tablet') panelId = 'projets';
        else if (currentTarget === 'pc') panelId = 'hero';
        
        if (panelId) {
            const panel = document.getElementById(panelId);
            if (panel) {
                panel.scrollTop += deltaY;
            }
        }
    }
}
// -------------------------------------------------------------------------

function goToView(viewId) {
    const target = VIEWS[viewId];
    if(!target) return;

    currentTarget = viewId;

    const btn = document.getElementById('btn-back');
    if(viewId === 'global') {
        btn.classList.add('opacity-0', 'pointer-events-none');
        btn.classList.remove('opacity-100', 'pointer-events-auto');
    } else {
        btn.classList.remove('opacity-0', 'pointer-events-none');
        btn.classList.add('opacity-100', 'pointer-events-auto');
    }

    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(camera.userData.targetObj);
    gsap.to(camera.position, {
        x: target.pos.x,
        y: target.pos.y,
        z: target.pos.z,
        duration: 1.5,
        ease: "power3.inOut"
    });
    revealPanel(viewId);

    gsap.to(camera.userData.targetObj, {
        x: target.lookAt.x,
        y: target.lookAt.y,
        z: target.lookAt.z,
        duration: 1.5,
        ease: "power3.inOut",
        onUpdate: () => {
            camera.lookAt(camera.userData.targetObj);
        }
    });
}

// Animation d'entrée du contenu d'un panneau quand la caméra arrive dessus
function revealPanel(viewId) {
    if (REDUCED_MOTION) return;
    const sel = {
        pc: ['#hero h1 span, #hero p, #hero .flex.space-x-4 a, #hero .test', 0.08],
        tablet: ['#projets h2, #projets > div > p, #projets .group', 0.12],
        phone: ['#contact a.flex, #contact form > *', 0.07],
        wall: ['#competences .chart-container', 0.1]
    }[viewId];
    if (!sel) return;
    const els = document.querySelectorAll(sel[0]);
    gsap.killTweensOf(els);
    gsap.fromTo(els,
        { opacity: 0, y: 30, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: sel[1], delay: 1.0, ease: "power3.out", clearProps: "transform,opacity" }
    );
}

// Vol d'entrée de la caméra + respiration de la lumière de l'écran
function introFlyIn() {
    if (REDUCED_MOTION) { introDone = true; return; }
    const end = { pos: VIEWS.global.pos.clone() };
    camera.position.set(end.pos.x + 2.5, end.pos.y + 1.2, end.pos.z + 3);
    gsap.to(camera.position, {
        x: end.pos.x, y: end.pos.y, z: end.pos.z,
        duration: 3, ease: "power3.out",
        onUpdate: () => camera.lookAt(camera.userData.targetObj),
        onComplete: () => { introDone = true; }
    });
    // Respiration de la lumière de l'écran PC
    if (pcGlowLight) {
        gsap.to(pcGlowLight, { intensity: 2.2, duration: 1.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    const idToView = {
        'hero': 'pc',
        'competences': 'wall',
        'projets': 'tablet',
        'contact': 'phone'
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href').substring(1);
            const viewId = idToView[href];
            if (viewId) {
                goToView(viewId);
                const mobileMenu = document.getElementById("mobile-menu");
                const menuToggle = document.getElementById("menu-toggle");
                if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
                    mobileMenu.classList.add("hidden");
                    if (menuToggle) menuToggle.innerHTML = '<i class="ri-menu-line ri-lg"></i>';
                }
            }
        });
    });
}

function animate() {
    requestAnimationFrame(animate);

    if(currentTarget === 'global' && introDone && !gsap.isTweening(camera.position)) {
        const t = Date.now() * 0.001;
        // Parallaxe douce vers la souris
        parallax.x += (parallaxTarget.x - parallax.x) * 0.04;
        parallax.y += (parallaxTarget.y - parallax.y) * 0.04;
        const k = REDUCED_MOTION ? 0 : 1;
        camera.position.x = VIEWS.global.pos.x + parallax.x * 0.25 * k;
        camera.position.z = VIEWS.global.pos.z + Math.sin(t * 0.5) * 0.05 * k;
        camera.position.y = VIEWS.global.pos.y + Math.cos(t * 0.3) * 0.02 * k + parallax.y * 0.1 * k;
        camera.lookAt(camera.userData.targetObj);
    }

    // Médailles : lévitation + légère oscillation
    if (!REDUCED_MOTION && medalObjs.length) {
        const t = Date.now() * 0.001;
        medalObjs.forEach(m => {
            m.obj.position.y = m.baseY + Math.sin(t * 1.2 + m.phase) * 0.012;
            m.obj.rotation.x = Math.sin(t * 0.8 + m.phase) * 0.08;
        });
    }

    rendererWebGL.render(sceneWebGL, camera);
    rendererCSS.render(sceneCSS, camera);
}

document.addEventListener('DOMContentLoaded', init3D);

// --- OUTIL DE CALIBRAGE EN TEMPS RÉEL ---
function createCalibrator() {
    if (document.getElementById('calibrator-ui')) return;

    const div = document.createElement('div');
    div.id = 'calibrator-ui';
    div.style.position = 'fixed';
    div.style.bottom = '20px';
    div.style.right = '20px';
    div.style.background = 'rgba(0,0,0,0.85)';
    div.style.color = 'white';
    div.style.padding = '15px';
    div.style.borderRadius = '10px';
    div.style.zIndex = '99999'; // Très haut pour passer au-dessus de tout
    div.style.fontFamily = 'monospace';
    div.style.fontSize = '14px';
    div.style.border = '1px solid #4ade80';
    div.style.pointerEvents = 'auto'; // Important pour pouvoir cliquer
    
    div.innerHTML = `
        <h4 style="margin-top:0; color:#4ade80; text-align:center;">Calibreur 3D</h4>
        <p style="font-size:11px; margin-bottom:10px; opacity:0.8;">Déplacez le graphique des compétences :</p>
        <div style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
            <b>X (Mur)</b>
            <div>
                <button onclick="moveComp('x', -0.05)" style="color:black; padding:2px 8px; cursor:pointer;">-</button>
                <span id="calib-x" style="display:inline-block; width:50px; text-align:center;">${compPanelObj.position.x.toFixed(2)}</span>
                <button onclick="moveComp('x', 0.05)" style="color:black; padding:2px 8px; cursor:pointer;">+</button>
            </div>
        </div>
        <div style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
            <b>Y (Haut)</b>
            <div>
                <button onclick="moveComp('y', -0.05)" style="color:black; padding:2px 8px; cursor:pointer;">-</button>
                <span id="calib-y" style="display:inline-block; width:50px; text-align:center;">${compPanelObj.position.y.toFixed(2)}</span>
                <button onclick="moveComp('y', 0.05)" style="color:black; padding:2px 8px; cursor:pointer;">+</button>
            </div>
        </div>
        <div style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
            <b>Z (Prof)</b>
            <div>
                <button onclick="moveComp('z', -0.05)" style="color:black; padding:2px 8px; cursor:pointer;">-</button>
                <span id="calib-z" style="display:inline-block; width:50px; text-align:center;">${compPanelObj.position.z.toFixed(2)}</span>
                <button onclick="moveComp('z', 0.05)" style="color:black; padding:2px 8px; cursor:pointer;">+</button>
            </div>
        </div>
        <hr style="border-color:#4ade80; opacity:0.5; margin:10px 0;">
        <div style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
            <b>Rot Y (Pivot)</b>
            <div>
                <button onclick="rotateComp('y', -0.05)" style="color:black; padding:2px 8px; cursor:pointer;">-</button>
                <span id="calib-ry" style="display:inline-block; width:50px; text-align:center;">${compPanelObj.rotation.y.toFixed(2)}</span>
                <button onclick="rotateComp('y', 0.05)" style="color:black; padding:2px 8px; cursor:pointer;">+</button>
            </div>
        </div>
        <div style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
            <b>Rot X (Inclin.)</b>
            <div>
                <button onclick="rotateComp('x', -0.05)" style="color:black; padding:2px 8px; cursor:pointer;">-</button>
                <span id="calib-rx" style="display:inline-block; width:50px; text-align:center;">${compPanelObj.rotation.x.toFixed(2)}</span>
                <button onclick="rotateComp('x', 0.05)" style="color:black; padding:2px 8px; cursor:pointer;">+</button>
            </div>
        </div>
        <div style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
            <b>Rot Z (Roulis)</b>
            <div>
                <button onclick="rotateComp('z', -0.05)" style="color:black; padding:2px 8px; cursor:pointer;">-</button>
                <span id="calib-rz" style="display:inline-block; width:50px; text-align:center;">${compPanelObj.rotation.z.toFixed(2)}</span>
                <button onclick="rotateComp('z', 0.05)" style="color:black; padding:2px 8px; cursor:pointer;">+</button>
            </div>
        </div>
        <p style="margin-bottom:0; margin-top:15px; font-size:12px; color:#fbbf24; text-align:center;"><b>Notez ces valeurs !</b></p>
    `;
    
    document.body.appendChild(div);
}

window.moveComp = function(axis, delta) {
    if(!compPanelObj || !compHitZone) return;
    
    compPanelObj.position[axis] += delta;
    compHitZone.position[axis] += delta;
    
    // Mettre à jour la caméra pour que le clic "Compétences" continue de le viser !
    if (axis === 'y') {
        VIEWS.wall.pos.y += delta;
        VIEWS.wall.lookAt.y += delta;
    } else if (axis === 'z') {
        VIEWS.wall.pos.z += delta;
        VIEWS.wall.lookAt.z += delta;
    } else if (axis === 'x') {
        VIEWS.wall.pos.x += delta;
        VIEWS.wall.lookAt.x += delta;
    }
    
    document.getElementById('calib-x').innerText = compPanelObj.position.x.toFixed(2);
    document.getElementById('calib-y').innerText = compPanelObj.position.y.toFixed(2);
    document.getElementById('calib-z').innerText = compPanelObj.position.z.toFixed(2);
};

window.rotateComp = function(axis, delta) {
    if(!compPanelObj || !compHitZone) return;
    
    compPanelObj.rotation[axis] += delta;
    compHitZone.rotation[axis] += delta;
    
    document.getElementById('calib-rx').innerText = compPanelObj.rotation.x.toFixed(2);
    document.getElementById('calib-ry').innerText = compPanelObj.rotation.y.toFixed(2);
    document.getElementById('calib-rz').innerText = compPanelObj.rotation.z.toFixed(2);
};

// --- AJOUT : FONCTIONNALITÉ DE ZOOM MANUEL ---

// 1. Zoom avec la molette de la souris (PC)
window.addEventListener('wheel', (event) => {
    // On ignore le zoom manuel si une animation de déplacement est en cours
    if (gsap.isTweening(camera.position)) return;

    // Vitesse du zoom
    const zoomSpeed = 0.0015;
    const distance = event.deltaY * zoomSpeed;

    // translateZ avance ou recule la caméra exactement là où elle regarde !
    camera.translateZ(distance);
}, { passive: true });

// 2. Pinch-to-Zoom pour les écrans tactiles (Téléphone/Tablette)
let initialPinchDistance = null;

window.addEventListener('touchstart', (event) => {
    // S'il y a 2 doigts sur l'écran
    if (event.touches.length === 2) {
        initialPinchDistance = Math.hypot(
            event.touches[0].clientX - event.touches[1].clientX,
            event.touches[0].clientY - event.touches[1].clientY
        );
    }
}, { passive: false });

window.addEventListener('touchmove', (event) => {
    if (event.touches.length === 2 && initialPinchDistance !== null) {
        // Bloquer le zoom natif de la page web pour utiliser notre zoom 3D
        if (event.cancelable) event.preventDefault();
        
        const currentDistance = Math.hypot(
            event.touches[0].clientX - event.touches[1].clientX,
            event.touches[0].clientY - event.touches[1].clientY
        );
        
        // Si les doigts s'écartent, delta est négatif (on avance/zoom in)
        // S'ils se rapprochent, delta est positif (on recule/zoom out)
        const delta = initialPinchDistance - currentDistance;
        initialPinchDistance = currentDistance; // Reset pour le prochain mouvement
        
        if (gsap.isTweening(camera.position)) return;
        
        camera.translateZ(delta * 0.005);
    }
}, { passive: false });

window.addEventListener('touchend', (event) => {
    if (event.touches.length < 2) {
        initialPinchDistance = null;
    }
});
