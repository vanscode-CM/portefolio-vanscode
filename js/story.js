// Contenu de l'histoire (FR / EN). Tous les faits viennent de VansCode lui-même.
// Les blagues sont des blagues ; les chiffres (3 000+ inscrits, 100+ actifs) sont réels.

export const CHAPTERS = [
    {
        id: 'c2020', year: '2020',
        title: { fr: 'Le déclic', en: 'The spark' },
        text: {
            fr: "Pas d'ordinateur, juste un téléphone, YouTube et la chaîne « Code avec Jonathan ». J'installe Pydroid, j'écris mes premières lignes de Python… et je découvre que l'indentation n'est pas une suggestion.",
            en: "No computer, just a phone, YouTube and the “Code avec Jonathan” channel. I install Pydroid, write my first lines of Python… and learn that indentation is not a suggestion."
        },
        bug: { fr: 'IndentationError: unexpected indent (×1000)', en: 'IndentationError: unexpected indent (×1000)' },
        skills: ['Python', 'Pydroid', 'turtle']
    },
    {
        id: 'c2021', year: '2021',
        title: { fr: 'Le mur Tkinter', en: 'The Tkinter wall' },
        text: {
            fr: "Début 2021, je veux des fenêtres, des boutons, une vraie interface. Je tente Tkinter sur mon téléphone. Résultat : rien ne s'ouvre, rien ne marche, et beaucoup de papier froissé.",
            en: "Early 2021, I want windows, buttons, a real interface. I try Tkinter on my phone. Result: nothing opens, nothing works, and a lot of crumpled paper."
        },
        bug: { fr: 'Le code Tkinter qui refuse de fonctionner, encore et encore', en: 'Tkinter code that refuses to work, again and again' },
        skills: { fr: ['Persévérance', 'Lire les erreurs'], en: ['Perseverance', 'Reading error messages'] }
    },
    {
        id: 'c2022', year: '2022 → 2023',
        title: { fr: 'Enfin un PC', en: 'Finally, a PC' },
        text: {
            fr: "2022 : mon premier PC. Avec un vrai clavier, Tkinter se laisse enfin apprivoiser. Naissent une calculatrice et une galerie d'images, mes premières applications avec une interface graphique.",
            en: "2022: my first PC. With a real keyboard, Tkinter finally gives in. A calculator and an image gallery are born, my first apps with a graphical interface."
        },
        bug: { fr: 'NameError, ZeroDivisionError, bouton qui ne réagit pas', en: "NameError, ZeroDivisionError, a button that won't respond" },
        skills: ['Tkinter', { fr: 'Interfaces graphiques', en: 'GUI design' }, { fr: 'Débogage', en: 'Debugging' }]
    },
    {
        id: 'c2023', year: '2023 → 2024',
        title: { fr: 'Le web', en: 'The web' },
        text: {
            fr: "Je passe au web : HTML, CSS, JavaScript, jQuery, puis GSAP pour animer. Je construis des sites vitrines qui bougent. Et je rencontre un nouvel ennemi juré : undefined.",
            en: "I move to the web: HTML, CSS, JavaScript, jQuery, then GSAP to animate. I build showcase websites that move. And I meet a brand new nemesis: undefined."
        },
        bug: { fr: 'TypeError: Cannot read properties of undefined', en: 'TypeError: Cannot read properties of undefined' },
        skills: ['HTML', 'CSS', 'JavaScript', 'jQuery', 'GSAP']
    },
    {
        id: 'c2025', year: '2025',
        title: { fr: 'Le premier bot', en: 'The first bot' },
        text: {
            fr: "Je découvre Baileys et je construis mon premier bot WhatsApp. J'envoie !ping, il répond pong. Je crie un peu. Dans la foulée, j'apprends TypeScript pour arrêter de me tirer dans le pied.",
            en: "I discover Baileys and build my first WhatsApp bot. I send !ping, it answers pong. I scream a little. Right after, I learn TypeScript to stop shooting myself in the foot."
        },
        bug: { fr: 'await oublié, session expirée, QR code à rescanner', en: 'Forgotten await, expired session, QR code to scan again' },
        skills: ['Baileys', 'Node.js', 'TypeScript']
    },
    {
        id: 'c2026', year: '2026',
        title: { fr: 'VansTech', en: 'VansTech' },
        text: {
            fr: "Je me lance dans un SaaS complet pour déployer des bots WhatsApp : vanstech.space. NestJS, PostgreSQL, un VPS, Nginx, Docker… Aujourd'hui : plus de 3 000 inscrits et plus de 100 utilisateurs actifs.",
            en: "I build a full SaaS to deploy WhatsApp bots: vanstech.space. NestJS, PostgreSQL, a VPS, Nginx, Docker… Today: over 3,000 sign-ups and over 100 active users."
        },
        bug: { fr: '502 Bad Gateway, port déjà utilisé, conteneur qui redémarre en boucle', en: '502 Bad Gateway, port already in use, container stuck in a restart loop' },
        skills: ['NestJS', 'PostgreSQL', 'VPS', 'Nginx', 'Docker']
    },
    {
        id: 'now', year: { fr: "Aujourd'hui", en: 'Today' },
        title: { fr: 'Et maintenant ?', en: "What's next?" },
        text: {
            fr: "Six ans, des centaines de bugs, quelques échecs et pas mal de victoires. Aujourd'hui, je mets tout ça au service de vos projets en mission freelance : sites web, API, bots et SaaS.",
            en: "Six years, hundreds of bugs, a few failures and quite a few wins. Today I put all of it to work on your projects as a freelancer: websites, APIs, bots and SaaS."
        },
        bug: { fr: 'Aucun bug connu. (Pour l\'instant.)', en: 'No known bugs. (For now.)' },
        skills: { fr: ['Full stack', 'Freelance', 'Autodidacte'], en: ['Full stack', 'Freelance', 'Self-taught'] }
    }
];

