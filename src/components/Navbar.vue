<script setup>
import { api } from "@/api/api";
import logo from "@/assets/logo.png"
import avatar from "@/assets/user_avatar.png"
import { ref } from "vue";

const navbarBurgerActive = ref(false);
</script>

<template>
<nav id="star-navbar" class="navbar" role="navigation" aria-label="main navigation">
  <div class="navbar-brand">
    <img :src="logo" id="navbar-logo" />
  </div>
</nav>
</template>

<style scoped>
#navbar-logo {
  height: 80px;
  width: auto;
  margin-left: 20px;
  margin-top: 10px;
}

#star-navbar {
  background-color: rgba(255, 255, 255, 0%);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 20px;
  margin-top: 10px;
}
</style>