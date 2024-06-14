<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Login from './components/Login.vue'
import Background from './components/Background.vue'
import AccountList from './components/AccountList.vue'
import RecordList from './components/RecordList.vue'
</script>

<template>
  <Navbar />
  <router-view v-slot="{ Component }">
    <transition mode="out-in">
      <component :is="Component"/>
    </transition>
  </router-view>
  <!-- <Login :login-view='true' /> -->
  <!-- <AccountList /> -->
  <!-- <RecordList /> -->
  <Background />
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
