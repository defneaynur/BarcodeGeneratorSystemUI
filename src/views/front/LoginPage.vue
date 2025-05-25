<template>
  <v-container class="mt-5" fluid>
    <v-row justify="center">
      <v-col xs="12" sm="8" md="6" lg="4">
        <v-card>
          <v-card-title>
            <h2 class="text-center">Giriş Yap</h2>
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field v-model="username" label="Kullanıcı Adı" required></v-text-field>
              <v-text-field v-model="password" label="Şifre" type="password" required></v-text-field>
              <v-btn type="submit" color="primary" class="w-100 mb-2">
                Giriş Yap
              </v-btn>
              <v-btn color="secondary" class="w-100" @click="registerDialog = true">
                Kayıt Ol
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Kayıt Dialog -->
    <v-dialog v-model="registerDialog" max-width="70% !important">
      <v-card>
        <v-card-title>
          <span class="headline">Kayıt Ol</span>
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="register">
            <v-text-field v-model="registerData.fullName" label="Ad Soyad" required></v-text-field>
            <v-text-field v-model="registerData.userName" label="Kullanıcı Adı" required></v-text-field>
            <v-text-field v-model="registerData.email" label="Email" required></v-text-field>
            <v-text-field v-model="registerData.password" label="Şifre" type="password" required></v-text-field>
            <v-btn type="submit" color="success" class="mt-3 w-100">
              Kaydı Tamamla
            </v-btn>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="registerDialog = false">Kapat</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>


<script>
// import axios from 'axios';
import { login } from '@/plugins/login';
import config from '@/config';
import axios from 'axios';
console.log("test")
export default {
  data() {
    return {
      username: '',
      password: '',
      registerDialog: false,
      registerData: {
        userName: '',
        password: '',
        email: '',
        name: '',
      },
    };
  },
  methods: {
    login() {
      const userCredentials = {
        UserName: this.username,
        Password: this.password
      };

      login(userCredentials)
        .then(response => {
          const data = response.data;
          if (response.coreResponseCode === 1) {
            localStorage.setItem('token', data);
            localStorage.setItem('userName', userCredentials.UserName);

            this.$router.push('/admin');
          } else {
            alert('Giriş başarısız: ' + data.message);
          }
        })
        .catch(error => {
          console.error('Login error:', error);
          alert('Giriş işlemi sırasında bir hata oluştu.');
        });
    },
    register() {
      const userName = localStorage.getItem('userName');

      const dataModel = {
        UserName: this.registerData.userName,
        Password: this.registerData.password,
        Email: this.registerData.email,
        Name: this.registerData.name,
        Creator: userName,
        IsDeleted: false
      };

      axios.post(`${config.apiBaseUrl}/UserService/register`, dataModel, null)
        .then(response => {
          console.log(response)
          this.registerDialog = false;
        })
        .catch(error => {
          console.error('Kayıt etme hatası:', error.response ? error.response.data : error.message);
        });
    }
  }
};
</script>

<style scoped>
.v-card {
  max-width: 400px;
  margin: auto;
}
</style>
