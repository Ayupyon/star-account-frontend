<script setup>
import { api } from '@/api/api';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import UserSide from './UserSide.vue';
import Notification from './Notification.vue';
import { debounce } from '@/util/asyncHelper';

const route = useRoute();
const router = useRouter();

let accountId = parseInt(route.params.id);
const isOwnerView = ref(false);

function setIsOwnerView() {
  api.checkCurrentUserRole(accountId, 2)
    .then(result => {
      isOwnerView.value = result;
    });
}

const accountOwnerCount = 1;
const accountOwner = ref([]);
const accountManagersCount = ref(0);
const accountManagers = ref([]);
const userAvatars = ref([]);
const pageId = ref(1);
const pageSize = ref(12);
const maxPageId = ref(1);

function updateOwnerAndManagers() {
  Promise.all([
    api.getUsersByAccountIdAndRole(accountId, 2, pageSize.value, pageId.value),
    api.getUsersByAccountIdAndRole(accountId, 1, pageSize.value, pageId.value),
    api.getUsersCountByAccountIdAndRole(accountId, 1),
  ]).then(result => {
    accountOwner.value = result[0];
    accountManagers.value = result[1];
    accountManagersCount.value = result[2];

    maxPageId.value = Math.max(1, Math.ceil(accountManagersCount.value / pageSize.value));
    // 修改pageId防止删除之后pageId溢出
    pageId.value = Math.min(pageId.value, maxPageId.value);

    let getAvatarTasks = [];
    for (let user of accountOwner.value) {
      getAvatarTasks.push(api.getUserAvatar(user.id));
    }
    for (let user of accountManagers.value) {
      getAvatarTasks.push(api.getUserAvatar(user.id));
    }

    return Promise.all(getAvatarTasks);
  }).then(result => {
    userAvatars.value = result;
  });
}

function pageUp() {
  if (pageId.value === maxPageId.value) {
    return;
  }
  pageId.value++;
}

function pageDown() {
  if (pageId.value === 1) {
    return;
  }
  pageId.value--;
}

const accountName = ref("");

function setAccountName() {
  api.getAccount(accountId)
    .then(result => {
      accountName.value = result.name;
    });
}

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

const isAddModalActive = ref(false);
const idInput = ref(0);
const userOfIdInput = ref(null);
const userAvatarOfIdInput = ref(null);
const isDeleteModalActive = ref(false);
const selectedUserId = ref(0);

const updateUserOfIdInput = debounce(() => {
  api.getUser(idInput.value)
    .then(result => {
      userOfIdInput.value = result;
      return api.getUserAvatar(idInput.value);
    }).then(result => {
      userAvatarOfIdInput.value = result;
    });
}, 500);

watch(idInput, () => {
  if (idInput.value > 0) {
    updateUserOfIdInput();
  }
})

const isValidIdInput = computed(() => {
  return userOfIdInput.value !== null;
})

function activateAddModal() {
  isAddModalActive.value = true;
}

function activateDeleteModal(id) {
  isDeleteModalActive.value = true;
  selectedUserId.value = id;
}

function addAccountManager() {
  if (!isValidIdInput.value) {
    setNotification(false, "请输入一个正确的用户ID！");
    return;
  }

  api.addAccountManager(accountId, idInput.value)
    .then(result => {
      if (!result) {
        setNotification(false, "权限不足或重复添加！");
        return;
      }

      setNotification(true, "添加成功！");
      updateOwnerAndManagers();
      isAddModalActive.value = false;
    });
}

function deleteAccountManager() {
  api.deleteAccountManager(accountId, selectedUserId.value)
    .then(result => {
      if (!result) {
        setNotification(false, "登录过期或权限不足！");
        return;
      }

      setNotification(true, "移除成功！");
      updateOwnerAndManagers();
      isDeleteModalActive.value = false;
    });
}

onMounted(() => {
  setIsOwnerView();
  setAccountName();
  updateOwnerAndManagers();
});

watch([pageSize, pageId], updateOwnerAndManagers);

</script>

