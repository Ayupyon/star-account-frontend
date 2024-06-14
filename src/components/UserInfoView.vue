<script setup>
import { api } from "@/api/api";
import { formatDate } from "@/util/date";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Notification from "./Notification.vue";
import { validateEmail, validateLength } from "@/util/validator";

const route = useRoute();
const router = useRouter();

let userId = parseInt(route.params.id);
const user = ref(null);
const userAvatar = ref(null);
const isSelfView = ref(false);

function setUserAndView() {
  api.getUser(userId)
    .then(result => {
      user.value = result;
      return api.verifyCurrentUser();
    }).then(result => {
      isSelfView.value = result !== null && result.id === userId;
      return api.getUserAvatar(userId);
    }).then(result => {
      userAvatar.value = result;
    });
}

const isModifyNameModalActive = ref(false);
const isModifyEmailModalActive = ref(false);
const isModifyPasswordModalActive = ref(false);
const nameInput = ref("");
const emailInput = ref("");
const originPasswordInput = ref("");
const passwordInput = ref("");
const repeatPasswordInput = ref("");

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

const isNotificationActive = ref(false);
const isSuccessNotification = ref(true);
const notificationMessage = ref("");

const notificationType = computed(() => {
  if (isSuccessNotification.value) {
    return "is-primary";
  } else {
    return "is-danger";
  }
});

const iconType = computed(() => {
  if (isSuccessNotification.value) {
    return ['fas', 'circle-check'];
  } else {
    return ['fas', 'circle-xmark'];
  }
});

function setNotification(isSuccess, info) {
  isSuccessNotification.value = isSuccess;
  notificationMessage.value = info;
  isNotificationActive.value = true;
  setTimeout(() => { 
    isNotificationActive.value = false; 
  }, 3000);
}

function activateModifyNameModal() {
  isModifyNameModalActive.value = true;
  nameInput.value = "";
}

function activateModifyEmailModal() {
  isModifyEmailModalActive.value = true;
  originPasswordInput.value = "";
  emailInput.value = "";
}

function activateModifyPasswordModal() {
  isModifyPasswordModalActive.value = true;
  originPasswordInput.value = "";
  passwordInput.value = "";
  repeatPasswordInput.value = "";
}

function modifyName() {
  if (!validateLength(nameInput.value, 1, 15)) {
    setNotification(false, "名字过长或过短！");
    return;
  }

  api.updateUserName(nameInput.value)
    .then(result => {
      if (!result) {
        setNotification(false, "登录过期，请重新登录！");
        return;
      }

      setNotification(true, "修改成功！");
      setUserAndView();
      isModifyNameModalActive.value = false;
    });
}

function modifyEmail() {
  if (!validateEmail(emailInput.value)) {
    setNotification(false, "请输入正确的邮箱！");
    return;
  }

  api.checkUserPassword(originPasswordInput.value)
    .then(result => {
      if (!result) {
        setNotification(false, "登录过期或输入的密码错误！");
        throw result;
      }

      return api.updateUserEmail(emailInput.value);
    }).then(result => {
      if (!result) {
        setNotification(false, "登录过期或者邮箱已被占用！");
        return;
      }

      setNotification(true, "修改成功！");
      setUserAndView();
      isModifyEmailModalActive.value = false;
    }).catch(() => {});
}

function modifyPassword() {
  if (!validateLength(passwordInput.value, 6, 15)) {
    setNotification(false, "密码过长或过短！");
    return;
  }

  if (repeatPasswordInput.value !== passwordInput.value) {
    setNotification(false, "两次输入的密码不一致！");
    return;
  }

  api.checkUserPassword(originPasswordInput.value)
    .then(result => {
      if (!result) {
        setNotification(false, "登录过期或输入的原密码错误！");
        throw result;
      }

      return api.updateUserPassword(passwordInput.value);
    }).then(result => {
      if (!result) {
        setNotification(false, "登录过期，请重新登录！");
        throw result;
      }

      setNotification(true, "修改成功，请重新登录！");
      return api.logoutUser();
    }).then(result => {
      if (!result) {
        setNotification(false, "发生错误！");
      }

      router.push("/");
    }).catch(() => {});
}

onMounted(() => {
  setUserAndView();
});
</script>

