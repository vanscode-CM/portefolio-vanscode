$(window).on('load', function () {
    
    let isBooted = false;
    let floatTweens = [];
    let typeTimers = [];

    function clearAnimations() {
        // Kill all floating loops
        floatTweens.forEach(t => t.kill());
        floatTweens = [];
        
        // Clear typewriter timers
        typeTimers.forEach(t => clearInterval(t));
        typeTimers = [];
        
        // Kill active GSAP tweens on screen and icons
        gsap.killTweensOf(".language svg.svg");
        gsap.killTweensOf(".screen-gear");
        gsap.killTweensOf(".code-line");
        gsap.killTweensOf("#p4");
        gsap.killTweensOf("#boot_title");
        gsap.killTweensOf("#boot_subtitle");
    }

    function bootSystem() {
        isBooted = true;
        clearAnimations();
        
        // 1. Power button glows bright green, toggle classes
        $("#power_button").addClass("active_button");
        $(".instruction").addClass("inactive");
        $(".container .pc svg").addClass("crt-active");
        $("body").removeClass("system-off");
        
        // 2. CRT-like screen flicker and light projection animation (Deep Blue / White theme)
        const screenBg = $("#p4");
        const flickerTimeline = gsap.timeline({
            onComplete: () => {
                // Settle screen background to deep blue and start ejection
                gsap.to(screenBg, { fill: "#010510", duration: 0.3 });
                ejectIcons();
            }
        });
        
        flickerTimeline
            // CRT-like flicker warm up
            .to(screenBg, { fill: "#0088ff", duration: 0.05 })
            .to(screenBg, { fill: "#000000", duration: 0.05 })
            .to(screenBg, { fill: "#00aaff", duration: 0.05 })
            .to(screenBg, { fill: "#000000", duration: 0.05 })
            // Massive light projection flare
            .to(screenBg, { 
                fill: "#ffffff", 
                filter: "drop-shadow(0 0 35px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 70px rgba(0, 136, 255, 0.7))",
                duration: 0.6,
                ease: "power2.out"
            })
            // Fade projection down
            .to(screenBg, {
                filter: "drop-shadow(0 0 5px rgba(0, 136, 255, 0.2))",
                duration: 0.4,
                ease: "power2.in"
            });
    }

    function typewriter(element, text, speed, callback) {
        let i = 0;
        element.text("");
        element.css("visibility", "visible");
        let timer = setInterval(function() {
            if (i < text.length) {
                element.text(text.substring(0, i + 1));
                i++;
            } else {
                clearInterval(timer);
                if (callback) callback();
            }
        }, speed);
        return timer;
    }

    function ejectIcons() {
        $(".language").addClass("active");
        
        const pc = document.querySelector('.container .pc');
        const pcRect = pc.getBoundingClientRect();
        const pcCenterX = pcRect.left + pcRect.width / 2;
        const pcCenterY = pcRect.top + pcRect.height / 2;
        
        const svgs = document.querySelectorAll(".language svg.svg");
        
        svgs.forEach((svg, index) => {
            // Compute ejection offset dynamically based on current DOM position
            gsap.set(svg, { scale: 1, opacity: 1 });
            const rect = svg.getBoundingClientRect();
            gsap.set(svg, { scale: 0, opacity: 0 });
            
            const svgCenterX = rect.left + rect.width / 2;
            const svgCenterY = rect.top + rect.height / 2;
            
            const deltaX = pcCenterX - svgCenterX;
            const deltaY = pcCenterY - svgCenterY;
            
            // Ejection tween
            gsap.fromTo(svg, 
                {
                    x: deltaX,
                    y: deltaY,
                    scale: 0,
                    opacity: 0,
                    rotation: -180
                },
                {
                    x: 0,
                    y: 0,
                    scale: 1,
                    opacity: 1,
                    rotation: 0,
                    duration: 1.4,
                    delay: index * 0.12,
                    ease: "elastic.out(1, 0.7)",
                    onComplete: () => {
                        // Start float loop after ejection finishes
                        startFloating(svg);
                        
                        // Once the last icon finishes ejecting, show terminal details
                        if (index === svgs.length - 1) {
                            showScreenDetails();
                        }
                    }
                }
            );
        });
    }

    function showScreenDetails() {
        const title = $("#boot_title");
        const subtitle = $("#boot_subtitle");
        
        gsap.set(title, { clearProps: "all" });
        gsap.set(subtitle, { clearProps: "all" });
        
        title.text("").addClass("active");
        subtitle.text("").addClass("active");
        
        // Start typing VANSCODE
        const t1 = typewriter(title, "VANSCODE", 60, () => {
            // Once VANSCODE finishes typing, animate its signature glow
            gsap.fromTo("#boot_title", 
                { filter: "drop-shadow(0 0 2px rgba(0, 255, 102, 0.5))", scale: 1 },
                {
                    filter: "drop-shadow(0 0 15px rgba(0, 255, 102, 1)) drop-shadow(0 0 30px rgba(0, 255, 102, 0.6))",
                    scale: 1.15,
                    duration: 1.2,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    transformOrigin: "50% 50%"
                }
            );
            
            // Start typing subtitle
            const t2 = typewriter(subtitle, "Welcome to my universe", 35, () => {
                // Show coding page after text finishes
                $(".page").addClass("active");
                
                // Draw code lines from left to right
                gsap.fromTo(".code-line", 
                    { scaleX: 0, transformOrigin: "left center" }, 
                    { scaleX: 1, duration: 0.3, stagger: 0.08, ease: "power2.out" }
                );
                
                // Rotate screen gear processing indicator slowly on its own center
                gsap.to(".screen-gear", {
                    rotation: 360,
                    duration: 25,
                    repeat: -1,
                    ease: "none",
                    transformOrigin: "50% 50%"
                });

                // Fade in the about link at the very end
                $(".about").addClass("active");
            });
            typeTimers.push(t2);
        });
        typeTimers.push(t1);
    }

    function startFloating(svg) {
        const floatTween = gsap.to(svg, {
            y: "random(-15, 15)",
            x: "random(-10, 10)",
            rotation: "random(-5, 5)",
            duration: "random(3, 5)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
        floatTweens.push(floatTween);
    }

    function shutdownSystem() {
        isBooted = false;
        clearAnimations();
        
        const pc = document.querySelector('.container .pc');
        const pcRect = pc.getBoundingClientRect();
        const pcCenterX = pcRect.left + pcRect.width / 2;
        const pcCenterY = pcRect.top + pcRect.height / 2;
        
        const svgs = document.querySelectorAll(".language svg.svg");
        let completedCount = 0;
        
        if (svgs.length === 0) {
            completeShutdown();
            return;
        }
        
        svgs.forEach((svg) => {
            const rect = svg.getBoundingClientRect();
            const svgCenterX = rect.left + rect.width / 2;
            const svgCenterY = rect.top + rect.height / 2;
            const deltaX = pcCenterX - svgCenterX;
            const deltaY = pcCenterY - svgCenterY;
            
            // Retraction tween
            gsap.to(svg, {
                x: deltaX,
                y: deltaY,
                scale: 0,
                opacity: 0,
                rotation: 180,
                duration: 0.7,
                ease: "back.in(1.2)",
                onComplete: () => {
                    completedCount++;
                    if (completedCount === svgs.length) {
                        completeShutdown();
                    }
                }
            });
        });
    }

    function completeShutdown() {
        const screenBg = $("#p4");
        const shutdownTimeline = gsap.timeline();
        shutdownTimeline
            .to(screenBg, { fill: "#0088ff", duration: 0.04 })
            .to(screenBg, { fill: "#000000", duration: 0.08, onComplete: () => {
                // Reset styling classes
                $(".instruction").removeClass("inactive");
                $(".page").removeClass("active");
                $(".name").removeClass("active");
                $(".language").removeClass("active");
                $("#power_button").removeClass("active_button");
                $(".container .pc svg").removeClass("crt-active");
                $(".about").removeClass("active");
                
                // Clear texts and reset custom styles/transforms
                $("#boot_title").text("").removeClass("active");
                gsap.set("#boot_title", { clearProps: "all" });
                $("#boot_subtitle").text("").removeClass("active");
                gsap.set("#boot_subtitle", { clearProps: "all" });
                gsap.set(".screen-gear", { clearProps: "all" });
                $("body").addClass("system-off");
            }});
    }

    $("#power_button").click(function (e) { 
        if (!isBooted) {
            bootSystem();
        } else {
            shutdownSystem();
        }
    });

});