<template>
  <div>
    <div class="columns is-centered">
      <div class="column is-7">
        <div class="tabs">
          <ul>
            <li><b class="bigger-text">账单：{{ accountName }}</b></li>
          </ul>
        </div>

        <div class="box">
          <div class="tabs">
            <ul>
              <li><b class="bigger-text">拥有者</b></li>
            </ul>
          </div>

          <div class="columns is-multiline">
            <div class="column is-one-quarter" v-for="(user, pos) in accountOwner">
              <div class="user-display">
                <img class="avatar" :src="userAvatars[pos]"></img>

                <span>
                  <a @click="router.push(`/users/${user.id}`)">
                    {{ user.name }}
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="box">
          <div class="tabs">
            <ul>
              <li><b class="bigger-text">管理者</b></li>
            </ul>
          </div>

          <div class="columns is-multiline">
            <div class="column is-one-quarter" v-for="(user, pos) in accountManagers">
              <div class="user-display">
                <img class="avatar" :src="userAvatars[accountOwner.length + pos]"></img>

                <span>
                  <a @click="router.push(`/users/${user.id}`)">
                    {{ user.name }}
                  </a>
                </span>

                <div class="dropdown is-hoverable" v-if="isOwnerView">
                  <div class="dropdown-trigger">
                    <span class="icon">
                      <font-awesome-icon :icon="['fas', 'ellipsis-vertical']" />
                    </span>
                  </div>

                  <div class="dropdown-menu">
                    <div class="dropdown-content">
                      <a class="dropdown-item" @click="activateDeleteModal(user.id)">
                        <span class="icon-text">
                          <span class="icon">
                            <font-awesome-icon :icon="['fas', 'trash']" />
                          </span>

                          <span>取消权限</span>
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="page-foot">
            <div>
              <span class="icon-text">
                <span class="icon">
                  <a @click="pageDown()">
                    <font-awesome-icon :icon="['fas', 'arrow-left']" />
                  </a>
                </span>

                <b>
                  第{{ pageId }} / {{ maxPageId }}页
                </b>

                <span class="icon">
                  <a @click="pageUp()">
                    <font-awesome-icon :icon="['fas', 'arrow-right']" />
                  </a>
                </span>
              </span>
            </div>
            
            <div class="buttons">
              <div class="button is-primary is-light" @click="activateAddModal()" v-if="isOwnerView">
                <span class="icon-text">
                  <span class="icon">
                    <font-awesome-icon :icon="['fas', 'plus']" />
                  </span>
                  <span>添加管理者</span>
                </span>
              </div>

              <div class="button is-link is-light" @click="router.push(`/accounts/${accountId}/records`)">
                <span class="icon-text">
                  <span class="icon">
                    <font-awesome-icon :icon="['fas', 'file']" />
                  </span>
                  <span>查看账单信息</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="column is-one-quarter">
        <UserSide />
      </div>
    </div>

    <div class="modal" :class="{'is-active': isAddModalActive}">
      <div class="modal-background" @click="isAddModalActive = false"></div>

      <div class="modal-content">
        <article class="message is-info">
          <div class="message-header">
            <p>添加管理者</p>
          </div>

          <div class="message-body">
            <div class="field">
              <label class="label">请输入想要添加的管理者的ID</label>
              <div class="control">
                <input class="input"
                       type="number"
                       placeholder="长度不超过15" 
                       v-model="idInput" />
              </div>
            </div>

            <div class="columns" v-if="isValidIdInput">
              <div class="column is-one-third">
                <div class="user-display">
                  <img class="avatar" :src="userAvatarOfIdInput"></img>

                  <span>{{ userOfIdInput.name }}</span>
                </div>
              </div>
            </div>

            <button class="button is-link is-light icon-text" @click="addAccountManager()">
              <span class="icon">
                <font-awesome-icon :icon="['fas', 'circle-check']" />
              </span>
              <span>确认添加</span>
            </button>
          </div>
        </article>
      </div>
    </div>

    <div class="modal" :class="{'is-active': isDeleteModalActive}">
      <div class="modal-background" @click="isDeleteModalActive = false"></div>

      <div class="modal-content">
        <article class="message is-danger">
          <div class="message-header">
            <p>移除管理者</p>
          </div>

          <div class="message-body">
            <div class="field">
              <label class="label">您确定要移除这个管理者吗？</label>
            </div>

            <button class="button is-danger is-light icon-text" @click="deleteAccountManager()">
              <span class="icon">
                <font-awesome-icon :icon="['fas', 'circle-check']" />
              </span>
              <span>确认移除</span>
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
.avatar {
  max-width: 50px;
  height: auto;
  border-radius: 50%;
  display: block;
}

.user-display {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
}
</style>