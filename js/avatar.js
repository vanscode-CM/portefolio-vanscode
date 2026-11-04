// Avatar de VansCode (sweat noir à oreilles de chat, comme sur la photo de profil) + son chat noir.
// Personnage articulé : chaque articulation est un Group dont on anime la rotation avec GSAP.
// Repère du personnage : origine = bassin, regard vers +z, bras qui pendent vers -y.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const COL = { skin: '#5b3a29', hood: '#17181d', hood2: '#25272f', pants: '#121318', string: '#e9e9e9', mouth: '#2a1712' };

const mat = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 });
const rb = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, 3, r);

function part(geo, m, x, y, z, parent) {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
}
function joint(parent, x, y, z) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
}

// Poses : rotations [x, y, z] par articulation (absentes = 0)
const LEGS_SIT = { lHip: [-1.5, 0, 0.05], rHip: [-1.5, 0, -0.05], lKnee: [1.45, 0, 0], rKnee: [1.45, 0, 0] };
export const POSES = {
    stand: { lSh: [0, 0, 0.1], rSh: [0, 0, -0.1], lEl: [-0.15, 0, 0], rEl: [-0.15, 0, 0] },
    sit: { ...LEGS_SIT, spine: [0.05, 0, 0], lSh: [-0.5, 0, 0.1], rSh: [-0.5, 0, -0.1], lEl: [-0.7, 0, 0], rEl: [-0.7, 0, 0] },
    phone: { ...LEGS_SIT, spine: [0.15, 0, 0], head: [0.45, 0, 0], lSh: [-0.7, 0, 0.3], rSh: [-0.7, 0, -0.3], lEl: [-1.45, 0, 0], rEl: [-1.45, 0, 0] },
    type: { ...LEGS_SIT, spine: [0.12, 0, 0], head: [0.2, 0, 0], lSh: [-0.95, 0, 0.12], rSh: [-0.95, 0, -0.12], lEl: [-0.35, 0, 0], rEl: [-0.35, 0, 0] },
    sleepDesk: { ...LEGS_SIT, spine: [0.85, 0, 0], head: [0.35, 0, 0.3], lSh: [-1.6, 0, 0.35], rSh: [-1.6, 0, -0.35], lEl: [-1.3, 0, 0], rEl: [-1.3, 0, 0] },
    angrySit: { ...LEGS_SIT, spine: [-0.1, 0, 0], head: [-0.2, 0, 0], lSh: [-0.3, 0, 2.5], rSh: [-0.3, 0, -2.5], lEl: [-0.9, 0, 0], rEl: [-0.9, 0, 0] },
    angry: { spine: [-0.1, 0, 0], head: [-0.2, 0, 0], lSh: [-0.3, 0, 2.5], rSh: [-0.3, 0, -2.5], lEl: [-0.9, 0, 0], rEl: [-0.9, 0, 0] },
    facepalm: { ...LEGS_SIT, spine: [0.3, 0, 0], head: [0.35, 0, 0], rSh: [-2.2, 0, -0.35], rEl: [-2.0, 0, 0], lSh: [-0.5, 0, 0.1], lEl: [-0.7, 0, 0] },
    sad: { ...LEGS_SIT, spine: [0.45, 0, 0], head: [0.5, 0, 0], lSh: [-0.4, 0, 0.05], rSh: [-0.4, 0, -0.05], lEl: [-0.9, 0, 0], rEl: [-0.9, 0, 0] },
    fistSit: { ...LEGS_SIT, spine: [-0.05, 0, 0], head: [-0.15, 0, 0], rSh: [-0.2, 0, -2.7], rEl: [-1.2, 0, 0], lSh: [-0.5, 0, 0.1], lEl: [-0.7, 0, 0] },
    lie: { head: [-0.15, 0, 0], lSh: [-0.5, 0, 0.15], rSh: [-0.5, 0, -0.15], lEl: [-1.6, 0, 0], rEl: [-1.6, 0, 0] },
    stretch: { ...LEGS_SIT, spine: [-0.15, 0, 0], head: [-0.35, 0, 0], lSh: [0, 0, 2.95], rSh: [0, 0, -2.95], lEl: [0, 0, 0], rEl: [0, 0, 0] },
    crouch: { spine: [0.2, 0, 0], lHip: [-1.0, 0, 0.05], rHip: [-1.0, 0, -0.05], lKnee: [1.6, 0, 0], rKnee: [1.6, 0, 0], lSh: [-0.3, 0, 0.6], rSh: [-0.3, 0, -0.6], lEl: [-0.4, 0, 0], rEl: [-0.4, 0, 0] },
    joy: { head: [-0.2, 0, 0], lSh: [0, 0, 2.55], rSh: [0, 0, -2.55], lEl: [-0.15, 0, 0], rEl: [-0.15, 0, 0] },
    shock: { head: [-0.15, 0, 0], spine: [-0.12, 0, 0], lSh: [0, 0, 1.2], rSh: [0, 0, -1.2], lEl: [-1.5, 0, 0], rEl: [-1.5, 0, 0] },
    wave: { lSh: [0, 0, 0.1], lEl: [-0.15, 0, 0], rSh: [0, 0, -2.6], rEl: [-0.4, 0, 0] },
    point: { head: [-0.25, 0, 0], lSh: [0, 0, 0.1], lEl: [-0.15, 0, 0], rSh: [-2.3, 0, -0.5], rEl: [-0.1, 0, 0] },
    scan: { spine: [-0.05, 0, 0], head: [-0.1, 0, 0], rSh: [-1.6, 0, -0.1], rEl: [-0.5, 0, 0], lSh: [0, 0, 0.1], lEl: [-0.15, 0, 0] },
    walkA: { lHip: [-0.45, 0, 0], rHip: [0.4, 0, 0], lKnee: [0.3, 0, 0], rKnee: [0.5, 0, 0], lSh: [0.4, 0, 0.1], rSh: [-0.4, 0, -0.1], lEl: [-0.3, 0, 0], rEl: [-0.3, 0, 0] },
    walkB: { lHip: [0.4, 0, 0], rHip: [-0.45, 0, 0], lKnee: [0.5, 0, 0], rKnee: [0.3, 0, 0], lSh: [-0.4, 0, 0.1], rSh: [0.4, 0, -0.1], lEl: [-0.3, 0, 0], rEl: [-0.3, 0, 0] },
    danceA: { spine: [0, 0, 0.2], head: [0, 0, -0.2], lSh: [0, 0, 2.4], rSh: [-0.4, 0, -0.5], lEl: [-0.6, 0, 0], rEl: [-1.4, 0, 0], lHip: [-0.3, 0, 0], lKnee: [0.6, 0, 0] },
    danceB: { spine: [0, 0, -0.2], head: [0, 0, 0.2], lSh: [-0.4, 0, 0.5], rSh: [0, 0, -2.4], lEl: [-1.4, 0, 0], rEl: [-0.6, 0, 0], rHip: [-0.3, 0, 0], rKnee: [0.6, 0, 0] }
};

