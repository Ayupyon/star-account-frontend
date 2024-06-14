<script setup>
import pattern from "@/assets/background_pattern.png"
// import circleBase from "@/assets/background_circlebase.png"
// import circleLine from "@/assets/background_circleline.png"
import { onMounted } from "vue";

class Pair {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

let windowSize = new Pair(window.innerWidth, window.innerHeight);
const patternSize = new Pair(267, 200);
// const circleBaseSize = new Pair(400, 400);
// const circleLineSize = new Pair(400, 400);

let ctx = null;

let patternCanvas = null;

function initPatternCanvas() {
  let patternCanvas = document.createElement("canvas");
  patternCanvas.width = windowSize.x + patternSize.x;
  patternCanvas.height = windowSize.y + patternSize.y;

  let patternImage = new Image();
  patternImage.src = pattern;
  patternImage.onload = () => {
    let ctx = patternCanvas.getContext("2d");
    ctx.fillStyle = ctx.createPattern(patternImage, "repeat");
    ctx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
  };

  return patternCanvas;
}

function draw() {
  const currentTime = new Date().getTime();
  const patternPositionPercent = (currentTime % 14000) / 14000;
  // const circlePositionPercent = (currentTime % 40000) / 40000;

  ctx.clearRect(0, 0, windowSize.x, windowSize.y);

  const patternOffset = new Pair(
    -patternSize.x + patternPositionPercent * patternSize.x,
    -patternPositionPercent * patternSize.y
  );
  ctx.drawImage(patternCanvas, patternOffset.x, patternOffset.y);

  requestAnimationFrame(draw);
}

onMounted(() => {
  ctx = document.getElementById("background").getContext("2d");
  patternCanvas = initPatternCanvas();
  window.onresize = () => {
    windowSize = new Pair(window.innerWidth, window.innerHeight);
    patternCanvas = initPatternCanvas();
  }
  draw();
});
</script>

<template>
  <canvas id="background" :width="windowSize.x" :height="windowSize.y"></canvas>
</template>

<style scoped>
#background {
  position: fixed;
  z-index: -1000;
  top: 0;
}
</style>