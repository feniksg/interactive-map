<template>
    <div class="wrapper">
        <div class="ui">
            <button :class="{ active: activeFloor === 1 }" @click="setFloor(1)">
                Этаж 1
            </button>

            <button :class="{ active: activeFloor === 2 }" @click="setFloor(2)">
                Этаж 2
            </button>
        </div>

        <div ref="container" class="three-container"></div>
    </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { onMounted, ref } from 'vue'

const container = ref<HTMLDivElement | null>(null)

const activeFloor = ref<1 | 2>(1)

let renderer: THREE.WebGLRenderer | null = null
let controls: OrbitControls | null = null

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

let modelRoot: THREE.Object3D | null = null


let selectedMesh: THREE.Mesh | null = null
let selectedPrevMaterial: THREE.Material | null = null

// Ссылки на этажи
let floor1: THREE.Object3D | null = null
let floor2: THREE.Object3D | null = null

function applyFloorVisibility() {
    if (!floor1 || !floor2) return

    floor1.visible = activeFloor.value === 1
    floor2.visible = activeFloor.value === 2
}

function setFloor(floor: 1 | 2) {
    activeFloor.value = floor
    applyFloorVisibility()
}

function getRaycastRoot(): THREE.Object3D {
    // если этажи определены — кликаем ТОЛЬКО по активному
    if (floor1 && floor2) {
        return activeFloor.value === 1 ? floor1 : floor2
    }
    // fallback, если этажи не найдены
    return modelRoot!
}


function highlightRoom(mesh: THREE.Mesh) {
    // снять выделение с прошлого объекта
    if (selectedMesh && selectedPrevMaterial) {
        selectedMesh.material = selectedPrevMaterial
    }

    selectedMesh = mesh
    selectedPrevMaterial = mesh.material as THREE.Material

    // выделяем: подменяем материал на яркий
    mesh.material = new THREE.MeshStandardMaterial({
        color: 0xffd54a,
        emissive: 0x221a00,
        emissiveIntensity: 0.6,
    })
}

function isActuallyVisible(obj: THREE.Object3D) {
    let cur: THREE.Object3D | null = obj
    while (cur) {
        if (cur.visible === false) return false
        cur = cur.parent
    }
    return true
}

onMounted(() => {
    if (!container.value) return

    const width = container.value.clientWidth
    const height = container.value.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf2f2f2)

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000)
    camera.position.set(3, 3, 3)

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Тени
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    container.value.appendChild(renderer.domElement)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.target.set(0, 0, 0)
    controls.update()
    // Свет
    // Общий
    scene.add(new THREE.AmbientLight(0xffffff, 0.35))

    // Направленный
    const dir = new THREE.DirectionalLight(0xffffff, 1.1)
    dir.position.set(6, 10, 6)
    dir.castShadow = true

    // качество теней
    dir.shadow.mapSize.width = 2048
    dir.shadow.mapSize.height = 2048
    dir.shadow.camera.near = 0.5
    dir.shadow.camera.far = 50
    dir.shadow.bias = -0.0001

    scene.add(dir)

    //Выделение
    renderer.domElement.addEventListener('pointerdown', (event) => {
        console.log('CLICK', event.button)
        if (!renderer || !modelRoot || event.button != 0) return

        // координаты клика в пределах canvas
        const rect = renderer.domElement.getBoundingClientRect()
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)

        raycaster.setFromCamera(mouse, camera)

        // ищем пересечение со всеми объектами модели
        const root = (floor1 && floor2)
            ? (activeFloor.value === 1 ? floor1 : floor2)
            : modelRoot

        if (!root) return

        const intersects = raycaster.intersectObjects(root.children, true)
            .filter(i => isActuallyVisible(i.object))
        console.log('INTERSECTS:', intersects.length)
        if (intersects.length) {
            console.log('FIRST:', intersects[0]!.object.name)
        }

        if (!intersects.length) {
            // если клик в пустоту — снять выделение
            if (selectedMesh && selectedPrevMaterial) {
                selectedMesh.material = selectedPrevMaterial
            }
            selectedMesh = null
            selectedPrevMaterial = null
            return
        }

        // первый объект куда попали
        const first = intersects[0]
        if (!first) return
        const obj = first.object

        // выделяем только комнаты
        // (по твоим логам у комнат имена типа room_2037)
        if (obj.name?.startsWith('room_') && (obj as THREE.Mesh).isMesh) {
            highlightRoom(obj as THREE.Mesh)
        }
    })

    // Загрузка GLB
    const loader = new GLTFLoader()
    loader.load('/models/buildingv3.glb', (gltf) => {
        const model = gltf.scene
        scene.add(model)
        modelRoot = model

        model.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
                obj.castShadow = true
                obj.receiveShadow = true
            }
        })

        // 🔎 Найдём этажи по имени
        floor1 = model.getObjectByName('Floor_1') ?? null
        floor2 = model.getObjectByName('Floor_2') ?? null

        if (!floor1 || !floor2) {
            console.warn('Не найдены Floor_1 / Floor_2. Имена в GLB не совпали.')
            console.log('Все объекты модели:')
            model.traverse((o) => {
                if (o.name) console.log(o.name)
            })
            return
        }

        // применим видимость по умолчанию
        applyFloorVisibility()

        // (необязательно) центрируем камеру по модели
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        controls!.target.copy(center)
        controls!.update()

        const maxDim = Math.max(size.x, size.y, size.z)
        camera.position.set(center.x + maxDim, center.y + maxDim, center.z + maxDim)
        camera.near = maxDim / 100
        camera.far = maxDim * 100
        camera.updateProjectionMatrix()
    })

    const animate = () => {
        requestAnimationFrame(animate)
        controls?.update()
        renderer?.render(scene, camera)
    }

    animate()
})
</script>

<style scoped>
.wrapper {
    position: relative;
    width: 100%;
    height: 100%;
}

.three-container {
    width: 100%;
    height: 100%;
}

.ui {
    position: absolute;
    top: 16px;
    left: 16px;
    z-index: 10;
    display: flex;
    gap: 10px;
}

button {
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid #d0d0d0;
    background: white;
    cursor: pointer;
    font-weight: 600;
}

button.active {
    background: #111;
    color: white;
    border-color: #111;
}
</style>
