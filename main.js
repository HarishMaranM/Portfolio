import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene Setup
const scene = new THREE.Scene();
// Fog for depth - adapts to theme
scene.fog = new THREE.FogExp2(0x030305, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    alpha: true,
    antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// --- Particle System (Alive Background) ---
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 800; // Increased count

const posArray = new Float32Array(particlesCount * 3);
const particles = [];

for (let i = 0; i < particlesCount; i++) {
    // Spread particles wide
    posArray[i * 3] = (Math.random() - 0.5) * 100;
    posArray[i * 3 + 1] = (Math.random() - 0.5) * 100;
    posArray[i * 3 + 2] = (Math.random() - 0.5) * 50;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Create individual mesh particles for better control
const particleGroup = new THREE.Group();
scene.add(particleGroup);

// Shapes: Icosahedron (Techy), Sphere (Soft), Box (Data)
const geometries = [
    new THREE.IcosahedronGeometry(0.4, 0), // Increased size
    new THREE.SphereGeometry(0.3, 8, 8),   // Increased size
    new THREE.BoxGeometry(0.4, 0.4, 0.4)   // Increased size
];

const materialBase = new THREE.MeshStandardMaterial({
    color: 0x334155,
    transparent: true,
    opacity: 0.8,
    roughness: 0.4,
    metalness: 0.8
});

// Vibrant Palette
const vibrantColors = [
    0xffd700, // Gold
    0x9333ea, // Deep Purple
    0x22d3ee, // Bright Cyan
    0xf472b6, // Hot Pink
    0xf97316  // Orange
];

for (let i = 0; i < particlesCount; i++) {
    const geom = geometries[Math.floor(Math.random() * geometries.length)];
    const material = materialBase.clone();
    const particle = new THREE.Mesh(geom, material);

    particle.position.set(
        (Math.random() - 0.5) * 150, // Wider spread
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 80 - 10
    );

    particle.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

    // Randomize scale
    const scale = Math.random() * 0.6 + 0.4;
    particle.scale.set(scale, scale, scale);

    // Assign Vibrant Colors
    const colorHex = vibrantColors[Math.floor(Math.random() * vibrantColors.length)];
    material.color.setHex(colorHex);
    material.emissive.setHex(colorHex);
    material.emissiveIntensity = 1.5;

    particle.userData = {
        rotationSpeed: {
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02
        },
        floatSpeed: Math.random() * 0.005 + 0.002,
        floatOffset: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinkleOffset: Math.random() * Math.PI * 2,
        originalY: particle.position.y,
        originalX: particle.position.x,
        originalZ: particle.position.z,
        baseColor: colorHex
    };

    particles.push(particle);
    particleGroup.add(particle);
}


// --- 3D Drone Model (Procedural) ---
function createDrone() {
    const droneGroup = new THREE.Group();

    // Check current theme
    const isLightMode = document.body.getAttribute('data-theme') === 'light';

    // --- Modern Materials (Theme-Aware) ---
    // Sleek metallic base - High Contrast
    // Dark Mode: Bright Silver (0xe2e8f0) to pop against black
    // Light Mode: Dark Gunmetal (0x1e293b) to pop against white
    const darkMetalMat = new THREE.MeshPhysicalMaterial({
        color: isLightMode ? 0x1e293b : 0xe2e8f0,
        roughness: 0.2,
        metalness: 0.8,
        clearcoat: 1.0
    });

    const detailMat = new THREE.MeshStandardMaterial({
        color: isLightMode ? 0x334155 : 0x94a3b8, // Contrast details
        roughness: 0.5,
        metalness: 0.5
    });

    // Emissive Glows
    const cyanGlowMat = new THREE.MeshStandardMaterial({
        color: 0x22d3ee,
        emissive: 0x22d3ee,
        emissiveIntensity: isLightMode ? 8 : 2, // Very bright in light mode
        toneMapped: false
    });

    const greenGlowMat = new THREE.MeshStandardMaterial({
        color: 0x34d399,
        emissive: 0x34d399,
        emissiveIntensity: isLightMode ? 6 : 2,
        toneMapped: false
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.9,
        roughness: 0.05,
        transmission: 0.9, // Glass-like
        transparent: true,
        opacity: isLightMode ? 0.5 : 0.3
    });

    // Store materials for theme updates
    droneGroup.userData.materials = {
        mainBodyMat: darkMetalMat,
        detailMat: detailMat,
        cyanGlowMat: cyanGlowMat,
        greenGlowMat: greenGlowMat,
        glassMat: glassMat
    };

    // --- Geometry Construction ---

    // 1. Central Core (Sphere)
    const coreGeom = new THREE.SphereGeometry(1.2, 32, 32);
    const core = new THREE.Mesh(coreGeom, darkMetalMat);
    droneGroup.add(core);

    // 2. Glowing "Eye" / Sensor
    const eyeGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 32);
    eyeGeom.rotateX(Math.PI / 2);
    const eye = new THREE.Mesh(eyeGeom, cyanGlowMat);
    eye.position.set(0, 0, 1.1);
    droneGroup.add(eye);

    // 3. Rotating Rings (Gyroscope feel)
    const ringGroup = new THREE.Group();
    droneGroup.add(ringGroup);

    const ring1Geom = new THREE.TorusGeometry(1.8, 0.08, 16, 100);
    const ring1 = new THREE.Mesh(ring1Geom, detailMat);
    ringGroup.add(ring1);

    const ring2Geom = new THREE.TorusGeometry(2.2, 0.05, 16, 100);
    const ring2 = new THREE.Mesh(ring2Geom, darkMetalMat);
    ring2.rotation.x = Math.PI / 2;
    ringGroup.add(ring2);

    // 4. Floating "Scanner" Bits
    const scannerGroup = new THREE.Group();
    droneGroup.add(scannerGroup);

    for (let i = 0; i < 3; i++) {
        const podGeom = new THREE.BoxGeometry(0.4, 0.8, 0.4);
        const pod = new THREE.Mesh(podGeom, detailMat);
        const angle = (i / 3) * Math.PI * 2;
        const radius = 2.8;

        pod.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
        pod.lookAt(0, 0, 0);

        // Add glow tip
        const tipGeom = new THREE.BoxGeometry(0.2, 0.2, 0.1);
        const tip = new THREE.Mesh(tipGeom, greenGlowMat);
        tip.position.set(0, 0, 0.2);
        pod.add(tip);

        scannerGroup.add(pod);
    }

    // Animation references
    droneGroup.userData.ringGroup = ringGroup;
    droneGroup.userData.scannerGroup = scannerGroup;

    return droneGroup;
}

const heroGroup = createDrone();
// Position: Right side, facing camera
heroGroup.position.set(8, 0, 0); // Moved further right
heroGroup.scale.set(1.5, 1.5, 1.5); // Increased size
heroGroup.rotation.z = 0.1;
heroGroup.rotation.x = 0.2;
scene.add(heroGroup);

// Lights - Enhanced for Glossy Look
const pointLight = new THREE.PointLight(0xffffff, 800);
pointLight.position.set(15, 15, 15);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);

