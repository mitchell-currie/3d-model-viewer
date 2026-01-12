# 3D Model Viewer - Computer Vision Demo

A visually stunning 3D model viewer built with Three.js, featuring advanced lighting, real-time shadows, and interactive controls. Perfect for computer vision and graphics demonstrations.

## [Live Demo](https://mitchell-currie.github.io/3d-model-viewer/)

Try it out: **https://mitchell-currie.github.io/3d-model-viewer/**

## Features

- **Multiple Geometries**: Torus Knot, Sphere, Dodecahedron, Octahedron, Icosahedron
- **Material Options**: Standard, Physical, Metallic, Glass (with transparency)
- **Environment Mapping**:
  - Gradient skybox with customizable top/horizon/bottom colors
  - Cubemap with 6-face color customization
  - Real-time environment reflections on metallic surfaces
- **Advanced Lighting**:
  - Directional light with shadow mapping
  - Draggable point lights with 3D gizmos (X/Y/Z axes)
  - Real-time shadow casting
- **Interactive Camera Controls**:
  - Left mouse: Rotate object
  - Right mouse: Orbit camera around object
  - Mouse wheel: Zoom in/out
  - Touch support for mobile devices
- **Light Manipulation**:
  - Hold SHIFT + drag light balls to move freely
  - Hold SHIFT + drag colored arrows for axis-constrained movement (X=red, Y=green, Z=blue)
- **Performance Optimized**: 60 FPS with real-time stats
- **Fully Responsive**: Works on desktop and mobile devices
- **Industrial UI**: Dark, technical interface inspired by professional 3D tools

## Technologies

- Three.js r128
- WebGL
- HTML5/CSS3
- Vanilla JavaScript

## Usage

Simply open `index.html` in a modern web browser. No build process required!

## Controls

### Mouse Controls
- **Left Click + Drag**: Manually rotate the model
- **Right Click + Drag**: Orbit camera around the model
- **Mouse Wheel**: Zoom in/out
- **SHIFT + Drag Light Ball**: Move light in screen space
- **SHIFT + Drag Arrow Gizmo**: Move light along specific axis (Red=X, Green=Y, Blue=Z)

### UI Controls
- **Rotation Speed Slider**: Adjust auto-rotation speed (0-5x)
- **Geometry Dropdown**: Switch between different 3D shapes
- **Material Dropdown**: Change material properties (Standard, Physical, Metallic, Glass)
- **Wireframe Checkbox**: Toggle wireframe rendering
- **Auto Rotate Checkbox**: Enable/disable automatic rotation
- **Environment Type**: Switch between gradient skybox and cubemap
- **Skybox Colors**: Customize top, horizon, and bottom gradient colors
- **Gradient Exponent**: Control the thickness of the horizon band
- **Cubemap Colors**: Set individual colors for all 6 cube faces

## Browser Support

Works in all modern browsers that support WebGL:
- Chrome 9+
- Firefox 4+
- Safari 5.1+
- Edge 12+
- Opera 12+

## License

MIT