<template>
  <div>
    <div class="columns is-centered" v-if="user !== null">
      <div class="column is-9">
        <div class="box">
          <div class="columns is-centered is-vcentered">
            <div class="column is-one-third">
              <div class="columns is-multiline is-centered">
                <div class="column is-full">
                  <img id="user-avatar" :src="userAvatar" />
                </div>

                <div class="column is-full">
                  <b class="bigger-text centered-text">
                    {{ user.name }}
                  </b>
                </div>

                <div class="column is-full">
                  <b class="centered-text">
                    UID: {{ user.id }}
                  </b>
                </div>
              </div>
            </div>
            
            <div class="column">
              <div class="list">
                <div class="tabs">
                  <ul>
                    <li>
                      <b class="bigger-text">用户名</b>
                    </li>
                  </ul>
                </div>

                <div class="info-display">
                  <div>
                    {{ user.name }}
                  </div>

                  <div class="button is-primary is-light" v-if="isSelfView" @click="activateModifyNameModal()">
                    <span class="icon-text">
                      <span class="icon">
                        <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                      </span>

                      <span>修改</span>
                    </span>
                  </div>
                </div>
              </div>

              <div class="list">
                <div class="tabs">
                  <ul>
                    <li>
                      <b class="bigger-text">邮箱</b>
                    </li>
                  </ul>
                </div>

                <div class="info-display">
                  <div>
                    {{ user.email }}
                  </div>

                  <div class="button is-primary is-light" v-if="isSelfView" @click="activateModifyEmailModal()">
                    <span class="icon-text">
                      <span class="icon">
                        <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                      </span>

                      <span>修改</span>
                    </span>
                  </div>
                </div>
              </div>

              <div class="list">
                <div class="tabs">
                  <ul>
                    <li>
                      <b class="bigger-text">注册日期</b>
                    </li>
                  </ul>
                </div>

                <div class="info-display">
                  <div>
                    {{ formatDate(user.createTime) }}
                  </div>
                </div>
              </div>

              <div class="button is-danger is-light" v-if="isSelfView" @click="activateModifyPasswordModal()">
                <span class="icon-text">
                  <span class="icon">
                    <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                  </span>

                  <span>修改密码</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal" :class="{'is-active': isModifyNameModalActive}">
      <div class="modal-background" @click="isModifyNameModalActive = false"></div>

      <div class="modal-content">
        <article class="message is-info">
          <div class="message-header">
            <p>修改名称</p>
          </div>

          <div class="message-body">
            <div class="field">
              <label class="label">
                新名称
                <span class="has-text-danger" v-if="!isEmptyOrLegalName">（名字长度不超过15！）</span>
              </label>
              <div class="control">
                <input class="input" 
                      :class="{'is-danger': !isEmptyOrLegalName}"
                      placeholder="长度不超过15"
                      v-model="nameInput" />
              </div>
            </div>

            <button class="button is-link is-light icon-text" @click="modifyName()">
              <span class="icon">
                <font-awesome-icon :icon="['fas', 'circle-check']" />
              </span>
              <span>确认修改</span>
            </button>
          </div>
        </article>
      </div>
    </div>

    <div class="modal" :class="{'is-active': isModifyEmailModalActive}">
      <div class="modal-background" @click="isModifyEmailModalActive = false"></div>

      <div class="modal-content">
        <article class="message is-info">
          <div class="message-header">
            <p>修改邮箱</p>
          </div>

          <div class="message-body">
            <div class="field">
              <label class="label">输入密码验证身份</label>
              <div class="control">
                <input class="input" 
                       type="password"
                       v-model="originPasswordInput" />
              </div>
            </div>

            <div class="field">
              <label class="label">
                新邮箱
                <span class="has-text-danger" v-if="!isEmptyOrLegalEmail">（请输入正确的邮箱格式！）</span>
              </label>
              <div class="control">
                <input class="input" 
                      :class="{'is-danger': !isEmptyOrLegalEmail}"
                      placeholder="请输入正确的邮箱"
                      v-model="emailInput" />
              </div>
            </div>

            <button class="button is-link is-light icon-text" @click="modifyEmail()">
              <span class="icon">
                <font-awesome-icon :icon="['fas', 'circle-check']" />
              </span>
              <span>确认修改</span>
            </button>
          </div>
        </article>
      </div>
    </div>

    <div class="modal" :class="{'is-active': isModifyPasswordModalActive}">
      <div class="modal-background" @click="isModifyPasswordModalActive = false"></div>

      <div class="modal-content">
        <article class="message is-danger">
          <div class="message-header">
            <p>修改密码</p>
          </div>

          <div class="message-body">
            <div class="field">
              <label class="label">原密码</label>
              <div class="control">
                <input class="input" 
                       type="password"
                       v-model="originPasswordInput" />
              </div>
            </div>

            <div class="field">
              <label class="label">
                新密码
                <span class="has-text-danger" v-if="!isEmptyOrLegalPassword">（密码长度应该在6到15之间！）</span>
              </label>
              <div class="control">
                <input class="input"
                       type="password"
                       :class="{'is-danger': !isEmptyOrLegalPassword}"
                       placeholder="长度在6到15之间"
                       v-model="passwordInput" />
              </div>
            </div>

            <div class="field">
              <label class="label">
                重复新密码
                <span class="has-text-danger" v-if="!isEmptyOrLegalRepeatPassword">（重复密码应该与密码相同！）</span>
              </label>
              <div class="control">
                <input class="input"
                       type="password"
                       :class="{'is-danger': !isEmptyOrLegalRepeatPassword}"
                       placeholder="与输入的新密码相同"
                       v-model="repeatPasswordInput" />
              </div>
            </div>

            <button class="button is-link is-light icon-text" @click="modifyPassword()">
              <span class="icon">
                <font-awesome-icon :icon="['fas', 'circle-check']" />
              </span>
              <span>确认修改</span>
            </button>
          </div>
        </article>
      </div>
    </div>

    <Notification :notification-type="notificationType"
                  :icon-type="iconType"
                  :display-message="notificationMessage"
                  v-if="isNotificationActive" />
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

.info-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list {
  margin: 20px;
}
</style>