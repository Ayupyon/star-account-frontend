<script setup>
import { api } from "@/api/api";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const currentUser = ref(null);
const userAvatar = ref(null);

function setCurrentUser() {
  api.verifyCurrentUser()
    .then(result => {
      currentUser.value = result;
      return api.getUserAvatar(currentUser.id);
    }).then(result => {
      userAvatar.value = result;
    });
}

function getDaysDiff(time1, time2) {
  const timeDiff = time1 - time2;
  const daysDiff = timeDiff / (1000 * 3600 * 24);
  return Math.abs(Math.round(daysDiff)); // 返回绝对值并四舍五入
}

function logout() {
  api.logoutUser()
    .then(_ => {
      router.push("/login");
    });
}

onMounted(() => {
  setCurrentUser();
});

</script>

<template>
  <div class="box" v-if="currentUser !== null">
    <div class="columns is-multiline is-centered">
      <div class="column is-full">
        <img id="user-avatar" :src="userAvatar" />
      </div>

      <div class="column is-full">
        <b class="bigger-text centered-text">
          {{ currentUser.name }}
        </b>
      </div>

      <div class="column is-full menu">
        <ul class="menu-list">
          <li>
            <a @click="router.push(`/users/${currentUser.id}`)">
              <span class="icon-text">
                <span class="icon">
                  <font-awesome-icon :icon="['fas', 'pen-nib']" />
                </span>
                <span>管理个人资料</span>
              </span>
            </a>
          </li>

          <li>
            <a @click="logout()">
              <span class="icon-text">
                <span class="icon">
                  <font-awesome-icon :icon="['fas', 'right-from-bracket']" />
                </span>
                <span>登出</span>
              </span>
            </a>
          </li>
        </ul>
      </div>
    </div>
    
  </div>
</template>

<style scoped>
#user-avatar {
  width: 200px;
  height: auto;
  border-radius: 50%;
  margin: auto;
  display: grid;
  place-items: center;
}
</style>