import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Scene Setup ---
const scene = new THREE.Scene();
// Fog for depth - adapts to theme
scene.fog = new THREE.FogExp2(0x0b0f19, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 25;
camera.position.y = 5;

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    alpha: true,
    antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// --- 1. Background: Tech Network (Plexus Effect) ---
class TechNetwork {
    constructor(scene) {
        this.scene = scene;
        this.particleCount = 200;
        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.colors = {
            dark: 0x38bdf8, // Cyan
            light: 0x0ea5e9 // Blue
        };

        this.initParticles();
    }

    initParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);

        // Spread particles in a wide volume
        for (let i = 0; i < this.particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        this.material = new THREE.PointsMaterial({
            color: this.colors.dark,
            size: 0.4,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });

        this.points = new THREE.Points(geometry, this.material);
        this.group.add(this.points);

        // Lines will be dynamic in update loop or static for performance
        // For "Tech" look, static grid lines or nearby connections work best
        const lineGeo = new THREE.BufferGeometry();
        // Pre-calculate some connections
        const linePos = [];
        const connectDist = 15;

        for (let i = 0; i < this.particleCount; i++) {
            for (let j = i + 1; j < this.particleCount; j++) {
                const x1 = positions[i * 3], y1 = positions[i * 3 + 1], z1 = positions[i * 3 + 2];
                const x2 = positions[j * 3], y2 = positions[j * 3 + 1], z2 = positions[j * 3 + 2];

                const dist = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);

                if (dist < connectDist) {
                    linePos.push(x1, y1, z1);
                    linePos.push(x2, y2, z2);
                }
            }
        }

        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
        this.lineMaterial = new THREE.LineBasicMaterial({
            color: this.colors.dark,
            transparent: true,
            opacity: 0.15
        });

        this.lines = new THREE.LineSegments(lineGeo, this.lineMaterial);
        this.group.add(this.lines);
    }

    update() {
        this.group.rotation.y += 0.0005;
        this.group.rotation.x += 0.0002;
    }

    setTheme(isLight) {
        const color = isLight ? this.colors.light : this.colors.dark;
        this.material.color.setHex(color);
        this.lineMaterial.color.setHex(color);
        this.lineMaterial.opacity = isLight ? 0.2 : 0.15;
    }
}

// --- 2. Main Object: Digital IoT Nexus ---
class IoTNexus {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.scene.add(this.group);

        // Position: Right side
        this.group.position.set(12, 0, 0);
        this.group.scale.set(1.2, 1.2, 1.2);

