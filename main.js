import * as THREE from 'three';

// Setup scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// Create planet
const createPlanet = () => {
  // Planet core
  const planetGeometry = new THREE.SphereGeometry(5, 64, 64);
  const planetMaterial = new THREE.MeshStandardMaterial({
    color: 0x4ecdc4,
    metalness: 0.7,
    roughness: 0.5,
  });
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);

  // Atmosphere
  const atmosphereGeometry = new THREE.SphereGeometry(5.3, 64, 64);
  const atmosphereMaterial = new THREE.MeshPhongMaterial({
    color: 0x4ecdc4,
    transparent: true,
    opacity: 0.3,
    side: THREE.BackSide
  });
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  planet.add(atmosphere);

  // Rings
  const ringGeometry = new THREE.TorusGeometry(8, 0.5, 16, 100);
  const ringMaterial = new THREE.MeshPhongMaterial({
    color: 0x4ecdc4,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2;
  planet.add(ring);

  // Add surface detail with displacement
  const displacementGeometry = new THREE.SphereGeometry(5.1, 64, 64);
  const displacementMaterial = new THREE.MeshPhongMaterial({
    color: 0x2a9d8f,
    transparent: true,
    opacity: 0.5,
    wireframe: true
  });
  const displacement = new THREE.Mesh(displacementGeometry, displacementMaterial);
  planet.add(displacement);

  return planet;
};

const planet = createPlanet();
planet.position.set(15, 0, -20); // Start position on the right
scene.add(planet);

// Create stars
const createStars = () => {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 3000;
  const posArray = new Float32Array(starCount * 3);
  
  for(let i = 0; i < starCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 100;
  }
  
  starGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const starMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0xffffff,
  });
  
  return new THREE.Points(starGeometry, starMaterial);
};

const stars = createStars();
scene.add(stars);

// Lighting
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(pointLight, ambientLight);

// Additional accent lights for the planet
const accentLight1 = new THREE.PointLight(0x4ecdc4, 2, 50);
accentLight1.position.set(20, 10, -20);
const accentLight2 = new THREE.PointLight(0x2a9d8f, 2, 50);
accentLight2.position.set(-20, -10, -20);
scene.add(accentLight1, accentLight2);

// Calculate scroll progress
const getScrollProgress = () => {
  const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
  return window.scrollY / totalHeight;
};

// Planet path parameters
const pathRadius = 30;
const startAngle = -Math.PI / 4; // Start on the right
const endAngle = -Math.PI - Math.PI / 4; // End on the left
const totalRotation = 2 * Math.PI; // Full rotation around its axis

// Handle scroll animation
function moveCamera() {
  const progress = getScrollProgress();
  
  // Calculate planet position along curved path
  const angle = startAngle + (endAngle - startAngle) * progress;
  const x = Math.cos(angle) * pathRadius;
  const z = Math.sin(angle) * pathRadius - 20;
  
  planet.position.x = x;
  planet.position.z = z;
  
  // Rotate planet based on scroll
  planet.rotation.y = progress * totalRotation;
  planet.rotation.z = progress * (Math.PI / 4);
  
  // Tilt the rings dynamically
  const ringTilt = Math.sin(progress * Math.PI * 2) * 0.3;
  planet.children[1].rotation.x = Math.PI / 2 + ringTilt;
  
  // Move camera slightly
  camera.position.x = Math.sin(progress * Math.PI) * 5;
  camera.position.y = Math.cos(progress * Math.PI) * 3;
  
  // Rotate star field
  stars.rotation.y = progress * 0.5;
  stars.rotation.z = progress * 0.3;
}


const createGalaxy = () => {
  const particles = new THREE.BufferGeometry();
  const particleCount = 1000;
  
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  const colorChoices = [
    new THREE.Color(0x4ecdc4),
    new THREE.Color(0xff6b6b),
    new THREE.Color(0x95a5a6),
    new THREE.Color(0x2ecc71)
  ];
  
  for(let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const radius = Math.random() * 100;
    const spinAngle = radius * 5;
    const branchAngle = (i % 3) * ((2 * Math.PI) / 3);
    
    const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1);
    const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1);
    const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1);
    
    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
    
    const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }
  
  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: false
  });
  
  return new THREE.Points(particles, particleMaterial);
};

const galaxy = createGalaxy();
scene.add(galaxy);
galaxy.rotateX(15)
document.body.onscroll = moveCamera;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  galaxy.rotation.y += 0.0005;

  // Constant rotation for planet
  planet.rotation.y += 0.001;
  
  // Gentle star field rotation
  stars.rotation.y += 0.0001;
  
  // Subtle atmosphere pulse
  const time = Date.now() * 0.001;
  planet.children[0].material.opacity = 0.3 + Math.sin(time) * 0.1;
  
  // Dynamic ring opacity
  planet.children[1].material.opacity = 0.6 + Math.sin(time * 0.5) * 0.1;
  
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();