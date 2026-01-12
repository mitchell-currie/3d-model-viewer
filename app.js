// Scene setup
let scene, camera, renderer, mesh;
let rotationSpeed = 1;
let autoRotate = true;
let frameCount = 0;
let lastTime = performance.now();

// Initialize Three.js scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);

    // Create camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 5;

    // Create renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    document.getElementById('container').appendChild(renderer.domElement);

    // Create lights
    createLights();

    // Create initial geometry
    createGeometry('torusKnot', 'standard');

    // Add event listeners
    setupControls();

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Start animation loop
    animate();
}

function createLights() {
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Main directional light with shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);

    // Rim light (back light for edge definition)
    const rimLight = new THREE.DirectionalLight(0x667eea, 0.8);
    rimLight.position.set(-5, 0, -5);
    scene.add(rimLight);

    // Point light for dynamic color
    const pointLight1 = new THREE.PointLight(0xff00ff, 1, 50);
    pointLight1.position.set(3, 3, 3);
    scene.add(pointLight1);

    // Second point light for fill
    const pointLight2 = new THREE.PointLight(0x00ffff, 0.8, 50);
    pointLight2.position.set(-3, -3, 3);
    scene.add(pointLight2);

    // Hemisphere light for natural gradient
    const hemisphereLight = new THREE.HemisphereLight(0x667eea, 0x764ba2, 0.3);
    scene.add(hemisphereLight);
}

function createGeometry(type, materialType) {
    // Remove existing mesh
    if (mesh) {
        scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
    }

    // Create geometry based on type
    let geometry;
    switch (type) {
        case 'torusKnot':
            geometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 32);
            break;
        case 'sphere':
            geometry = new THREE.SphereGeometry(1.5, 64, 64);
            break;
        case 'dodecahedron':
            geometry = new THREE.DodecahedronGeometry(1.5, 1);
            break;
        case 'octahedron':
            geometry = new THREE.OctahedronGeometry(1.5, 2);
            break;
        case 'icosahedron':
            geometry = new THREE.IcosahedronGeometry(1.5, 1);
            break;
        default:
            geometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 32);
    }

    // Create material based on type
    let material;
    switch (materialType) {
        case 'standard':
            material = new THREE.MeshStandardMaterial({
                color: 0x667eea,
                metalness: 0.3,
                roughness: 0.4,
                envMapIntensity: 1
            });
            break;
        case 'physical':
            material = new THREE.MeshPhysicalMaterial({
                color: 0x764ba2,
                metalness: 0.5,
                roughness: 0.2,
                clearcoat: 1,
                clearcoatRoughness: 0.1
            });
            break;
        case 'metallic':
            material = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                metalness: 1,
                roughness: 0.2,
                envMapIntensity: 1.5
            });
            break;
        case 'glass':
            material = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                metalness: 0,
                roughness: 0,
                transmission: 0.9,
                transparent: true,
                opacity: 0.5,
                ior: 1.5,
                thickness: 0.5
            });
            break;
        default:
            material = new THREE.MeshStandardMaterial({
                color: 0x667eea,
                metalness: 0.3,
                roughness: 0.4
            });
    }

    // Create mesh
    mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // Update stats
    updateStats();
}

function setupControls() {
    // Rotation speed
    const rotationSlider = document.getElementById('rotationSpeed');
    const rotationValue = document.getElementById('rotationValue');
    rotationSlider.addEventListener('input', (e) => {
        rotationSpeed = parseFloat(e.target.value);
        rotationValue.textContent = rotationSpeed.toFixed(1) + 'x';
    });

    // Geometry selection
    const geometrySelect = document.getElementById('geometrySelect');
    geometrySelect.addEventListener('change', (e) => {
        const materialType = document.getElementById('materialSelect').value;
        createGeometry(e.target.value, materialType);
    });

    // Material selection
    const materialSelect = document.getElementById('materialSelect');
    materialSelect.addEventListener('change', (e) => {
        const geometryType = document.getElementById('geometrySelect').value;
        createGeometry(geometryType, e.target.value);
    });

    // Wireframe toggle
    const wireframeCheckbox = document.getElementById('wireframe');
    wireframeCheckbox.addEventListener('change', (e) => {
        if (mesh) {
            mesh.material.wireframe = e.target.checked;
        }
    });

    // Auto-rotate toggle
    const autoRotateCheckbox = document.getElementById('autoRotate');
    autoRotateCheckbox.addEventListener('change', (e) => {
        autoRotate = e.target.checked;
    });

    // Mouse interaction for manual rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    renderer.domElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    renderer.domElement.addEventListener('mousemove', (e) => {
        if (isDragging && mesh) {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            mesh.rotation.y += deltaX * 0.01;
            mesh.rotation.x += deltaY * 0.01;

            previousMousePosition = { x: e.clientX, y: e.clientY };
        }
    });

    renderer.domElement.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Touch support
    renderer.domElement.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            previousMousePosition = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }
    });

    renderer.domElement.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches.length === 1 && mesh) {
            const deltaX = e.touches[0].clientX - previousMousePosition.x;
            const deltaY = e.touches[0].clientY - previousMousePosition.y;

            mesh.rotation.y += deltaX * 0.01;
            mesh.rotation.x += deltaY * 0.01;

            previousMousePosition = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }
    });

    renderer.domElement.addEventListener('touchend', () => {
        isDragging = false;
    });
}

function updateStats() {
    if (mesh) {
        const vertices = mesh.geometry.attributes.position.count;
        document.getElementById('vertices').textContent = vertices.toLocaleString();
    }
}

function updateFPS() {
    frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - lastTime;

    if (elapsed >= 1000) {
        const fps = Math.round((frameCount * 1000) / elapsed);
        document.getElementById('fps').textContent = fps;
        frameCount = 0;
        lastTime = currentTime;
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Auto-rotate mesh
    if (autoRotate && mesh) {
        mesh.rotation.x += 0.005 * rotationSpeed;
        mesh.rotation.y += 0.01 * rotationSpeed;
    }

    // Animate point lights in a circle
    const time = Date.now() * 0.001;
    const lights = scene.children.filter(child => child instanceof THREE.PointLight);
    if (lights.length >= 2) {
        lights[0].position.x = Math.sin(time) * 3;
        lights[0].position.z = Math.cos(time) * 3;

        lights[1].position.x = Math.sin(time + Math.PI) * 3;
        lights[1].position.z = Math.cos(time + Math.PI) * 3;
    }

    // Render scene
    renderer.render(scene, camera);

    // Update FPS
    updateFPS();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
