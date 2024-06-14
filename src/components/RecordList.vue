<script setup>
import { formatDate } from "@/util/date";
import { computed, onMounted, ref, watch } from "vue";
import RecordType from "./RecordType.vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "@/api/api";
import UserSide from "./UserSide.vue";
import Notification from "./Notification.vue";
import { validateLength, validateNumber } from "@/util/validator";

const recordTypes = [
  "餐饮",
  "购物",
  "交通",
  "娱乐",
  "学习",
  "办公",
  "礼物",
]

const route = useRoute();
const router = useRouter();

let accountId = parseInt(route.params.id);

const currentRecords = ref([]);
const recordCreators = ref([]);
const recordLastModifiers = ref([]);
const recordsCount = ref(0);
const amountSum = ref("0");
const pageSize = ref(10);
const pageId = ref(1);
const maxPageId = ref(1);

function updateRecords() {
  Promise.all([
    api.getRecordsByAccountId(accountId, pageSize.value, pageId.value),
    api.getRecordsCountByAccountId(accountId),
    api.getAmountSumByAccountId(accountId),
  ]).then(result => {
    currentRecords.value = result[0];
    recordsCount.value = result[1];
    amountSum.value = result[2];

    maxPageId.value = Math.max(1, Math.ceil(recordsCount.value / pageSize.value));
    // 修改pageId防止删除之后pageId溢出
    pageId.value = Math.min(pageId.value, maxPageId.value);

    let getCreatorTasks = [];
    let getLastModifierTasks = [];
    for (let record of currentRecords.value) {
      getCreatorTasks.push(api.getUser(record.createUserId));
      getLastModifierTasks.push(api.getUser(record.lastModifiedUserId));
    }

    return Promise.all([
      Promise.all(getCreatorTasks),
      Promise.all(getLastModifierTasks),
    ]);
  }).then(result => {
    recordCreators.value = result[0];
    recordLastModifiers.value = result[1];
  });
}

const isCreateModalActive = ref(false);
const isModifyModalActive = ref(false);
const isDeleteModalActive = ref(false);
const selectedCreateType = ref(1);
const recordIdToModify = ref(0);
const nameInput = ref("");
const amountInput = ref("");

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

function createRecord() {
  if (!validateLength(nameInput.value, 1, 15)) {
    setNotification(false, "名字过长或过短！");
    return;
  }

  if (!validateNumber(amountInput.value)) {
    setNotification(false, "金额不合法！");
    return;
  }

  api.createRecord(nameInput.value, selectedCreateType.value, Date.now(), amountInput.value, accountId)
    .then(result => {
      if (!result) {
        setNotification(false, "登录过期，请重新登录！");
        return;
      }

      setNotification(true, "成功创建！");
      updateRecords();
      isCreateModalActive.value = false;
    });
}

function modifyRecord() {
  if (!validateLength(nameInput.value, 1, 15)) {
    setNotification(false, "名字过长或过短！");
    return;
  }

  if (!validateNumber(amountInput.value)) {
    setNotification(false, "金额不合法！");
    return;
  }

  api.updateRecord(recordIdToModify.value, nameInput.value, selectedCreateType.value, Date.now(), amountInput.value)
    .then(result => {
      if (!result) {
        setNotification(false, "登录过期，请重新登录！");
        return;
      }

      setNotification(true, "成功修改！");
      updateRecords();
      isModifyModalActive.value = false;
    });
}

