<template>
  <div class="border border-gray-300 rounded-lg bg-white overflow-hidden">
    <canvas
      ref="canvasRef"
      width="300"
      height="130"
      class="w-full h-32 touch-none cursor-crosshair bg-white"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="stopDrawing"
      @mouseleave="stopDrawing"
      @touchstart.prevent="startDrawingTouch"
      @touchmove.prevent="drawTouch"
      @touchend="stopDrawing"
    ></canvas>
    <div class="bg-gray-50 px-3 py-1.5 border-t flex justify-between items-center text-xs">
      <span class="text-gray-500">Tanda tangan di kotak putih</span>
      <button type="button" @click="clearCanvas" class="text-red-600 font-semibold hover:underline">
        Hapus / Ulangi
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const canvasRef = ref(null)
let ctx = null
let isDrawing = false
const hasSigned = ref(false)

onMounted(() => {
  const canvas = canvasRef.value
  ctx = canvas.getContext('2d')
  ctx.strokeStyle = '#111827'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
})

const getCoords = (e) => {
  const rect = canvasRef.value.getBoundingClientRect()
  const scaleX = canvasRef.value.width / rect.width
  const scaleY = canvasRef.value.height / rect.height
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  }
}

const startDrawing = (e) => {
  isDrawing = true
  hasSigned.value = true
  const { x, y } = getCoords(e)
  ctx.beginPath()
  ctx.moveTo(x, y)
}

const draw = (e) => {
  if (!isDrawing) return
  const { x, y } = getCoords(e)
  ctx.lineTo(x, y)
  ctx.stroke()
}

const startDrawingTouch = (e) => {
  const touch = e.touches[0]
  startDrawing(touch)
}

const drawTouch = (e) => {
  const touch = e.touches[0]
  draw(touch)
}

const stopDrawing = () => {
  isDrawing = false
}

const clearCanvas = () => {
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  hasSigned.value = false
}

defineExpose({
  getSignatureImage: () => (hasSigned.value ? canvasRef.value.toDataURL('image/png') : null),
  clearCanvas
})
</script>