// Objets cliquables. "obj" = objet 3D, "ch" = [premier chapitre, dernier chapitre] où l'anecdote est active.
// action: 'contact' ouvre le panneau de contact au lieu d'une anecdote.
export const HOTSPOTS = [
    { id: 'shelf', obj: 'shelf', ch: [0, 6],
      title: { fr: 'Mes trophées', en: 'My trophies' },
      text: { fr: "Chaque technologie apprise rejoint l'étagère. Elle se remplit chapitre après chapitre. Spoiler : à la fin, il faut une deuxième planche.", en: 'Every technology I learn lands on this shelf. It fills up chapter after chapter. Spoiler: by the end, it needs a second plank.' } },

    { id: 'phone-2020', obj: 'phone', ch: [0, 0],
      title: { fr: 'Mon premier IDE', en: 'My first IDE' },
      text: { fr: 'Un écran de six pouces, un clavier tactile pas du tout fait pour coder, et pourtant : print("Hello World") s\'affiche. Premier frisson.', en: 'A six-inch screen, a touch keyboard not made for coding at all, and yet: print("Hello World") shows up. First thrill.' } },
    { id: 'postits', obj: 'postits', ch: [0, 1],
      title: { fr: 'IndentationError, mon premier ennemi', en: 'IndentationError, my first enemy' },
      text: { fr: "Un espace de trop, une tabulation mal placée, et Python refusait de me parler. J'ai appris à compter les espaces avant d'apprendre à compter en binaire.", en: 'One extra space, one misplaced tab, and Python stopped talking to me. I learned to count spaces before I learned to count in binary.' } },
    { id: 'turtle', obj: 'turtle', ch: [0, 1],
      title: { fr: 'Les dessins de turtle', en: 'Turtle drawings' },
      text: { fr: 'Avec la bibliothèque turtle, une petite tortue dessinait mes boucles. Quand la spirale sortait enfin correctement, j\'avais l\'impression d\'avoir codé un jeu vidéo.', en: 'With the turtle library, a little turtle drew my loops. When the spiral finally came out right, it felt like I had coded a video game.' } },

    { id: 'phone-2021', obj: 'phone', ch: [1, 1],
      title: { fr: 'Tkinter sur Pydroid', en: 'Tkinter on Pydroid' },
      text: { fr: "J'écrivais une fenêtre, je lançais, et… rien. Je recopiais le tutoriel à la virgule près. Toujours rien. Le téléphone avait ses limites. Moi, pas encore.", en: 'I wrote a window, hit run, and… nothing. I copied the tutorial down to the last comma. Still nothing. The phone had its limits. I did not, yet.' } },
    { id: 'paper', obj: 'paper', ch: [1, 1],
      title: { fr: 'Les échecs', en: 'The failures' },
      text: { fr: "Chaque boulette, c'est un programme qui n'a jamais fonctionné. J'ai pensé à arrêter. Je ne l'ai pas fait, et c'est sans doute ma meilleure décision de code.", en: "Every paper ball is a program that never worked. I thought about quitting. I didn't, and it's probably my best coding decision ever." } },

    { id: 'pc-2022', obj: 'pc', ch: [2, 2],
      title: { fr: 'Le PC', en: 'The PC' },
      text: { fr: 'Un vrai clavier ! Fini les fautes de frappe au pouce. Et surtout, Tkinter qui marche enfin. Les fenêtres s\'ouvrent, les boutons répondent : le mur est tombé.', en: 'A real keyboard! No more thumb typos. And above all, Tkinter finally works. Windows open, buttons respond: the wall is down.' } },
    { id: 'calc', obj: 'calc', ch: [2, 2],
      title: { fr: 'La calculatrice', en: 'The calculator' },
      text: { fr: 'Ma première vraie application : des boutons, un écran, des opérations. Elle savait faire 2 + 2. Elle savait aussi planter sur une division par zéro, au début.', en: 'My first real app: buttons, a display, operations. It could do 2 + 2. At first, it could also crash on a division by zero.' } },
    { id: 'gallery', obj: 'gallery', ch: [2, 2],
      title: { fr: 'La galerie', en: 'The gallery' },
      text: { fr: "Une galerie d'images en Tkinter pour faire défiler des photos. Les chemins de fichiers et les formats d'image m'ont appris la patience.", en: 'An image gallery in Tkinter to browse photos. File paths and image formats taught me patience.' } },

    { id: 'posters', obj: 'posters', ch: [3, 3],
      title: { fr: 'Les sites vitrines', en: 'Showcase websites' },
      text: { fr: 'Des pages qui s\'animent au défilement, des boutons qui rebondissent. J\'ai découvert que le CSS peut rendre fou, et que GSAP peut rendre heureux.', en: 'Pages that animate on scroll, buttons that bounce. I found out CSS can drive you crazy, and GSAP can make you happy.' } },
    { id: 'undefined', obj: 'jsnote', ch: [3, 3],
      title: { fr: '« is undefined »', en: '“is undefined”' },
      text: { fr: "Le message qui m'a suivi partout : une variable pas encore chargée, un sélecteur mal écrit, un script appelé trop tôt. J'ai appris à lire la console comme un roman policier.", en: 'The message that followed me everywhere: a variable not loaded yet, a mistyped selector, a script called too early. I learned to read the console like a detective novel.' } },

    { id: 'phone-2025', obj: 'phone', ch: [4, 4],
      title: { fr: '!ping → pong', en: '!ping → pong' },
      text: { fr: "La première commande de mon bot. Deux mots, et pourtant c'est le moment où j'ai compris que je pouvais créer des choses que d'autres utilisent.", en: "My bot's first command. Two words, and yet that's the moment I understood I could build things other people use." } },
    { id: 'pc-2025', obj: 'pc', ch: [4, 4],
      title: { fr: 'Les galères de débutant', en: 'Beginner struggles' },
      text: { fr: 'Un await oublié, une promesse jamais résolue, un QR code à rescanner pour la dixième fois, des types qui ne collent pas. TypeScript m\'a sauvé plus d\'une nuit.', en: 'A forgotten await, a promise that never resolves, a QR code to scan for the tenth time, types that don\'t match. TypeScript saved more than one of my nights.' } },

    { id: 'pc-2026', obj: 'pc', ch: [5, 5],
      title: { fr: 'Le tableau de bord VansTech', en: 'The VansTech dashboard' },
      text: { fr: 'NestJS côté API, PostgreSQL pour les données, un tableau de bord pour créer, déployer et gérer des bots WhatsApp en quelques clics.', en: 'NestJS for the API, PostgreSQL for the data, a dashboard to create, deploy and manage WhatsApp bots in a few clicks.' },
      link: { href: 'https://vanstech.space', label: 'vanstech.space' } },
    { id: 'server', obj: 'server', ch: [5, 6],
      title: { fr: 'Le serveur', en: 'The server' },
      text: { fr: 'Configurer un VPS à la main : SSH, pare-feu, Nginx en reverse proxy, certificats. Le premier 502 Bad Gateway fait peur. Le dixième fait sourire.', en: 'Setting up a VPS by hand: SSH, firewall, Nginx as a reverse proxy, certificates. The first 502 Bad Gateway is scary. The tenth one makes you smile.' } },
    { id: 'whale', obj: 'whale', ch: [5, 6],
      title: { fr: 'Docker', en: 'Docker' },
      text: { fr: '« Ça marche sur ma machine » n\'est plus une excuse : tout tourne dans des conteneurs. Le jour où docker compose up a tout lancé du premier coup, j\'ai cru à un bug.', en: '“Works on my machine” is no longer an excuse: everything runs in containers. The day docker compose up started everything on the first try, I thought it was a bug.' } },
    { id: 'stats', obj: 'stats', ch: [5, 6],
      title: { fr: 'Les chiffres', en: 'The numbers' },
      text: { fr: "Plus de 3 000 inscrits et plus de 100 utilisateurs actifs sur vanstech.space. Le gamin qui codait sur son téléphone n'y croirait pas.", en: 'Over 3,000 sign-ups and over 100 active users on vanstech.space. The kid coding on a phone would never have believed it.' },
      link: { href: 'https://vanstech.space', label: 'vanstech.space' } },

    { id: 'neon', obj: 'neon', ch: [6, 6], action: 'contact',
      title: { fr: 'Disponible en freelance', en: 'Available for freelance' } },
    { id: 'phone-now', obj: 'phone', ch: [6, 6], action: 'contact',
      title: { fr: 'Me contacter', en: 'Contact me' } }
];