        this.initMaterials();
        this.buildModel();
    }

    initMaterials() {
        this.materials = {
            core: new THREE.MeshPhysicalMaterial({
                color: 0x0f172a, // Dark Navy
                roughness: 0.2,
                metalness: 0.8,
                clearcoat: 1.0,
                emissive: 0x0ea5e9,
                emissiveIntensity: 0.2
            }),
            wireframe: new THREE.MeshBasicMaterial({
                color: 0x38bdf8, // Cyan
                wireframe: true,
                transparent: true,
                opacity: 0.3
            }),
            node: new THREE.MeshStandardMaterial({
                color: 0x22d3ee,
                emissive: 0x22d3ee,
                emissiveIntensity: 2
            }),
            ring: new THREE.MeshBasicMaterial({
                color: 0x94a3b8,
                transparent: true,
                opacity: 0.2,
                side: THREE.DoubleSide
            })
        };
    }

    buildModel() {
        // 1. Core Sphere (The Physical World)
        const coreGeom = new THREE.SphereGeometry(2.5, 32, 32);
        const core = new THREE.Mesh(coreGeom, this.materials.core);
        this.group.add(core);

        // 2. Wireframe Overlay (The Digital Twin)
        const wireGeom = new THREE.IcosahedronGeometry(2.6, 2);
        const wire = new THREE.Mesh(wireGeom, this.materials.wireframe);
        this.group.add(wire);

        // 3. Orbiting Data Rings
        this.rings = [];
        const ringGeoms = [
            { r: 3.5, tube: 0.02, rot: { x: 1.5, y: 0.5 } },
            { r: 4.2, tube: 0.02, rot: { x: -0.5, y: 0.8 } },
            { r: 5.0, tube: 0.01, rot: { x: 0.2, y: -0.2 } }
        ];

        ringGeoms.forEach((config, i) => {
            const ringGroup = new THREE.Group();
            const ringGeo = new THREE.TorusGeometry(config.r, config.tube, 16, 100);
            const ring = new THREE.Mesh(ringGeo, this.materials.ring);
            ringGroup.add(ring);

            // Add a "Node" (IoT Device) to the ring
            const nodeGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
            const node = new THREE.Mesh(nodeGeo, this.materials.node);
            node.position.x = config.r;
            ringGroup.add(node);

            ringGroup.rotation.set(config.rot.x, config.rot.y, 0);

            // Store rotation speed
            ringGroup.userData = {
                speedX: (Math.random() - 0.5) * 0.02,
                speedY: (Math.random() - 0.5) * 0.02,
                speedZ: (Math.random() - 0.5) * 0.02
            };

            this.rings.push(ringGroup);
            this.group.add(ringGroup);
        });
    }

    update() {
        // Rotate entire group slowly
        this.group.rotation.y += 0.002;

        // Rotate rings independently
        this.rings.forEach(ring => {
            ring.rotation.x += ring.userData.speedX;
            ring.rotation.y += ring.userData.speedY;
            ring.rotation.z += ring.userData.speedZ;
        });
    }

    setTheme(isLight) {
        if (isLight) {
            this.materials.core.color.setHex(0xf1f5f9); // Light Gray
            this.materials.core.emissive.setHex(0x0ea5e9);
            this.materials.wireframe.color.setHex(0x0284c7); // Darker Blue
            this.materials.node.color.setHex(0x0ea5e9);
            this.materials.node.emissive.setHex(0x0ea5e9);
            this.materials.ring.color.setHex(0x64748b);
        } else {
            this.materials.core.color.setHex(0x0f172a); // Dark Navy
            this.materials.core.emissive.setHex(0x0ea5e9);
            this.materials.wireframe.color.setHex(0x38bdf8); // Cyan
            this.materials.node.color.setHex(0x22d3ee);
            this.materials.node.emissive.setHex(0x22d3ee);
            this.materials.ring.color.setHex(0x94a3b8);
        }
    }
}

// --- Initialization ---
const network = new TechNetwork(scene);
const nexus = new IoTNexus(scene);

// --- Lighting ---
const lights = {
    ambient: new THREE.AmbientLight(0xffffff, 0.5),
    key: new THREE.DirectionalLight(0x38bdf8, 2), // Cyan Key
    rim: new THREE.DirectionalLight(0xffffff, 2), // White Rim
    fill: new THREE.DirectionalLight(0x6366f1, 1) // Indigo Fill
};

lights.key.position.set(-5, 5, 5);
lights.rim.position.set(5, 0, -5);
lights.fill.position.set(5, -5, 5);

scene.add(lights.ambient, lights.key, lights.rim, lights.fill);

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    network.update();
    nexus.update();
    controls.update();

    renderer.render(scene, camera);
}
animate();

// --- Scroll Interaction ---
function onScroll() {
    const t = document.body.getBoundingClientRect().top;

    // Rotate Nexus based on scroll
    nexus.group.rotation.x = t * 0.0005;
    nexus.group.position.z = t * 0.005;

    // Move Camera
    camera.position.y = 5 + t * -0.002;
}
document.body.onscroll = onScroll;

// --- Theme Handling ---
function updateTheme(isLight) {
    // 1. Background Color & Fog
    const bgHex = isLight ? 0xf0f4f8 : 0x0b0f19;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.02);

    // 2. Network
    network.setTheme(isLight);

    // 3. Nexus
    nexus.setTheme(isLight);

    // 4. Lighting
    if (isLight) {
        lights.ambient.intensity = 1.0;
        lights.key.intensity = 1.5;
        lights.rim.intensity = 1.0;
    } else {
        lights.ambient.intensity = 0.5;
        lights.key.intensity = 2.0;
        lights.rim.intensity = 2.0;
    }
}

// Initial Theme Check
const themeSwitch = document.getElementById('theme-switch');
const body = document.body;

