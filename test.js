$(window).on('load', function () {
    

   /* const square = document.getElementById('Layer_1');
    
        gsap.to(square, {
        y: -20, // Déplace le carré vers le haut
        duration: 1, // Durée de l'animation
        repeat: -1, // Répète l'animation indéfiniment
        yoyo: true, // Fait revenir le carré à sa position initiale
        ease: "power1.inOut", // Ajoute un effet d'accélération et de décélération
        webkitBoxReflect:" below -10px linear-gradient(to top, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0))"
    });
*/

    gsap.to(".svg",{
        y:-150,
        duration:1,
        repeat:-1,
        yoyo:true,
        webkitBoxReflect:" below 250px linear-gradient(to top, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0))"

    })
    $("#power_button").click(function (e) { 
        $(".instruction").toggleClass("inactive");
        $(".page").toggleClass("active");
        $(".name").toggleClass("active");
        $(".language").toggleClass("active");
       

        $(this).toggleClass("active_button");
    });

});
