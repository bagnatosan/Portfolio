/* ==========================================================================
   PORTFOLIO 3D ENGINE & INTERACTIONS (Santiago Bagnato)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    init3dConstellation();
    initCard3dTilt();
});

/**
 * 1. 3D Particle Constellation Engine (Vanilla HTML5 Canvas)
 * Renders a lightweight, high-performance 3D starfield that rotates based on cursor
 * movement and flies through depth based on page scrolling.
 */
function init3dConstellation() {
    const canvas = document.getElementById("canvas3d");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId;

    // Ajustar resolución del canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Configuración de la simulación 3D
    const PARTICLE_COUNT = 150;
    const particles = [];
    const maxDepth = 1000;

    // Inicializar coordenadas tridimensionales de las partículas
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: (Math.random() - 0.5) * 2000,
            y: (Math.random() - 0.5) * 2000,
            z: Math.random() * maxDepth,
            size: Math.random() * 2 + 1,
            color: Math.random() > 0.4 ? "#9eff00" : "#00f2fe" // Verde Neón o Celeste
        });
    }

    // Estado interactivo (Cursor y Scroll)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let cameraZ = 0;

    window.addEventListener("mousemove", (e) => {
        // Coordenadas normalizadas de -1 a 1 respecto al centro
        targetX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
        targetY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    });

    window.addEventListener("scroll", () => {
        // La cámara "avanza" por el espacio Z según el scroll de la página
        cameraZ = window.scrollY * 0.8;
    });

    // Render loop
    function animate() {
        // Limpieza con rastro sutil para dar sensación de velocidad (motion blur)
        ctx.fillStyle = "rgba(6, 7, 10, 0.25)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Suavizado del movimiento del mouse (interpolación lineal / lerp)
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        // Matrices de rotación aproximadas basadas en el mouse
        const angleX = mouseY * 0.15;
        const angleY = mouseX * 0.15;

        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const fov = 350; // Field of View (distancia focal)

        // Renderizar y proyectar cada partícula
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const p = particles[i];

            // Avanzar partículas infinitamente en bucle infinito si se pasa el límite Z
            let z = p.z - cameraZ;
            while (z <= 0) z += maxDepth;
            while (z > maxDepth) z -= maxDepth;

            let x = p.x;
            let y = p.y;

            // 1. Rotación 3D en el eje X (Mouse Vertical)
            const y1 = y * cosX - z * sinX;
            const z1 = z * cosX + y * sinX;

            // 2. Rotación 3D en el eje Y (Mouse Horizontal)
            const x2 = x * cosY - z1 * sinY;
            const z2 = z1 * cosY + x * sinY;

            // 3. Proyección 2D (Fórmula de perspectiva matemática)
            const scale = fov / (fov + z2);
            const x2d = x2 * scale + centerX;
            const y2d = y1 * scale + centerY;

            // Dibujar solo si está dentro de la pantalla y el FOV es válido
            if (x2d > 0 && x2d < canvas.width && y2d > 0 && y2d < canvas.height && z2 > -fov) {
                // El tamaño y opacidad decaen con la profundidad (Z)
                const opacity = Math.max(0, 1 - z2 / maxDepth);
                const currentSize = p.size * scale;

                ctx.beginPath();
                ctx.arc(x2d, y2d, currentSize, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = opacity;
                ctx.shadowBlur = z2 < 300 ? 8 : 0; // Brillo glow en partículas cercanas
                ctx.shadowColor = p.color;
                ctx.fill();
            }
        }

        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
        animationId = requestAnimationFrame(animate);
    }

    animate();
}

/**
 * 2. 3D Tilt Card Interaction
 * Rotates the hero badge card in 3D perspective following the mouse movement.
 */
function initCard3dTilt() {
    const card = document.getElementById("card3d");
    if (!card) return;

    const heroSection = document.querySelector(".hero-section");
    if (!heroSection) return;

    heroSection.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        
        // Calcular centro de la tarjeta
        const cardX = rect.left + rect.width / 2;
        const cardY = rect.top + rect.height / 2;

        // Desviación del cursor respecto al centro de la tarjeta
        const offsetX = e.clientX - cardX;
        const offsetY = e.clientY - cardY;

        // Limitar la rotación a un máximo de 25 grados
        const rotateY = (offsetX / (window.innerWidth / 2)) * 30;
        const rotateX = -(offsetY / (window.innerHeight / 2)) * 30;

        // Aplicar transformación 3D
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    });

    heroSection.addEventListener("mouseleave", () => {
        // Suavizar la vuelta a la posición original
        card.style.transition = "transform 0.5s ease";
        card.style.transform = "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
        
        // Quitar la transición después de que termine para no laggear el mousemove
        setTimeout(() => {
            card.style.transition = "";
        }, 500);
    });
}