// Compétences qui apparaissent sur l'étagère (chapitre d'obtention + couleur de marque)
export const BADGES = [
    { label: 'Python', ch: 0, color: '#3776ab', ink: '#ffd43b' },
    { label: 'turtle', ch: 0, color: '#2e7d32', ink: '#ffffff' },
    { label: 'Tkinter', ch: 2, color: '#1e3a5f', ink: '#ffffff' },
    { label: 'HTML', ch: 3, color: '#e34c26', ink: '#ffffff' },
    { label: 'CSS', ch: 3, color: '#264de4', ink: '#ffffff' },
    { label: 'JS', ch: 3, color: '#f7df1e', ink: '#111111' },
    { label: 'jQuery', ch: 3, color: '#0769ad', ink: '#ffffff' },
    { label: 'GSAP', ch: 3, color: '#0ae448', ink: '#0e100f' },
    { label: 'Baileys', ch: 4, color: '#25d366', ink: '#ffffff' },
    { label: 'TS', ch: 4, color: '#3178c6', ink: '#ffffff' },
    { label: 'NestJS', ch: 5, color: '#e0234e', ink: '#ffffff' },
    { label: 'Postgres', ch: 5, color: '#336791', ink: '#ffffff' },
    { label: 'Docker', ch: 5, color: '#2496ed', ink: '#ffffff' },
    { label: 'Nginx', ch: 5, color: '#009639', ink: '#ffffff' }
];

