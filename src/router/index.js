import { api } from '@/api/api';
import AccountList from '@/components/AccountList.vue';
import AccountManagersView from '@/components/AccountManagersView.vue';
import Login from '@/components/Login.vue'
import RecordList from '@/components/RecordList.vue';
import UserInfoView from '@/components/UserInfoView.vue';
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: Login,
      meta: {requiresAuth: false},
    },
    {
      path: '/accounts',
      component: AccountList,
      meta: {requiresAuth: true},
    },
    {
      path: '/accounts/:id/records',
      component: RecordList,
      meta: {requiresAuth: true},
    },
    {
      path: '/accounts/:id/managers',
      component: AccountManagersView,
      meta: {requiresAuth: true},
    },
    {
      path: '/users/:id',
      component: UserInfoView,
      meta: {requiresAuth: true},
    },
    {
      path: '/',
      redirect: '/accounts',
    }
  ]
})

router.beforeEach(async (to, from) => {
  let currentUser = await api.verifyCurrentUser();

  if (to.meta.requiresAuth) {
    if (currentUser === null) {
      return {
        path: '/login',
        query: { redirect: to.fullPath }
      };
    }
    return true;
  } else {
    if (currentUser !== null) {
      return {
        path: '/accounts',
      }
    }
    return true;
  }
});

export default router