if (localStorage.getItem('theme') === 'light') {
    body.setAttribute('data-theme', 'light');
    if (themeSwitch) themeSwitch.checked = true;
    updateTheme(true);
} else {
    updateTheme(false);
}

if (themeSwitch) {
    themeSwitch.addEventListener('change', (e) => {
        if (e.target.checked) {
            body.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            updateTheme(true);
        } else {
            body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
            updateTheme(false);
        }
    });
}

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- UI Interactions ---
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 500);
    }
});

// Mobile Nav
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-links li');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('toggle');
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('toggle');
        });
    });
}

// Scroll Reveal
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.scroll-reveal').forEach(el => {
    observer.observe(el);
});

// Typewriter Effect
const typeWriterElement = document.getElementById('typewriter');
const phrases = ['( IoT Specialist )', '( Robotics Engineer )', '( Firmware Developer )'];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 100;

function type() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
        typeWriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50;
    } else {
        typeWriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 100;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
        isDeleting = true;
        typeSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 500;
    }

    setTimeout(type, typeSpeed);
}

if (typeWriterElement) {
    type();
}

// Spotlight Effect
const cards = document.querySelectorAll('.project-card, .skill-category, .timeline-item, .contact-card');

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        // 3D Tilt
        const width = rect.width;
        const height = rect.height;
        const centerX = rect.left + width / 2;
        const centerY = rect.top + height / 2;
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        const rotateX = (mouseY / (height / 2)) * -5;
        const rotateY = (mouseX / (width / 2)) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
});

// --- 5-Project Auto-Carousel Logic (Seamless Loop) ---
const trackfull = document.querySelector('.carousel-track-full');
if (trackfull) {
    let slides = Array.from(trackfull.children);
    const intervalTime = 4000; // 4 seconds
    let carouselInterval;
    let isTransitioning = false;

    const getVisibleCount = () => {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    };

    const nextSlide = () => {
        if (isTransitioning) return;
        isTransitioning = true;

        const visibleCount = getVisibleCount();
        const slideWidthPct = 100 / visibleCount;

        trackfull.style.transition = 'transform 0.5s ease-in-out';
        trackfull.style.transform = `translateX(-${slideWidthPct}%)`;

        setTimeout(() => {
            trackfull.style.transition = 'none';
            trackfull.appendChild(trackfull.firstElementChild);
            trackfull.style.transform = 'translateX(0)';

            // Re-sync array if needed, but DOM order dictates display

            setTimeout(() => {
                isTransitioning = false;
            }, 50);
        }, 500); // Match CSS transition duration
    };

    const prevSlide = () => {
        if (isTransitioning) return;
        isTransitioning = true;

        const visibleCount = getVisibleCount();
        const slideWidthPct = 100 / visibleCount;

        // Move last item to start immediately without transition
        trackfull.style.transition = 'none';
        trackfull.insertBefore(trackfull.lastElementChild, trackfull.firstElementChild);
        trackfull.style.transform = `translateX(-${slideWidthPct}%)`;

        setTimeout(() => {
            trackfull.style.transition = 'transform 0.5s ease-in-out';
            trackfull.style.transform = 'translateX(0)';

            setTimeout(() => {
                isTransitioning = false;
            }, 500);
        }, 50);
    };

    // Auto Play
    const startInterval = () => {
        carouselInterval = setInterval(nextSlide, intervalTime);
    };

    const resetInterval = () => {
        clearInterval(carouselInterval);
        startInterval();
    };

    // Event Listeners
    document.querySelector('.next-btn')?.addEventListener('click', () => {
        nextSlide();
        resetInterval();
    });

    document.querySelector('.prev-btn')?.addEventListener('click', () => {
        prevSlide();
        resetInterval();
    });

    // Pause on hover
    document.querySelector('.carousel-container-full')?.addEventListener('mouseenter', () => {
        clearInterval(carouselInterval);
    });

    document.querySelector('.carousel-container-full')?.addEventListener('mouseleave', () => {
        startInterval();
    });

    // Start
    startInterval();

    // Hide indicators since they don't map well to infinite DOM shuffling without complexity
    const indContainer = document.querySelector('.carousel-indicators');
    if (indContainer) indContainer.style.display = 'none';
}
