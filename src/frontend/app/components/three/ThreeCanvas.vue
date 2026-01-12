<template>
  <div ref="container" class="three-container"></div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { onMounted, ref } from 'vue'

const container = ref<HTMLDivElement | null>(null)

onMounted(() => {
  if (!container.value) return

  const width = container.value.clientWidth
  const height = container.value.clientHeight

  // Scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf2f2f2)

  // Camera
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100)
  camera.position.set(3, 3, 3)

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  container.value.appendChild(renderer.domElement)

  // Controls ✅
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 0, 0)
  controls.update()

  // Light
  scene.add(new THREE.AmbientLight(0xffffff, 0.8))
  const dir = new THREE.DirectionalLight(0xffffff, 0.8)
  dir.position.set(5, 5, 5)
  scene.add(dir)

  // Cube
  const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshStandardMaterial({ color: 0xebdc34 })
    )
    cube1.position.set(-1.5, 0, 0)
    scene.add(cube1)

    // Куб 2
    const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshStandardMaterial({ color: 0x2727e8 })
    )
    cube2.position.set(1.5, 0, 0)
    scene.add(cube2)

  // Render loop (нужен для controls)
  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }

  animate()
})
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 100%;
}
</style>
