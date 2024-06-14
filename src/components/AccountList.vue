<script setup>
import { api } from "@/api/api";
import { formatDate } from "@/util/date";
import { computed, onMounted, ref, watch } from "vue";
import UserSide from "@/components/UserSide.vue"
import Notification from "./Notification.vue";
import { validateLength } from "@/util/validator";
import { useRouter } from "vue-router";

const router = useRouter();

const pageId = ref(1);
const pageSize = ref(10);
const role = ref(2);

const isNotificationActive = ref(false);
const isSuccessNotification = ref(true);
const notificationMessage = ref("");

const isCreateModalActive = ref(false);

const accountIdToModify = ref(0);
const isModifyModalActive = ref(false);
const isDeleteModalActive = ref(false);

const nameInput = ref("");

const ownAccountsCount = ref(0);
const manageAccountsCount = ref(0);
const currentAccounts = ref([]);
const maxPageId = ref(1);

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

const isEmptyOrLegalName = computed(() => {
  return nameInput.value.length == 0 || validateLength(nameInput.value, 1, 15);
});

function updateAccountsStatus() {
  Promise.all([
    api.getAccountsCount(2),
    api.getAccountsCount(1),
    api.getAccounts(role.value, pageSize.value, pageId.value),
  ]).then(result => {
    console.log(result);
    ownAccountsCount.value = result[0];
    manageAccountsCount.value = result[1];
    currentAccounts.value = result[2];

    let currentAccountsCount = role.value === 2 ? ownAccountsCount.value : manageAccountsCount.value;
    maxPageId.value = Math.max(1, Math.ceil(currentAccountsCount / pageSize.value));

    // 修改pageId防止删除之后pageId溢出
    pageId.value = Math.min(pageId.value, maxPageId.value);
  });
}

