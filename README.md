# Interactive 3D Map

Prototype of an interactive indoor navigation system built with Nuxt and Three.js.

The project demonstrates rendering and interaction with a 3D building model directly in the browser.

## Features

- Interactive 3D scene
- GLTF model loading
- Multiple building floors
- Floor switching
- Room selection and highlighting
- Camera controls
- Route visualization using predefined waypoints
- Animated movement along the generated route
- GPU resource cleanup for dynamically created objects

## Tech Stack

- Vue 3
- Nuxt 4
- TypeScript
- Three.js
- WebGL
- SCSS
- Nginx

## How It Works

The application loads a GLTF building model into a Three.js scene.

Rooms and other objects can be detected using raycasting.

Navigation paths are built using waypoint objects stored inside the 3D model. The route is rendered as a Three.js TubeGeometry, while an animated marker can move along the generated curve.

The application also supports switching between individual floors of the building.

## Project Structure

.
├── nginx/
└── src/
    └── frontend/
        ├── app/
        │   ├── components/
        │   │   └── three/
        │   └── pages/
        ├── public/
        ├── nuxt.config.ts
        └── package.json

## Installation

cd src/frontend
npm install

## Development

npm run dev

## Production Build

npm run build

Preview production build:

npm run preview

## Status

Prototype / work in progress.

The project is being developed as an experiment in browser-based 3D indoor navigation.
