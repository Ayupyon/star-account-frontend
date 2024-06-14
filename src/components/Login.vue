<script setup>
import { api } from '@/api/api';
import { validateEmail, validateLength } from '@/util/validator';
import Notification from '@/components/Notification.vue'
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const isLoginView = ref(true);
const nameInput = ref("");
const emailInput = ref("");
const passwordInput = ref("");
const repeatPasswordInput = ref("");

const displaySuccessInfo = ref(false);
const displayFailureInfo = ref(false);
const displayMessage = ref("登录成功！");

const isEmptyOrLegalEmail = computed(() => {
  return emailInput.value.length == 0 || validateEmail(emailInput.value);
});

const isEmptyOrLegalName = computed(() => {
  return nameInput.value.length == 0 || validateLength(nameInput.value, 1, 15);
});

const isEmptyOrLegalPassword = computed(() => {
  return passwordInput.value.length == 0 || validateLength(passwordInput.value, 6, 15);
});

const isEmptyOrLegalRepeatPassword = computed(() => {
  return repeatPasswordInput.value.length == 0 || repeatPasswordInput.value == passwordInput.value;
});

const notificationType = computed(() => {
  if (displaySuccessInfo.value) {
    return "is-primary";
  }
  if (displayFailureInfo.value) {
    return "is-danger";
  }
});

const iconType = computed(() => {
  if (displaySuccessInfo.value) {
    return ['fas', 'circle-check'];
  }
  if (displayFailureInfo.value) {
    return ['fas', 'circle-xmark'];
  }
});

function setSuccessInfo(info) {
  displayMessage.value = info;
  displaySuccessInfo.value = true;
  setTimeout(() => { displaySuccessInfo.value = false; }, 3000);
}

function setFailureInfo(info) {
  displayMessage.value = info;
  displayFailureInfo.value = true;
  setTimeout(() => { displayFailureInfo.value = false; }, 3000);
}

function doRedirect() {
  const redirect = route.query.redirect;
  setTimeout(() => {
    if (redirect) {
      router.push(redirect);
    } else {
      router.push("/accounts");
    }
  }, 3000);
}

function login() {
  if (!validateEmail(emailInput.value)) {
    setFailureInfo("请输入正确的邮箱！");
    return;
  }

  if (passwordInput.value.length == 0) {
    setFailureInfo("请输入密码！");
    return;
  }

  api.loginUser(emailInput.value, passwordInput.value)
    .then(result => {
      if (!result) {
        setFailureInfo("邮箱或密码错误！");
        return;
      }

      setSuccessInfo("登录成功！");
      doRedirect();
    });
}

function signUp() {
  if (!validateLength(nameInput.value, 1, 15)) {
    setFailureInfo("名字过长或过短！");
    return;
  }

  if (!validateEmail(emailInput.value)) {
    setFailureInfo("请输入正确的邮箱！");
    return;
  }

  if (!validateLength(passwordInput.value, 6, 15)) {
    setFailureInfo("密码过长或过短！");
    return;
  }

  if (passwordInput.value !== repeatPasswordInput.value) {
    setFailureInfo("两次输入密码不相同！");
    return;
  }

  let name = nameInput.value;
  let email = emailInput.value;
  let password = passwordInput.value;

  api.createUser(name, email, password)
    .then(result => {
      if (!result) {
        setFailureInfo("邮箱已经有人占用过了！");
        throw result;
      }

      return api.loginUser(email, password);
    }).then(result => {
      if (!result) {
        setFailureInfo("发生错误！");
        return;
      }

      setSuccessInfo("注册成功，将自动登录...");
      doRedirect();
    }).catch(() => {});
}

</script>

<template>
  <div>
    <div class="tabs is-toggle is-toggle-rounded is-centered">
      <ul>
        <li :class="{'is-active': isLoginView}" @click="isLoginView = true;">
          <a>登录</a>
        </li>
        <li :class="{'is-active': !isLoginView}" @click="isLoginView = false;">
          <a>注册</a>
        </li>
      </ul>
    </div>


    <div class="container is-max-desktop">
      <Transition>
        <form class="box" v-if="isLoginView">
          <div class="field">
            <label class="label">
              邮箱
              <span class="has-text-danger" v-if="!isEmptyOrLegalEmail">（请输入正确的邮箱格式！）</span>
            </label>
            <div class="control">
              <input class="input" 
                    :class="{ 'is-danger': !isEmptyOrLegalEmail }"
                    type="email" 
                    placeholder="e.g. alex@example.com" 
                    v-model="emailInput" />
            </div>
          </div>

          <div class="field">
            <label class="label">密码</label>
            <div class="control">
              <input class="input" 
                    type="password" 
                    placeholder="********" 
                    v-model="passwordInput" />
            </div>
          </div>

          <div class="button is-primary" @click="login()">登录</div>
        </form>
        
        <form class="box" v-else>
          <div class="field">
            <label class="label">
              您的名字
              <span class="has-text-danger" v-if="!isEmptyOrLegalName">（名字长度不超过15！）</span>
            </label>
            <div class="control">
              <input class="input" 
                    :class="{ 'is-danger': !isEmptyOrLegalName }"
                    placeholder="长度不超过15"
                    v-model="nameInput" />
            </div>
          </div>

          <div class="field">
            <label class="label">
              邮箱
              <span class="has-text-danger" v-if="!isEmptyOrLegalEmail">（请输入正确的邮箱格式！）</span>
            </label>
            <div class="control">
              <input class="input"
                    :class="{ 'is-danger': !isEmptyOrLegalEmail }"
                    type="email" 
                    placeholder="e.g. alex@example.com"
                    v-model="emailInput" />
            </div>
          </div>

          <div class="field">
            <label class="label">
              密码
              <span class="has-text-danger" v-if="!isEmptyOrLegalPassword">（密码长度应该在6到15之间！）</span>
            </label>
            <div class="control">
              <input class="input" 
                    :class="{ 'is-danger': !isEmptyOrLegalPassword }"
                    type="password" 
                    placeholder="长度为6-15位"
                    v-model="passwordInput" />
            </div>
          </div>

          <div class="field">
            <label class="label">
              重复密码
              <span class="has-text-danger" v-if="!isEmptyOrLegalRepeatPassword">（重复密码应该与密码相同！）</span>
            </label>
            <div class="control">
              <input class="input" 
                    :class="{ 'is-danger': !isEmptyOrLegalRepeatPassword }"
                    type="password" 
                    placeholder="请再重复输入一遍密码"
                    v-model="repeatPasswordInput" />
            </div>
          </div>

          <div class="button is-primary" @click="signUp()">注册</div>
        </form>
      </Transition>
    </div>

    <Notification :notification-type="notificationType"
                :icon-type="iconType"
                :display-message="displayMessage"
                v-if="displaySuccessInfo || displayFailureInfo" />
  </div>
</template>

<style scoped>
.v-enter-active {
  transition: opacity 1s ease;
}

.v-enter-from {
  opacity: 0;
}

.star-notification {
  position: fixed;
  z-index: 100;
  top: 5%;
  opacity: 75%;
  left: 50%; /* 水平方向定位到视窗的中心 */
  transform: translate(-50%, 0%); /* 向左和向上移动自身宽度和高度的50% */
}
</style>