// Blue Rim Light
const blueRim = new THREE.DirectionalLight(0x22d3ee, 4);
blueRim.position.set(-10, 5, -5);

// Warm Fill Light
const warmFill = new THREE.DirectionalLight(0x34d399, 2);
warmFill.position.set(10, -5, 5);

scene.add(pointLight, ambientLight, blueRim, warmFill);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false;

// Scroll Animation
function moveCamera() {
    const t = document.body.getBoundingClientRect().top;

    if (heroGroup) {
        // Rotate drone based on scroll
        heroGroup.rotation.y = t * 0.0005;
        heroGroup.rotation.z = 0.1 + t * 0.0002;
    }

    camera.position.z = t * -0.01 + 30;
    camera.position.x = t * -0.0002;
    camera.rotation.y = t * -0.0002;
}

document.body.onscroll = moveCamera;
moveCamera();

// Mouse Interaction
const mouse = new THREE.Vector2();
const target = new THREE.Vector2();
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX - windowHalfX);
    mouse.y = (event.clientY - windowHalfY);
});

// Animation Loop
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    target.x = (1 - mouse.x) * 0.002;
    target.y = (1 - mouse.y) * 0.002;

    // Animate particles - subtle movements + Mouse Interaction
    particles.forEach(particle => {
        // Gentle rotation for geometric shapes
        particle.rotation.x += particle.userData.rotationSpeed.x;
        particle.rotation.y += particle.userData.rotationSpeed.y;
        particle.rotation.z += particle.userData.rotationSpeed.z;

        // Float animation
        const floatY = Math.sin(time * particle.userData.floatSpeed + particle.userData.floatOffset) * 0.5;

        // Mouse Repulsion Logic
        const dx = mouse.x - (particle.position.x * 20); // Scale factor for screen space
        const dy = -mouse.y - (particle.position.y * 20);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repulsionRadius = 300;

        if (dist < repulsionRadius) {
            const force = (repulsionRadius - dist) / repulsionRadius;
            const angle = Math.atan2(dy, dx);

            particle.position.x -= Math.cos(angle) * force * 0.5;
            particle.position.y -= Math.sin(angle) * force * 0.5;
        } else {
            // Return to original position slowly
            particle.position.x += (particle.userData.originalX - particle.position.x) * 0.02;
            particle.position.y += ((particle.userData.originalY + floatY) - particle.position.y) * 0.02;
        }

        // Enhanced Twinkle effect
        particle.material.opacity =
            0.6 + Math.sin(time * particle.userData.twinkleSpeed * 3 + particle.userData.twinkleOffset) * 0.4;
    });


    if (heroGroup) {
        // Gentle hovering animation
        heroGroup.position.y = Math.sin(time * 1.5) * 0.5;

        // Rotate Rings
        if (heroGroup.userData.ringGroup) {
            heroGroup.userData.ringGroup.rotation.x += 0.01;
            heroGroup.userData.ringGroup.rotation.y += 0.015;
        }

        // Scanner movement
        if (heroGroup.userData.scannerGroup) {
            heroGroup.userData.scannerGroup.rotation.z = Math.sin(time) * 0.2;
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// UI Interactions

// Loader
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
});

