// Custom Cursor logic
if (window.innerWidth > 1024) {
    const dot = document.querySelector('.custom-cursor');
    
    // Create the outer trailing ring element dynamically
    const ring = document.createElement('div');
    ring.className = 'custom-cursor-ring';
    document.body.appendChild(ring);
    
    // Set initial position
    gsap.set(dot, { xPercent: -50, yPercent: -50 });
    gsap.set(ring, { xPercent: -50, yPercent: -50 });
    
    // Smooth trailing physics
    window.addEventListener("mousemove", e => {
        gsap.to(dot, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.04,
            ease: "power2.out"
        });
        gsap.to(ring, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.16,
            ease: "power2.out"
        });
    });
    
    // Attach hover effects to expand and color-morph cursor
    const hoverables = document.querySelectorAll('a, button, input, textarea, .project-card, .social-btn');
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            dot.classList.add('hovered');
            ring.classList.add('hovered');
        });
        el.addEventListener('mouseleave', () => {
            dot.classList.remove('hovered');
            ring.classList.remove('hovered');
        });
    });
}

// GSAP Scroll Reveal logic using IntersectionObserver
const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.05,
};

// Select reveal elements
const revealTargets = document.querySelectorAll('.project-card, .chart-container, #contact form, #contact > div > div > div, #hero h1, #hero p, #hero .flex.space-x-4, #hero .test');