export const UI = {
    fr: {
        role: "Développeur full stack autodidacte",
        loading: ["Correction des indentations…", "Recherche du point-virgule manquant…", "Redémarrage du conteneur…", "Assemblage de la chambre…"],
        hint: "Glissez pour tourner autour de la chambre, cliquez sur les objets. Le calendrier fait avancer le temps.",
        calendarTitle: 'Le calendrier',
        calendarHint: "Cliquez pour avancer d'une année",
        chapters: 'Chapitres', stories: 'Anecdotes',
        bugLabel: 'Le bug du moment', skillsLabel: 'Compétences gagnées',
        objectsBtn: 'Objets', objectsTitle: 'Objets à découvrir dans ce chapitre',
        overview: "Vue d'ensemble", next: 'Année suivante', prev: 'Année précédente', back: 'Retour au chapitre',
        contact: 'Me contacter', close: 'Fermer', lang: 'EN',
        contactTitle: 'Travaillons ensemble',
        contactText: "Je suis disponible pour des missions freelance : sites web, API, bots WhatsApp et SaaS. Racontez-moi votre projet.",
        name: 'Nom', email: 'Email', message: 'Message', send: 'Envoyer', sending: 'Envoi…',
        sent: 'Merci ! Votre message est parti, je vous réponds vite.',
        failed: "L'envoi a échoué. Écrivez-moi directement par email.",
        errName: 'Indiquez votre nom.', errEmail: 'Adresse email invalide.', errMsg: 'Au moins 10 caractères, svp.',
        timeline: 'Frise du parcours',
        skip: 'Passer la scène', replay: 'Rejouer la scène', meReplay: 'C\x27est moi ! Rejouer la scène', meContact: 'C\x27est moi ! Me contacter',
        cat: 'Le chat', catSays: 'Miaou. (Le chat, chef de projet depuis 2020.)', discovered: 'découvert', webglError: "Votre navigateur ne peut pas afficher la 3D. Voici l'histoire en texte :"
    },
    en: {
        role: "Self-taught full stack developer",
        loading: ['Fixing indentation…', 'Looking for the missing semicolon…', 'Restarting the container…', 'Building the room…'],
        hint: 'Drag to orbit around the room, click on objects. The calendar moves time forward.',
        calendarTitle: 'The calendar',
        calendarHint: 'Click to jump one year ahead',
        chapters: 'Chapters', stories: 'Stories',
        bugLabel: 'Bug of the moment', skillsLabel: 'Skills unlocked',
        objectsBtn: 'Objects', objectsTitle: 'Objects to discover in this chapter',
        overview: 'Overview', next: 'Next year', prev: 'Previous year', back: 'Back to chapter',
        contact: 'Contact me', close: 'Close', lang: 'FR',
        contactTitle: "Let's work together",
        contactText: "I'm available for freelance work: websites, APIs, WhatsApp bots and SaaS. Tell me about your project.",
        name: 'Name', email: 'Email', message: 'Message', send: 'Send', sending: 'Sending…',
        sent: 'Thanks! Your message is on its way, I will get back to you soon.',
        failed: 'Sending failed. Please email me directly.',
        errName: 'Please enter your name.', errEmail: 'Invalid email address.', errMsg: 'At least 10 characters, please.',
        timeline: 'Journey timeline',
        skip: 'Skip scene', replay: 'Replay scene', meReplay: "That's me! Replay the scene", meContact: "That's me! Contact me",
        cat: 'The cat', catSays: 'Meow. (The cat, project manager since 2020.)', discovered: 'discovered', webglError: "Your browser can't display 3D. Here is the story as text:"
    }
};