function setNotification(isSuccess, info) {
  isSuccessNotification.value = isSuccess;
  notificationMessage.value = info;
  isNotificationActive.value = true;
  setTimeout(() => { 
    isNotificationActive.value = false; 
  }, 3000);
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

function createAccount() {
  if (!validateLength(nameInput.value, 1, 15)) {
    setNotification(false, "名字过长或过短！");
    return;
  }

  api.createAccount(nameInput.value)
    .then(result => {
      if (!result) {
        setNotification(false, "登录过期，请重新登录！");
        return;
      }

      setNotification(true, "成功创建！");
      updateAccountsStatus();
      nameInput.value = "";
      isCreateModalActive.value = false;
    });
}

function updateAccountName() {
  if (!validateLength(nameInput.value, 1, 15)) {
    setNotification(false, "名字过长或过短！");
    return;
  }

  api.updateAccountName(accountIdToModify.value, nameInput.value)
    .then(result => {
      if (!result) {
        setNotification(false, "数据不合法！");
        return;
      }

      setNotification(true, "成功修改！");
      updateAccountsStatus();
      nameInput.value = "";
      isModifyModalActive.value = false;
    });
}

function deleteAccount() {
  api.deleteAccount(accountIdToModify.value, nameInput.value)
    .then(result => {
      if (!result) {
        setNotification(false, "数据不合法！");
        return;
      }

      setNotification(true, "成功删除！");
      updateAccountsStatus();
      isDeleteModalActive.value = false;
    });
}

function activateCreateModal() {
  isCreateModalActive.value = true;
  nameInput.value = "";
}

function activateUpdateModal(account) {
  isModifyModalActive.value = true;
  accountIdToModify.value = account.id;
  nameInput.value = account.name;
}

function activateDeleteModal(account) {
  isDeleteModalActive.value = true;
  accountIdToModify.value = account.id;
}

onMounted(updateAccountsStatus);

watch([role, pageId, pageSize], updateAccountsStatus);

</script>

<template>
  <div>
    <div class="columns is-centered">
      <div class="column is-half">
        <div class="box">
          <div class="notification">
            <div class="columns is-vcentered">
              <div class="column is-half">
                <div class="columns is-multiline">
                  <div class="column is-full">
                    <b class="bigger-text centered-text">拥有账单数</b>
                  </div>

                  <div class="column is-full">
                    <span class="bigger-text centered-text">{{ ownAccountsCount }}</span>
                  </div>
                </div>
              </div>

              <div class="column is-half">
                <div class="columns is-multiline">
                  <div class="column is-full">
                    <b class="bigger-text centered-text">管理账单数</b>
                  </div>

                  <div class="column is-full">
                      <span class="bigger-text centered-text">{{ manageAccountsCount }}</span>
                    </div>
                </div>
              </div>
            </div>
          </div>

          <div class="tabs is-centered is-boxed">
            <ul>
              <li :class="{'is-active': role === 2}" @click="role = 2">
                <a>拥有的账单</a>
              </li>

              <li :class="{'is-active': role === 1}" @click="role = 1">
                <a>管理的账单</a>
              </li>
            </ul>
          </div>

          <table class="table is-hoverable is-fullwidth">
            <thead>
              <tr>
                <th>序号</th>
                <th>账单名</th>
                <th>创建时间</th>
                <th v-if="role === 2"></th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(account, pos) in currentAccounts">
                <th>{{ (pageId - 1) * pageSize + pos + 1 }}</th>
                <td>
                  <a @click="router.push(`/accounts/${account.id}/records`)">
                    {{ account.name }}
                  </a>
                </td>
                <td>{{ formatDate(account.createTime) }}</td>
                <td v-if="role === 2">
                  <div class="dropdown is-hoverable">
                    <div class="dropdown-trigger">
                      <span class="icon is-small">
                        <font-awesome-icon :icon="['fas', 'ellipsis-vertical']" />
                      </span>
                    </div>

                    <div class="dropdown-menu">
                      <div class="dropdown-content">
                        <a class="dropdown-item" @click="activateUpdateModal(account)">
                          <span class="icon-text">
                            <span class="icon">
                              <font-awesome-icon :icon="['fas', 'pen']" />
                            </span>

                            <span>修改</span>
                          </span>
                        </a>

                        <a class="dropdown-item">
                          <span class="icon-text" @click="activateDeleteModal(account)">
                            <span class="icon">
                              <font-awesome-icon :icon="['fas', 'trash']" />
                            </span>

                            <span>删除</span>
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
            
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
            
            <div>
              <div class="button is-primary is-light" @click="activateCreateModal()">
                <span class="icon-text">
                  <span class="icon">
                    <font-awesome-icon :icon="['fas', 'plus']" />
                  </span>
                  <span>新建账单</span>
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

    <div class="modal" :class="{'is-active': isCreateModalActive}">
      <div class="modal-background" @click="isCreateModalActive = false"></div>

      <div class="modal-content">
        <article class="message is-info">
          <div class="message-header">
            <p>新建一个账单</p>
          </div>

          <div class="message-body">
            <div class="field">
              <label class="label">账单名</label>
              <div class="control">
                <input class="input"
                      :class="{'is-danger': !isEmptyOrLegalName}"
                      placeholder="长度不超过15" 
                      v-model="nameInput" />
              </div>
            </div>

            <button class="button is-link is-light icon-text" @click="createAccount()">
              <span class="icon">
                <font-awesome-icon :icon="['fas', 'circle-check']" />
              </span>
              <span>确认创建</span>
            </button>
          </div>
        </article>
      </div>
    </div>

    <div class="modal" :class="{'is-active': isModifyModalActive}">
      <div class="modal-background" @click="isModifyModalActive = false"></div>

      <div class="modal-content">
        <article class="message is-info">
          <div class="message-header">
            <p>修改账单名</p>
          </div>

          <div class="message-body">
            <div class="field">
              <label class="label">新账单名</label>
              <div class="control">
                <input class="input" 
                      :class="{'is-danger': !isEmptyOrLegalName}"
                      placeholder="长度不超过15"
                      v-model="nameInput" />
              </div>
            </div>

            <button class="button is-link is-light icon-text" @click="updateAccountName()">
              <span class="icon">
                <font-awesome-icon :icon="['fas', 'circle-check']" />
              </span>
              <span>确认修改</span>
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
            <p>删除账单</p>
          </div>

          <div class="message-body">
            <div class="field">
              <label class="label">您确定要删除这个账单吗？（删除之后无法恢复！）</label>
            </div>

            <button class="button is-danger is-light icon-text" @click="deleteAccount()">
              <span class="icon">
                <font-awesome-icon :icon="['fas', 'circle-check']" />
              </span>
              <span>确认删除</span>
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
#avatar {
  width: 32px;
  height: auto;
}

#accounts-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>