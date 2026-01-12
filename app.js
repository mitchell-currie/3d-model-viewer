// Scene setup
let scene, camera, renderer, mesh, skybox;
let rotationSpeed = 1;
let autoRotate = true;
let frameCount = 0;
let lastTime = performance.now();

// Camera controls
let cameraDistance = 5;
let cameraTheta = 0; // Horizontal angle
let cameraPhi = Math.PI / 2; // Vertical angle (starts at equator)

// Skybox settings
let skyboxSettings = {
    topColor: new THREE.Color(0x1e3c72),
    horizonColor: new THREE.Color(0x7e22ce),
    bottomColor: new THREE.Color(0x2a5298),
    exponent: 2.0
};

// Initialize Three.js scene
function init() {
    // Create scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    updateCameraPosition();

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

    // Create skybox
    createSkybox();

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

function createSkybox() {
    // Create large sphere for skybox
    const skyGeometry = new THREE.SphereGeometry(100, 32, 32);

    // Custom shader for gradient skybox
    const skyMaterial = new THREE.ShaderMaterial({
        uniforms: {
            topColor: { value: skyboxSettings.topColor },
            horizonColor: { value: skyboxSettings.horizonColor },
            bottomColor: { value: skyboxSettings.bottomColor },
            exponent: { value: skyboxSettings.exponent }
        },
        vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 topColor;
            uniform vec3 horizonColor;
            uniform vec3 bottomColor;
            uniform float exponent;
            varying vec3 vWorldPosition;

            void main() {
                float h = normalize(vWorldPosition).y;

                // Create gradient from bottom to top
                vec3 color;
                if (h > 0.0) {
                    // Top half: horizon to top
                    color = mix(horizonColor, topColor, pow(h, exponent));
                } else {
                    // Bottom half: bottom to horizon
                    color = mix(horizonColor, bottomColor, pow(-h, exponent));
                }

                gl_FragColor = vec4(color, 1.0);
            }
        `,
        side: THREE.BackSide
    });

    skybox = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skybox);
}

function updateSkybox() {
    if (skybox && skybox.material.uniforms) {
        skybox.material.uniforms.topColor.value = skyboxSettings.topColor;
        skybox.material.uniforms.horizonColor.value = skyboxSettings.horizonColor;
        skybox.material.uniforms.bottomColor.value = skyboxSettings.bottomColor;
        skybox.material.uniforms.exponent.value = skyboxSettings.exponent;
    }
}

function updateCameraPosition() {
    // Convert spherical coordinates to Cartesian
    camera.position.x = cameraDistance * Math.sin(cameraPhi) * Math.cos(cameraTheta);
    camera.position.y = cameraDistance * Math.cos(cameraPhi);
    camera.position.z = cameraDistance * Math.sin(cameraPhi) * Math.sin(cameraTheta);

    // Look at center
    camera.lookAt(0, 0, 0);
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

    // Skybox controls
    const skyTopColor = document.getElementById('skyTopColor');
    skyTopColor.addEventListener('input', (e) => {
        skyboxSettings.topColor.set(e.target.value);
        updateSkybox();
    });

    const skyHorizonColor = document.getElementById('skyHorizonColor');
    skyHorizonColor.addEventListener('input', (e) => {
        skyboxSettings.horizonColor.set(e.target.value);
        updateSkybox();
    });

    const skyBottomColor = document.getElementById('skyBottomColor');
    skyBottomColor.addEventListener('input', (e) => {
        skyboxSettings.bottomColor.set(e.target.value);
        updateSkybox();
    });

    const skyExponent = document.getElementById('skyExponent');
    const skyExponentValue = document.getElementById('skyExponentValue');
    skyExponent.addEventListener('input', (e) => {
        skyboxSettings.exponent = parseFloat(e.target.value);
        skyExponentValue.textContent = skyboxSettings.exponent.toFixed(1);
        updateSkybox();
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

    // Mouse interaction for manual rotation and camera control
    let isDraggingObject = false;
    let isDraggingCamera = false;
    let previousMousePosition = { x: 0, y: 0 };

    renderer.domElement.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            // Left mouse button - rotate object
            isDraggingObject = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        } else if (e.button === 2) {
            // Right mouse button - orbit camera
            isDraggingCamera = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        }
    });

    renderer.domElement.addEventListener('mousemove', (e) => {
        if (isDraggingObject && mesh) {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            mesh.rotation.y += deltaX * 0.01;
            mesh.rotation.x += deltaY * 0.01;

            previousMousePosition = { x: e.clientX, y: e.clientY };
        } else if (isDraggingCamera) {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            // Update camera angles
            cameraTheta -= deltaX * 0.01;
            cameraPhi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraPhi + deltaY * 0.01));

            updateCameraPosition();

            previousMousePosition = { x: e.clientX, y: e.clientY };
        }
    });

    renderer.domElement.addEventListener('mouseup', (e) => {
        if (e.button === 0) {
            isDraggingObject = false;
        } else if (e.button === 2) {
            isDraggingCamera = false;
        }
    });

    // Prevent context menu on right click
    renderer.domElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // Mouse wheel for zoom
    renderer.domElement.addEventListener('wheel', (e) => {
        e.preventDefault();
        cameraDistance += e.deltaY * 0.01;
        cameraDistance = Math.max(2, Math.min(20, cameraDistance));
        updateCameraPosition();
    });

    // Touch support
    let touchStartDistance = 0;

    renderer.domElement.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            // Single touch - rotate object
            isDraggingObject = true;
            previousMousePosition = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        } else if (e.touches.length === 2) {
            // Two finger touch - orbit camera
            isDraggingCamera = true;
            previousMousePosition = {
                x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                y: (e.touches[0].clientY + e.touches[1].clientY) / 2
            };
            // Store initial distance for pinch zoom
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            touchStartDistance = Math.sqrt(dx * dx + dy * dy);
        }
    });

    renderer.domElement.addEventListener('touchmove', (e) => {
        e.preventDefault();

        if (isDraggingObject && e.touches.length === 1 && mesh) {
            const deltaX = e.touches[0].clientX - previousMousePosition.x;
            const deltaY = e.touches[0].clientY - previousMousePosition.y;

            mesh.rotation.y += deltaX * 0.01;
            mesh.rotation.x += deltaY * 0.01;

            previousMousePosition = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        } else if (e.touches.length === 2) {
            const currentX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const currentY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

            if (isDraggingCamera) {
                const deltaX = currentX - previousMousePosition.x;
                const deltaY = currentY - previousMousePosition.y;

                cameraTheta -= deltaX * 0.01;
                cameraPhi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraPhi + deltaY * 0.01));

                updateCameraPosition();
            }

            // Pinch to zoom
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const delta = touchStartDistance - distance;

            cameraDistance += delta * 0.01;
            cameraDistance = Math.max(2, Math.min(20, cameraDistance));
            updateCameraPosition();

            touchStartDistance = distance;

            previousMousePosition = { x: currentX, y: currentY };
        }
    });

    renderer.domElement.addEventListener('touchend', () => {
        isDraggingObject = false;
        isDraggingCamera = false;
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
