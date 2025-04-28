
let types = ["pie", "line", "bar", "radar"];
let currentIndex = 0;
// Données pour le graphique
const data = {
    labels: ['HTML', 'CSS', 'JavaScript', 'Python', 'PHP'],
    datasets: [{
        label: 'Niveau de Maîtrise (%)',
        data: [80, 80, 70, 60, 50], // Pourcentages de maîtrise
        backgroundColor: [
            'rgba(255, 99, 132, 0.6)', // Rouge pour HTML
            'rgba(54, 162, 235, 0.6)', // Bleu pour CSS
            'rgba(255, 206, 86, 0.6)', // Jaune pour JavaScript
            'rgba(75, 192, 192, 0.6)', // Turquoise pour Python
            'rgba(153, 102, 255, 0.6)' // Violet pour PHP
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 2
    }]
};

function func_config(type_conf) {
    // Configuration du graphique
    config = {
        type: type_conf, // Type de graphique (bar, line, pie, etc.)
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ${context.raw}%`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Niveau de Maîtrise des Compétences',
                    font: {
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

    return config;
}


// Création du graphique
let competencesChart = new Chart(
    document.getElementById('competencesChart'),
    func_config(types[currentIndex])
);

setInterval(() => {
    // Détruire l'ancien graphique
    competencesChart.destroy();

    // Passer au type suivant
    currentIndex = (currentIndex + 1) % types.length;
    console.log(currentIndex);


    // Recréer le graphique avec le nouveau type
    competencesChart = new Chart(
        document.getElementById('competencesChart'),
        func_config(types[currentIndex])
    );
}, 10000); // Change toutes les 4 secondes


// Mobile menu toggle
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

// Smooth scroll
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

// Initialize particles.js
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
            speed: 2,
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
            grab: { distance: 140, line_linked: { opacity: 1 } },
            push: { particles_nb: 4 },
        },
    },
    retina_detect: true,
});

// Scroll reveal animation
const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("animate-fadeIn");
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll("section > div > div").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    observer.observe(el);
});

// Helper class for animations
document.head.insertAdjacentHTML(
    "beforeend",
    `
          <style>
              .animate-fadeIn {
                  opacity: 1 !important;
                  transform: translateY(0) !important;
              }
          </style>
      `,
);
