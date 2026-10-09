/* VansCode - interactions et animations de la page principale */
(function () {
    'use strict';

    const root = document.documentElement;
    const $ = (s, ctx = document) => ctx.querySelector(s);
    const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

    const hasGsap = typeof window.gsap !== 'undefined';
    const hasST = hasGsap && typeof window.ScrollTrigger !== 'undefined';
    const hasFlip = hasGsap && typeof window.Flip !== 'undefined';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Si GSAP/ScrollTrigger n'a pas chargé, on n'affiche jamais une page vide
    if (!hasST) root.classList.remove('anim');
    const animate = root.classList.contains('anim');

    if (hasST) gsap.registerPlugin(ScrollTrigger);
    if (hasFlip) gsap.registerPlugin(Flip);

    /* ---------- Thème ---------- */
    $('#theme-toggle').addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('vc-theme', next); } catch (e) { /* stockage indisponible */ }
        if (animate) gsap.fromTo('#theme-toggle i', { rotate: -90, scale: 0.5 }, { rotate: 0, scale: 1, duration: 0.5, ease: 'back.out(2)' });
    });

    $('#year').textContent = new Date().getFullYear();

    /* ---------- Menu mobile ---------- */
    const menuBtn = $('#menu-toggle');
    const menu = $('#mobile-menu');
    function setMenu(open) {
        menu.hidden = !open;
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
        menuBtn.innerHTML = open ? '<i class="ri-close-line" aria-hidden="true"></i>' : '<i class="ri-menu-line" aria-hidden="true"></i>';
        if (open && animate) gsap.from($$('a', menu), { y: -10, opacity: 0, stagger: 0.04, duration: 0.35, ease: 'power2.out' });
    }
    menuBtn.addEventListener('click', () => setMenu(menu.hidden));
    $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });

    /* ---------- Lien actif dans la nav ---------- */
    const navLinks = $$('.nav__links a');
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(s => sectionObserver.observe(s));

    /* ---------- Halo qui suit la souris ---------- */
    if (finePointer && !reduceMotion) {
        const glow = $('.bg-glow');
        let raf = 0, mx = 0, my = 0;
        window.addEventListener('pointermove', e => {
            mx = e.clientX; my = e.clientY;
            if (raf) return;
            raf = requestAnimationFrame(() => {
                glow.style.setProperty('--mx', mx + 'px');
                glow.style.setProperty('--my', my + 'px');
                raf = 0;
            });
        }, { passive: true });
    }

    /* ---------- Mot qui change dans le titre ---------- */
    const roles = ['applications web', 'API robustes', 'bots intelligents', 'interfaces fluides'];
    const rotWord = $('.rotator__word');
    let roleIndex = 0;
    let rotatorTimer = null;
    function nextRole() {
        roleIndex = (roleIndex + 1) % roles.length;
        if (!animate) { rotWord.textContent = roles[roleIndex]; return; }
        gsap.timeline()
            .to(rotWord, { yPercent: -110, opacity: 0, duration: 0.45, ease: 'power3.in' })
            .add(() => { rotWord.textContent = roles[roleIndex]; })
            .fromTo(rotWord, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
    }
    function startRotator() { if (!rotatorTimer) rotatorTimer = setInterval(nextRole, 2800); }
    function stopRotator() { clearInterval(rotatorTimer); rotatorTimer = null; }
    // Pas d'animation inutile quand l'onglet est caché
    document.addEventListener('visibilitychange', () => (document.hidden ? stopRotator() : startRotator()));

    /* ---------- Copie de l'email + toast ---------- */
    const toast = $('#toast');
    let toastTimer = null;
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
    }
    $('#copy-email').addEventListener('click', async e => {
        const btn = e.currentTarget;
        try {
            await navigator.clipboard.writeText(btn.dataset.email);
            showToast('Adresse email copiée');
            btn.innerHTML = '<i class="ri-check-line" aria-hidden="true"></i>';
            setTimeout(() => { btn.innerHTML = '<i class="ri-file-copy-line" aria-hidden="true"></i>'; }, 1800);
        } catch (err) {
            showToast('Copie impossible, utilisez le lien email');
        }
    });

    /* ---------- Filtres des projets (réorganisation animée avec Flip) ---------- */
    const chips = $$('.chip');
    const projects = $$('.project');
    chips.forEach(chip => chip.addEventListener('click', () => {
        const f = chip.dataset.filter;
        chips.forEach(c => {
            const on = c === chip;
            c.classList.toggle('is-active', on);
            c.setAttribute('aria-pressed', String(on));
        });
        const state = hasFlip && animate ? Flip.getState(projects) : null;
        projects.forEach(p => p.classList.toggle('is-hidden', f !== 'all' && p.dataset.cat !== f));
        if (state) {
            Flip.from(state, {
                duration: 0.6, ease: 'power3.inOut', absolute: true, stagger: 0.04,
                onEnter: els => gsap.fromTo(els, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5 }),
                onLeave: els => gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.3 }),
                onComplete: () => hasST && ScrollTrigger.refresh()
            });
        }
    }));

    /* ---------- Cartes projet : bordure lumineuse + inclinaison ---------- */
    if (finePointer) {
        projects.forEach(card => {
            card.addEventListener('pointermove', e => {
                const r = card.getBoundingClientRect();
                const x = e.clientX - r.left, y = e.clientY - r.top;
                card.style.setProperty('--px', x + 'px');
                card.style.setProperty('--py', y + 'px');
                if (animate) {
                    gsap.to(card, {
                        rotateY: ((x / r.width) - 0.5) * 8,
                        rotateX: -((y / r.height) - 0.5) * 8,
                        transformPerspective: 900, duration: 0.4, ease: 'power2.out'
                    });
                }
            });
            card.addEventListener('pointerleave', () => {
                if (animate) gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'elastic.out(1, 0.6)' });
            });
        });
    }

    /* ---------- Boutons magnétiques ---------- */
    if (finePointer && animate) {
        $$('.magnetic').forEach(btn => {
            btn.addEventListener('pointermove', e => {
                const r = btn.getBoundingClientRect();
                gsap.to(btn, {
                    x: (e.clientX - r.left - r.width / 2) * 0.25,
                    y: (e.clientY - r.top - r.height / 2) * 0.35,
                    duration: 0.4, ease: 'power3.out'
                });
            });
            btn.addEventListener('pointerleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' }));
        });
    }

    /* ---------- Activité GitHub en direct ---------- */
    const LANG_COLORS = { JavaScript: '#f1e05a', TypeScript: '#3178c6', HTML: '#e34c26', CSS: '#663399', Python: '#3572a5' };
    const ghList = $('#gh-list');

    function timeAgo(dateStr) {
        const days = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
        if (days < 1) return "aujourd'hui";
        if (days < 30) return 'il y a ' + days + ' j';
        const months = Math.floor(days / 30);
        if (months < 12) return 'il y a ' + months + ' mois';
        const years = Math.floor(months / 12);
        return 'il y a ' + years + (years > 1 ? ' ans' : ' an');
    }

    function renderRepos(repos) {
        ghList.innerHTML = '';
        repos.forEach(r => {
            const li = document.createElement('li');
            li.className = 'gh__item';
            const a = document.createElement('a');
            a.href = r.html_url; a.target = '_blank'; a.rel = 'noopener noreferrer';
            const name = document.createElement('span');
            name.className = 'gh__name'; name.textContent = r.name;
            const meta = document.createElement('span');
            meta.className = 'gh__meta';
            if (r.language) {
                const lang = document.createElement('span');
                lang.className = 'gh__lang'; lang.textContent = r.language;
                lang.style.setProperty('--lang', LANG_COLORS[r.language] || 'var(--muted)');
                meta.appendChild(lang);
            }
            const date = document.createElement('span');
            date.textContent = 'Mis à jour ' + timeAgo(r.pushed_at);
            meta.appendChild(date);
            a.append(name, meta);
            li.appendChild(a);
            ghList.appendChild(li);
        });
        ghList.setAttribute('aria-busy', 'false');
        if (animate) gsap.from(ghList.children, { y: 16, opacity: 0, stagger: 0.06, duration: 0.5, ease: 'power2.out' });
    }

    function renderGhError() {
        ghList.setAttribute('aria-busy', 'false');
        ghList.innerHTML = '<li class="gh__error">Impossible de charger les dépôts pour le moment. Consultez directement <a class="link" href="https://github.com/vanscode-CM" target="_blank" rel="noopener noreferrer">mon profil GitHub</a>.</li>';
    }

    function updateRepoCount(count) {
        const el = $('#repo-count');
        el.dataset.to = count;
        if (!animate || el.dataset.done) el.textContent = count;
    }

    async function loadGithub() {
        const CACHE_KEY = 'vc-gh-repos';
        let repos = null;
        try {
            const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
            if (cached && Date.now() - cached.t < 30 * 60 * 1000) repos = cached.data;
        } catch (e) { /* cache indisponible */ }

        if (!repos) {
            const res = await fetch('https://api.github.com/users/vanscode-CM/repos?per_page=100&sort=pushed');
            if (!res.ok) throw new Error('GitHub ' + res.status);
            const all = await res.json();
            repos = all
                .filter(r => !r.fork)
                .map(r => ({ name: r.name, html_url: r.html_url, language: r.language, pushed_at: r.pushed_at }));
            try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: repos })); } catch (e) { /* ignore */ }
        }
        updateRepoCount(repos.length);
        renderRepos(repos.slice(0, 6));
    }

    // On ne charge GitHub que lorsque la section approche de l'écran
    const ghObserver = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        ghObserver.disconnect();
        loadGithub().catch(renderGhError);
    }, { rootMargin: '400px' });
    ghObserver.observe(ghList);

    // Nombre de technologies = logos réellement listés dans la stack
    const techCount = $$('.techs li').length;
    $('#tech-count').dataset.to = techCount;
    $('#tech-count').textContent = techCount;

    /* ---------- Formulaire de contact (Web3Forms) ---------- */
    const form = $('#contact-form');
    const status = $('#form-status');
    const submitBtn = $('#submit-btn');
    const rules = {
        name: v => v.trim().length >= 2 || 'Indiquez votre nom.',
        email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Adresse email invalide.',
        message: v => v.trim().length >= 10 || 'Votre message doit faire au moins 10 caractères.'
    };

    function validateField(input) {
        const rule = rules[input.name];
        if (!rule) return true;
        const result = rule(input.value);
        const field = input.closest('.field');
        const err = $('.field__error', field);
        const ok = result === true;
        field.classList.toggle('has-error', !ok);
        input.setAttribute('aria-invalid', String(!ok));
        if (!ok) input.setAttribute('aria-describedby', err.id); else input.removeAttribute('aria-describedby');
        err.textContent = ok ? '' : result;
        if (!ok && animate) gsap.fromTo(field, { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
        return ok;
    }

    $$('input[name], textarea[name]', form).forEach(input => {
        if (!rules[input.name]) return;
        input.addEventListener('blur', () => { if (input.value) validateField(input); });
        input.addEventListener('input', () => { if (input.closest('.field').classList.contains('has-error')) validateField(input); });
    });

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const inputs = $$('input[name="name"], input[name="email"], textarea[name="message"]', form);
        const valid = inputs.map(validateField).every(Boolean);
        if (!valid) { inputs.find(i => i.getAttribute('aria-invalid') === 'true').focus(); return; }

        const label = $('.btn__label', submitBtn);
        const icon = $('i', submitBtn);
        submitBtn.disabled = true;
        label.textContent = 'Envoi en cours';
        icon.className = 'ri-loader-4-line spin';
        status.className = 'form__status';
        status.textContent = '';

        try {
            const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(form) });
            const json = await res.json().catch(() => ({}));
            if (!res.ok || json.success === false) throw new Error(json.message || 'Erreur');
            status.classList.add('is-ok');
            status.textContent = 'Merci, votre message est bien parti. Je vous réponds très vite.';
            form.reset();
            if (animate) gsap.fromTo(submitBtn, { scale: 0.95 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
        } catch (err) {
            status.classList.add('is-err');
            status.textContent = "L'envoi a échoué. Réessayez ou écrivez-moi directement par email.";
        } finally {
            submitBtn.disabled = false;
            label.textContent = 'Envoyer le message';
            icon.className = 'ri-send-plane-2-line';
        }
    });

    /* ======================================================================
       Animations (uniquement si GSAP est chargé et le mouvement autorisé)
       ====================================================================== */
    if (!animate) { startRotator(); return; }

    // Barre de progression de lecture
    gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

    // La nav se cache en descendant, réapparaît en remontant
    const nav = $('#nav');
    ScrollTrigger.create({
        start: 120, end: 'max',
        onUpdate: self => nav.classList.toggle('is-hidden', self.direction === 1 && menu.hidden),
        onLeaveBack: () => nav.classList.remove('is-hidden')
    });

    // Entrée du hero
    gsap.timeline({ defaults: { ease: 'power4.out' }, onComplete: startRotator })
        .to('.hero-word', { y: 0, duration: 1, stagger: 0.06 }, 0.1)
        .fromTo('.rotator__word', { yPercent: 110 }, { yPercent: 0, duration: 1 }, 0.3)
        .to('.hero-in', { opacity: 1, duration: 0.8, stagger: 0.12 }, 0.5)
        .fromTo('.hero-in', { y: 20 }, { y: 0, duration: 0.8, stagger: 0.12 }, 0.5)
        .fromTo('.portrait', { opacity: 0, scale: 0.85, rotate: -6 }, { opacity: 1, scale: 1, rotate: 0, duration: 1.4, ease: 'expo.out' }, 0.3)
        .from('.orbit li', { scale: 0, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'back.out(2)' }, 0.9);

    // Parallaxe douce du portrait au défilement
    gsap.to('.portrait', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // Texte "À propos" qui s'illumine mot par mot en défilant
    const statement = $('[data-words]');
    statement.innerHTML = statement.textContent.trim().split(/\s+/).map(w => '<span class="w">' + w + '</span>').join(' ');
    gsap.fromTo('.about__statement .w', { opacity: 0.18 }, {
        opacity: 1, stagger: 0.05, ease: 'none',
        scrollTrigger: { trigger: statement, start: 'top 80%', end: 'bottom 45%', scrub: true }
    });

    // Apparition des blocs au défilement, par lots
    ScrollTrigger.batch('[data-reveal]', {
        start: 'top 88%',
        once: true,
        onEnter: batch => gsap.fromTo(batch, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', clearProps: 'transform' })
    });

    // Logos de la stack qui "poppent" quand la cellule entre à l'écran
    $$('.bento__cell').forEach(cell => {
        gsap.from($$('.techs li', cell), {
            scale: 0.6, opacity: 0, duration: 0.5, stagger: 0.05, ease: 'back.out(2)',
            scrollTrigger: { trigger: cell, start: 'top 80%', once: true }
        });
    });

    // Compteurs animés
    $$('.counter').forEach(el => {
        const obj = { v: 0 };
        ScrollTrigger.create({
            trigger: el, start: 'top 90%', once: true,
            onEnter: () => gsap.to(obj, {
                v: () => Number(el.dataset.to), duration: 1.6, ease: 'power2.out',
                onUpdate: () => { el.textContent = Math.round(obj.v); },
                onComplete: () => { el.dataset.done = '1'; el.textContent = el.dataset.to; }
            })
        });
    });

    // Ligne de la méthode qui se dessine en défilant
    gsap.fromTo('.steps__line line', { strokeDashoffset: 1000 }, {
        strokeDashoffset: 0, ease: 'none',
        scrollTrigger: { trigger: '.steps', start: 'top 75%', end: 'bottom 60%', scrub: true }
    });
    gsap.from('.step__icon', {
        scale: 0, rotate: -90, duration: 0.6, stagger: 0.15, ease: 'back.out(2)',
        scrollTrigger: { trigger: '.steps', start: 'top 75%', once: true }
    });
})();
