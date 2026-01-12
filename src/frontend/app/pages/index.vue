<template>
  <div class="page">
    <div class="canvas-wrapper">
      <div class="canvas-box">
        <ThreeCanvas />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ThreeCanvas from '@/components/three/ThreeCanvas.vue'
</script>

<style lang="scss">
.page {
  width: 100vw;
  height: 100vh;
}

.canvas-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-box {
  width: 1000px;
  height: 600px;
  border: 2px solid red; // временно, для контроля размеров
}
</style>
