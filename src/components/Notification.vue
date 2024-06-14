<script setup>
const props = defineProps([
  'notificationType',
  'iconType',
  'displayMessage'
]);
</script>

<template>
  <div class="star-notification notification is-light"
       :class="notificationType">
    <span class="icon-text">
      <span class="icon">
        <font-awesome-icon class="icon" :icon="iconType" />
      </span>
      <span>
        {{ displayMessage }}
      </span>
    </span>
  </div>
</template>

<style scoped>
.star-notification {
  position: fixed;
  z-index: 100;
  top: 5%;
  opacity: 75%;
  left: 50%; /* 水平方向定位到视窗的中心 */
  transform: translate(-50%, 0%); /* 向左和向上移动自身宽度和高度的50% */
}
</style>