// Theme Toggle
const themeSwitch = document.getElementById('theme-switch');
const body = document.body;

// Function to update 3D elements based on theme
function updateTheme(isLight) {
    // Update drone materials
    if (heroGroup && heroGroup.userData.materials) {
        const mats = heroGroup.userData.materials;

        // Update body colors
        // High Contrast: Dark Gunmetal (Light Mode) vs Bright Silver (Dark Mode)
        mats.mainBodyMat.color.setHex(isLight ? 0x1e293b : 0xe2e8f0);
        mats.detailMat.color.setHex(isLight ? 0x334155 : 0x94a3b8);

        // Update glow intensities
        mats.cyanGlowMat.emissiveIntensity = isLight ? 8 : 2;
        mats.greenGlowMat.emissiveIntensity = isLight ? 6 : 2;
        mats.glassMat.opacity = isLight ? 0.5 : 0.3;
    }

    // Update particle visibility - Keep vibrant colors in both modes
    particles.forEach(particle => {
        // Just ensure opacity is good
        particle.material.opacity = isLight ? 0.9 : 0.8;
    });

    // Update fog
    scene.fog.color.setHex(isLight ? 0xf8fafc : 0x030305);
}

// Check local storage
if (localStorage.getItem('theme') === 'light') {
    body.setAttribute('data-theme', 'light');
    if (themeSwitch) themeSwitch.checked = true;
    updateTheme(true);
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

// Mobile Navigation
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

// --- Interactive Enhancements ---

// 1. Custom Cursor Logic
// 1. Custom Cursor Logic Removed

// 2. Spotlight Effect
const cards = document.querySelectorAll('.project-card, .skill-category, .timeline-item, .contact-card');

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        // 3. 3D Tilt Effect
        const width = rect.width;
        const height = rect.height;

        const centerX = rect.left + width / 2;
        const centerY = rect.top + height / 2;

        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        const rotateX = (mouseY / (height / 2)) * -5; // Max -5deg to 5deg
        const rotateY = (mouseX / (width / 2)) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
});

// 4. Parallax Effect for Header
const header = document.querySelector('header');
const headerTitle = document.querySelector('h1');

if (header && headerTitle) {
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY < window.innerHeight) {
            headerTitle.style.transform = `translateY(${scrollY * 0.3}px)`;
            header.style.opacity = 1 - scrollY / 700;
        }
    });
}
