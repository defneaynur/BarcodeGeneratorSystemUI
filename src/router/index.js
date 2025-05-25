import axios from 'axios';
import { createRouter, createWebHistory } from 'vue-router';
import AdminLayout from '../layouts/AdminLayout.vue';
import AdminDashboard from '../views/admin/Dashboard.vue';
import LoginPage from '../views/front/LoginPage.vue';
import UserManagementPage from '@/views/admin/UserManagementPage.vue';
import ErpMockPage from '@/views/admin/ErpMockPage.vue';


async function guardMyRoute(to, from, next) {
  const token = localStorage.getItem('token');
  if (token) {
    await axios.post('https://localhost:7290/api/AuthService/tokenVerify', {
      Token: token
    })
      .then(response => {
        if (response.data.coreResponseCode === 1 && response.data.data) {
          next();
        } else {
          next('/login');
        }
      })
      .catch(error => {
        console.error('Token doğrulama hatası:', error);
        next('/login');
      });
  } else {
    next('/login');
  }
}

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginPage
  },
  {
    path: '/login',
    name: 'loginPage',
    component: LoginPage
  },
  {
    path: '/admin',
    component: AdminLayout,
    beforeEnter: guardMyRoute,
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: AdminDashboard
      },
      {
        path: 'usermanagement',
        name: 'admin-usermanagement',
        component: UserManagementPage
      },
      {
        path: 'erpmock',
        name: 'admin-erpmock',
        component: ErpMockPage
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
