<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="toggleSidebar"></v-app-bar-nav-icon>
      <v-toolbar-title>Barcode Generator</v-toolbar-title>
      <v-spacer></v-spacer>
      <span v-if="username" class="welcome-message">Hoşgeldin, {{ username }}</span>
      <v-btn outlined color="white" @click="handleLogOut">Logout</v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="sidebarOpen" app>
      <v-list>
        <v-list-item to="/admin"  exact router class="text-white">
          <v-list-item-content class="d-flex align-center">
            <v-list-item-icon>
              <v-icon class="text-white"> mdi-view-dashboard</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/admin/erpmock"  exact router>
          <v-list-item-content class="d-flex align-center" >
            <v-list-item-icon>
              <v-icon class="text-white">mdi-calendar-account-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Erp Mock Service</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
        <v-list-item to="/admin/usermanagement"  exact router>
          <v-list-item-content class="d-flex align-center">
            <v-list-item-icon>
              <v-icon class="text-white">mdi-calendar-account-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Kullanıcı Yönetimi</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
    </v-navigation-drawer>

    <v-main>
      <router-view></router-view>
    </v-main>

    <v-footer app>
      <v-container class="footer-container" fluid>
        <span>&copy; 2025 CodeMag Barcode Generator. Tüm hakları saklıdır.</span>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'MainLayout',
  data() {
    return {
      sidebarOpen: true,
      username: localStorage.getItem('userName') || '',
    };
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen; 
    },
    handleLogOut() {
      localStorage.clear();
      this.$router.push({ path: "/login" });
    },
  },
};
</script>

<style scoped>
.no-padding {
  padding: 0 !important;
}

.v-navigation-drawer {
  background-color: #343a40;
  color: white;
}

.v-list-item {
  padding: 10px 20px;
}

.v-list-item:hover {
  background-color: #495057;
}

.v-list-item-title {
  font-size: 1.1rem;
}

.v-icon {
  margin-right: 7px;
}

.v-list-item--active {
  background-color: #007bff;
}

.footer-container {
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-message {
  margin-left: 16px;
  color: white;
}
</style>