function deleteRecord() {
  api.deleteRecord(recordIdToModify.value)
    .then(result => {
      if (!result) {
        setNotification(false, "登录过期，请重新登录！");
        return;
      }

      setNotification(true, "成功删除！");
      updateRecords();
      isDeleteModalActive.value = false;
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

function activateCreateModal() {
  isCreateModalActive.value = true;
  nameInput.value = "";
  selectedCreateType.value = 1;
  amountInput.value = "";
}

function activateUpdateModal(record) {
  isModifyModalActive.value = true;
  recordIdToModify.value = record.id;
  nameInput.value = record.name;
  selectedCreateType.value = record.type;
  amountInput.value = record.amount;
}

function activateDeleteModal(record) {
  isDeleteModalActive.value = true;
  recordIdToModify.value = record.id;
}

const accountName = ref("");

function setAccountName() {
  api.getAccount(accountId)
    .then(result => {
      accountName.value = result.name;
    });
}

onMounted(() => {
  setAccountName();
  updateRecords();
});

watch([pageSize, pageId], updateRecords);

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
          <div class="notification">
            <div class="columns is-vcentered">
              <div class="column is-half">
                <div class="columns is-multiline">
                  <div class="column is-full">
                    <b class="bigger-text centered-text">已记录笔数</b>
                  </div>

                  <div class="column is-full">
                    <span class="bigger-text centered-text">{{ recordsCount }}</span>
                  </div>
                </div>
              </div>

              <div class="column is-half">
                <div class="columns is-multiline">
                  <div class="column is-full">
                    <b class="bigger-text centered-text">总金额数</b>
                  </div>

                  <div class="column is-full">
                    <span class="bigger-text centered-text">{{ amountSum }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <table class="table is-hoverable is-fullwidth">
            <thead>
              <tr>
                <th></th>
                <th>记录名</th>
                <th>时间</th>
                <th>金额</th>
                <th>创建用户</th>
                <th>最后修改用户</th>
                <th>创建时间</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(record, pos) in currentRecords">
                <th><RecordType :type="record.type" /></th>
                <td>{{ record.name }}</td>
                <td>{{ formatDate(record.date) }}</td>
                <td>{{ record.amount }}</td>
                <td>
                  <a @click="router.push(`/users/${record.createUserId}`)">
                    {{ recordCreators[pos].name }}
                  </a>
                </td>
                <td>
                  <a @click="router.push(`/users/${record.lastModifiedUserId}`)">
                    {{ recordLastModifiers[pos].name }}
                  </a>
                </td>
                <td>{{ formatDate(record.createTime) }}</td>
                <td>
                  <div class="dropdown is-hoverable">
                    <div class="dropdown-trigger">
                      <span class="icon is-small">
                        <font-awesome-icon :icon="['fas', 'ellipsis-vertical']" />
                      </span>
                    </div>

                    <div class="dropdown-menu">
                      <div class="dropdown-content">
                        <a class="dropdown-item" @click="activateUpdateModal(record)">
                          <span class="icon-text">
                            <span class="icon">
                              <font-awesome-icon :icon="['fas', 'pen']" />
                            </span>

                            <span>修改</span>
                          </span>
                        </a>

                        <a class="dropdown-item" @click="activateDeleteModal(record)">
                          <span class="icon-text">
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
            
            <div class="buttons">
              <div class="button is-primary is-light" @click="activateCreateModal()">
                <span class="icon-text">
                  <span class="icon">
                    <font-awesome-icon :icon="['fas', 'plus']" />
                  </span>
                  <span>新建记录</span>
                </span>
              </div>

              <div class="button is-link is-light" @click="router.push(`/accounts/${accountId}/managers`)">
                <span class="icon-text">
                  <span class="icon">
                    <font-awesome-icon :icon="['fas', 'user-tie']" />
                  </span>
                  <span>查看管理者信息</span>
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
            <p>新建一个记录</p>
          </div>

          <div class="message-body">
            <div class="field">
              <label class="label">记录名</label>

              <div class="control">
                <input class="input" 
                      placeholder="长度不超过15"
                      v-model="nameInput" />
              </div>
            </div>

            <div class="field">
              <label class="label">记录类型</label>

              <div class="control has-icons-left">
                <div class="select">
                  <select v-model="selectedCreateType">
                    <option v-for="(typeText, pos) in recordTypes" :value="pos + 1">
                      <span class="icon-text">
                        <span>{{ typeText }}</span>
                      </span>
                    </option>
                  </select>
                </div>

                <div class="icon is-left">
                  <RecordType :type="selectedCreateType" />
                </div>
              </div>
            </div>

            <div class="field">
              <label class="label">金额</label>

              <div class="control">
                <input class="input"
                      v-model="amountInput" />
              </div>
            </div>

            <button class="button is-link is-light icon-text" @click="createRecord()">
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
            <p>修改记录信息</p>
          </div>

          <div class="message-body">
            <div class="field">
              <label class="label">记录名</label>

              <div class="control">
                <input class="input" 
                      placeholder="长度不超过15"
                      v-model="nameInput" />
              </div>
            </div>

            <div class="field">
              <label class="label">记录类型</label>

              <div class="control has-icons-left">
                <div class="select">
                  <select v-model="selectedCreateType">
                    <option v-for="(typeText, pos) in recordTypes" :value="pos + 1">
                      <span class="icon-text">
                        <span>{{ typeText }}</span>
                      </span>
                    </option>
                  </select>
                </div>

                <div class="icon is-left">
                  <RecordType :type="selectedCreateType" />
                </div>
              </div>
            </div>

            <div class="field">
              <label class="label">金额</label>

              <div class="control">
                <input class="input"
                      v-model="amountInput"/>
              </div>
            </div>

            <button class="button is-link is-light icon-text" @click="modifyRecord()">
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
            <p>删除记录</p>
          </div>

          <div class="message-body">
            <div class="field">
              <label class="label">您确定要删除这个记录吗？（删除之后无法恢复！）</label>
            </div>

            <button class="button is-danger is-light icon-text" @click="deleteRecord()">
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
#records-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>