export function buildAvatar() {
    const m = { skin: mat(COL.skin), hood: mat(COL.hood), hood2: mat(COL.hood2), pants: mat(COL.pants), string: mat(COL.string), mouth: mat(COL.mouth) };
    const root = new THREE.Group();          // le bassin
    root.userData.key = 'me';

    part(rb(0.34, 0.18, 0.22, 0.07), m.pants, 0, 0, 0, root);
    const spine = joint(root, 0, 0.06, 0);
    part(rb(0.44, 0.5, 0.26, 0.1), m.hood, 0, 0.27, 0, spine);
    part(rb(0.3, 0.12, 0.02, 0.01), m.hood2, 0, 0.13, 0.13, spine);           // poche kangourou
    [-0.05, 0.05].forEach(x => {                                              // cordons blancs
        const c = part(new THREE.CylinderGeometry(0.007, 0.007, 0.16, 6), m.string, x, 0.38, 0.135, spine);
        c.castShadow = false;
    });

    const neck = joint(spine, 0, 0.52, 0);
    const head = joint(neck, 0, 0.02, 0);
    part(new THREE.SphereGeometry(0.135, 24, 18), m.skin, 0, 0.15, 0.015, head);
    part(new THREE.SphereGeometry(0.172, 24, 18), m.hood, 0, 0.17, -0.06, head);          // capuche
    const rim = part(new THREE.TorusGeometry(0.125, 0.032, 10, 28), m.hood, 0, 0.16, 0.085, head);
    rim.scale.set(1, 1.12, 1);
    [-1, 1].forEach(side => {                                                              // oreilles de chat
        const ear = part(new THREE.ConeGeometry(0.06, 0.12, 4), m.hood, side * 0.1, 0.34, -0.04, head);
        ear.rotation.set(0, Math.PI / 4, -side * 0.35);
    });
    // visage
    const eyes = [], pupils = [], brows = [];
    [-1, 1].forEach(side => {
        eyes.push(part(new THREE.SphereGeometry(0.022, 12, 10), mat('#f4f1ea'), side * 0.047, 0.17, 0.132, head));
        pupils.push(part(new THREE.SphereGeometry(0.012, 10, 8), mat('#111'), side * 0.047, 0.17, 0.152, head));
        brows.push(part(new THREE.BoxGeometry(0.05, 0.011, 0.01), mat('#1a0f0a'), side * 0.047, 0.205, 0.14, head));
    });
    const mouth = part(new THREE.TorusGeometry(0.03, 0.007, 6, 16, Math.PI), m.mouth, 0, 0.1, 0.143, head);
    mouth.rotation.z = Math.PI;

    const arm = side => {
        const sh = joint(spine, side * 0.26, 0.45, 0);
        part(rb(0.12, 0.32, 0.12, 0.05), m.hood, 0, -0.15, 0, sh);
        const el = joint(sh, 0, -0.3, 0);
        part(rb(0.11, 0.28, 0.11, 0.05), m.hood, 0, -0.13, 0, el);
        const hand = part(new THREE.SphereGeometry(0.05, 12, 10), m.skin, 0, -0.3, 0, el);
        return { sh, el, hand };
    };
    const leg = side => {
        const hip = joint(root, side * 0.1, -0.03, 0);
        part(rb(0.15, 0.42, 0.15, 0.06), m.pants, 0, -0.21, 0, hip);
        const knee = joint(hip, 0, -0.42, 0);
        part(rb(0.13, 0.4, 0.13, 0.05), m.pants, 0, -0.2, 0, knee);
        part(rb(0.1, 0.06, 0.2, 0.03), m.skin, 0, -0.42, 0.05, knee);              // pieds nus, comme sur la photo
        return { hip, knee };
    };
    const L = arm(1), R = arm(-1), LL = leg(1), RL = leg(-1);

    // point où l'avatar tient le téléphone, devant la poitrine
    const holdPoint = joint(spine, 0, 0.3, 0.3);

    const J = {
        spine, neck, head,
        lSh: L.sh, lEl: L.el, rSh: R.sh, rEl: R.el,
        lHip: LL.hip, lKnee: LL.knee, rHip: RL.hip, rKnee: RL.knee
    };

    // Tween vers une pose (toutes les articulations bougent ensemble)
    function pose(name, duration = 0.5, ease = 'power2.inOut') {
        const p = POSES[name] || {};
        const tl = gsap.timeline();
        Object.keys(J).forEach(k => {
            const [x, y, z] = p[k] || [0, 0, 0];
            tl.to(J[k].rotation, { x, y, z, duration, ease }, 0);
        });
        return tl;
    }
    function setPose(name) {
        const p = POSES[name] || {};
        Object.keys(J).forEach(k => { const [x, y, z] = p[k] || [0, 0, 0]; J[k].rotation.set(x, y, z); });
    }

    // Expressions du visage
    function face(name) {
        const angry = name === 'angry', sad = name === 'sad', sleep = name === 'sleep', shock = name === 'shock';
        brows[0].rotation.z = angry ? -0.45 : sad ? 0.4 : 0;
        brows[1].rotation.z = angry ? 0.45 : sad ? -0.4 : 0;
        brows.forEach(b => { b.position.y = angry ? 0.198 : shock ? 0.218 : 0.205; });
        eyes.concat(pupils).forEach(e => e.scale.set(1, sleep ? 0.15 : shock ? 1.35 : 1, 1));
        pupils.forEach(p => { p.visible = !sleep; });
        mouth.rotation.z = (angry || sad) ? 0 : Math.PI;        // ∩ = pas content, ∪ = sourire
        mouth.scale.set(shock ? 0.8 : name === 'neutral' ? 1 : 1, shock ? 1.6 : name === 'neutral' ? 0.35 : 1, 1);
        mouth.position.y = (angry || sad) ? 0.088 : 0.1;
    }
    face('neutral');

    function headWorld() {
        const v = new THREE.Vector3(0, 0.2, 0.02);
        head.updateWorldMatrix(true, false);
        return head.localToWorld(v);
    }
    function handWorld(side = -1) {
        const h = side < 0 ? R.hand : L.hand;
        h.updateWorldMatrix(true, false);
        return h.getWorldPosition(new THREE.Vector3());
    }

    root.traverse(o => { if (o.isMesh) o.receiveShadow = false; });
    return { root, J, pose, setPose, face, headWorld, handWorld, holdPoint };
}

