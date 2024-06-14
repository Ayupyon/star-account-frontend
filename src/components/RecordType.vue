<script setup>
const props = defineProps(["type"]);

const iconTypes = [
  ['fas', 'utensils'],
  ['fas', 'cart-shopping'],
  ['fas', 'train'],
  ['fas', 'palette'],
  ['fas', 'graduation-cap'],
  ['fas', 'briefcase'],
  ['fas', 'gift'],
]
</script>

<template>
  <span class="icon">
    <font-awesome-icon :icon="iconTypes[type - 1]" />
  </span>
</template>