revealTargets.forEach(el => {
    el.classList.add('reveal-hidden');
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            gsap.to(entry.target, {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: "power3.out",
                onComplete: () => {
                    // Clear transform styles on complete to prevent conflicts with CSS hovers
                    entry.target.style.transform = '';
                    entry.target.style.opacity = '';
                    entry.target.classList.remove('reveal-hidden');
                }
            });
            revealObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

revealTargets.forEach(el => revealObserver.observe(el));


// Competence Chart config
let types = ["bar", "line", "radar", "polarArea"];
let currentIndex = 0;
const canvasElement = document.getElementById('competencesChart');

// Gradient fills for each skill
function getSkillGradients(ctx) {
    const g1 = ctx.createLinearGradient(0, 0, 0, 300);
    g1.addColorStop(0, 'rgba(97, 218, 251, 0.85)');
    g1.addColorStop(1, 'rgba(97, 218, 251, 0.15)');
    
    const g2 = ctx.createLinearGradient(0, 0, 0, 300);
    g2.addColorStop(0, 'rgba(49, 120, 198, 0.85)');
    g2.addColorStop(1, 'rgba(49, 120, 198, 0.15)');
    
    const g3 = ctx.createLinearGradient(0, 0, 0, 300);
    g3.addColorStop(0, 'rgba(90, 173, 69, 0.85)');
    g3.addColorStop(1, 'rgba(90, 173, 69, 0.15)');
    
    const g4 = ctx.createLinearGradient(0, 0, 0, 300);
    g4.addColorStop(0, 'rgba(224, 35, 78, 0.85)');
    g4.addColorStop(1, 'rgba(224, 35, 78, 0.15)');
    
    const g5 = ctx.createLinearGradient(0, 0, 0, 300);
    g5.addColorStop(0, 'rgba(65, 105, 225, 0.85)');
    g5.addColorStop(1, 'rgba(65, 105, 225, 0.15)');
    
    const g6 = ctx.createLinearGradient(0, 0, 0, 300);
    g6.addColorStop(0, 'rgba(71, 162, 72, 0.85)');
    g6.addColorStop(1, 'rgba(71, 162, 72, 0.15)');
    
    return [g1, g2, g3, g4, g5, g6];
}

function func_config(type_conf) {
    const ctx = canvasElement.getContext('2d');
    const grads = getSkillGradients(ctx);
    
    const data = {
        labels: ['React', 'TypeScript', 'Node.js', 'NestJS', 'PostgreSQL', 'MongoDB'],
        datasets: [{
            label: 'Niveau de Maîtrise (%)',
            data: [90, 85, 90, 80, 85, 80],
            backgroundColor: grads,
            borderColor: [
                'rgba(97, 218, 251, 1)',
                'rgba(49, 120, 198, 1)',
                'rgba(90, 173, 69, 1)',
                'rgba(224, 35, 78, 1)',
                'rgba(65, 105, 225, 1)',
                'rgba(71, 162, 72, 1)'
            ],
            borderWidth: 2,
            hoverOffset: 15
        }]
    };

    // Override styling configs for Line / Radar to look clean
    if (type_conf === 'line') {
        data.datasets[0].backgroundColor = 'rgba(0, 170, 255, 0.15)';
        data.datasets[0].borderColor = 'rgba(0, 170, 255, 1)';
        data.datasets[0].fill = true;
        data.datasets[0].tension = 0.4;
    } else if (type_conf === 'radar') {
        data.datasets[0].backgroundColor = 'rgba(0, 170, 255, 0.15)';
        data.datasets[0].borderColor = 'rgba(0, 170, 255, 1)';
        data.datasets[0].pointBackgroundColor = 'rgba(0, 255, 204, 1)';
        data.datasets[0].pointBorderColor = '#fff';
    }

    // Generate responsive scale configuration based on chart type
    const scaleOptions = {};
    if (type_conf === 'bar' || type_conf === 'line') {
        scaleOptions.x = {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
                color: '#94a3b8',
                font: { family: 'Space Grotesk', size: 12 }
            }
        };
        scaleOptions.y = {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
                color: '#94a3b8',
                font: { family: 'Space Grotesk', size: 12 }
            }
        };
    } else if (type_conf === 'radar' || type_conf === 'polarArea') {
        scaleOptions.r = {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
            pointLabels: {
                color: '#94a3b8',
                font: { family: 'Space Grotesk', size: 11 }
            },
            ticks: {
                backdropColor: 'transparent',
                color: '#64748b',
                font: { family: 'Space Grotesk' }
            }
        };
    }

    return {
        type: type_conf,
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: scaleOptions,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#f8fafc',
                        font: {
                            family: 'Space Grotesk',
                            size: 13,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#00AAFF',
                    titleFont: { family: 'Space Grotesk', size: 13, weight: 'bold' },
                    bodyColor: '#f8fafc',
                    bodyFont: { family: 'Space Grotesk', size: 12 },
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ${context.raw}%`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Niveau de Maîtrise des Compétences',
                    color: '#f8fafc',
                    font: {
                        family: 'Space Grotesk',
                        size: 18,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                }
            }
        }
    };
}

// Initialize the compétences chart
let competencesChart = new Chart(
    canvasElement,
    func_config(types[currentIndex])
);

// Alternates chart types every 10 seconds with smooth destruction and recreation
setInterval(() => {
    competencesChart.destroy();
    currentIndex = (currentIndex + 1) % types.length;
    competencesChart = new Chart(
        canvasElement,
        func_config(types[currentIndex])
    );
}, 10000);


// Mobile Menu toggling
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");

menuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
    if (mobileMenu.classList.contains("hidden")) {
        menuToggle.innerHTML = '<i class="ri-menu-line ri-lg"></i>';
    } else {
        menuToggle.innerHTML = '<i class="ri-close-line ri-lg"></i>';
    }
});

// Smooth scrolls
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();

        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: "smooth",
            });

            // Close mobile menu if open
            if (!mobileMenu.classList.contains("hidden")) {
                mobileMenu.classList.add("hidden");
                menuToggle.innerHTML = '<i class="ri-menu-line ri-lg"></i>';
            }
        }
    });
});

// Initialize particles.js background
particlesJS("particles-js", {
    particles: {
        number: { value: 100, density: { enable: true, value_area: 800 } },
        color: { value: "#00AAFF" },
        shape: { type: "circle" },
        opacity: { value: 0.5, random: false },
        size: { value: 3, random: true },
        line_linked: {
            enable: true,
            distance: 150,
            color: "#00AAFF",
            opacity: 0.4,
            width: 1,
        },
        move: {
            enable: true,
            speed: 2.2,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
            bounce: true,
        },
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: { enable: true, mode: "grab" },
            onclick: { enable: true, mode: "push" },
            resize: true,
        },
        modes: {
            grab: { distance: 140, line_linked: { opacity: 0.95 } },
            push: { particles_nb: 4 },
        },
    },
    retina_detect: true,
});