/* ----------------------------------------------------------------- chat */
export function buildCat() {
    const black = mat('#0e0e12');
    const cat = new THREE.Group();
    cat.userData.key = 'cat';
    const body = part(new THREE.SphereGeometry(0.12, 18, 14), black, 0, 0.1, 0, cat);
    body.scale.set(0.95, 0.9, 1.35);
    const head = joint(cat, 0, 0.22, 0.13);
    part(new THREE.SphereGeometry(0.085, 18, 14), black, 0, 0, 0, head);
    [-1, 1].forEach(s => {
        const ear = part(new THREE.ConeGeometry(0.035, 0.07, 4), black, s * 0.05, 0.08, -0.01, head);
        ear.rotation.z = -s * 0.3;
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffd23f', toneMapped: false }));
        eye.position.set(s * 0.033, 0.01, 0.072); head.add(eye);
        const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.022, 0.004), new THREE.MeshBasicMaterial({ color: '#000' }));
        pupil.position.set(s * 0.033, 0.01, 0.087); head.add(pupil);
    });
    // patte avant + petite tache blanche (comme sur la photo)
    part(new THREE.SphereGeometry(0.03, 10, 8), mat('#e8e6e0'), 0, 0.12, 0.17, cat).scale.set(1, 1.4, 0.6);
    const tail = joint(cat, 0, 0.08, -0.15);
    const t = part(new THREE.CylinderGeometry(0.02, 0.014, 0.3, 8), black, 0, 0.14, 0, tail);
    t.castShadow = true;
    tail.rotation.x = -0.4;
    return { root: cat, head, tail };
}
