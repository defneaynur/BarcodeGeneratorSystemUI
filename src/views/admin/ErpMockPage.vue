<template>
  <v-container fluid>
    <v-row>
      <!-- Sol Panel -->
      <v-col cols="12" md="3" lg="2" class="no-padding">
        <ParentComponent />
      </v-col>

      <!-- Ana İçerik -->
      <v-col cols="12" md="9" lg="10" class="px-md-4">
        <v-row class="d-flex justify-space-between align-center pt-3 pb-2 mt-10">
          <v-col>
            <ToolbarChip :getTitle="pageName" />
          </v-col>
        </v-row>

        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <v-text-field 
              v-model="search" 
              label="Ürün Adı veya SKU ile Ara" 
              append-icon="mdi-magnify" 
              single-line 
              hide-details
              @input="onSearch"
            />
            <v-btn color="primary" @click="fetchMockProducts" small>
              Erp Ürünleri Getir
            </v-btn>
            <v-btn 
              color="success" 
              :loading="importLoading" 
              @click="importProductsFromErp" 
              small
            >
              Ürünleri İçe Aktar
            </v-btn>
          </v-card-title>

          <v-data-table
            :headers="headers"
            :items="filteredProducts"
            :search="search"
            dense
            class="elevation-1"
          >
            <template v-slot:item="{ item }">
              <tr>
                <td>{{ item.id }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.sku }}</td>
              </tr>
            </template>
          </v-data-table>
        </v-card>

        <v-alert 
          v-if="message" 
          :type="messageType" 
          border="left" 
          class="mt-5"
          dense
          >
          {{ message }}
        </v-alert>

        <v-alert v-if="filteredProducts.length === 0 && dataLoaded" type="info" border="left" color="blue lighten-4" class="mt-5">
          Gösterilecek ürün bulunamadı.
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ToolbarChip from "@/components/base/ToolBar.vue";
import ParentComponent from "@/components/base/ParentComponent.vue";
import axios from "axios";
import config from "@/config";

export default {
  name: "ExternalProducts",
  components: {
    ToolbarChip,
    ParentComponent,
  },
  data() {
    return {
      products: [],
      pageName: "ERP Ürün Listesi",
      dataLoaded: false,
      search: "",
      importLoading: false,
      message: "",
      messageType: "info",
      headers: [
        { title: "ID", key: "id" },
        { title: "Ürün Adı", key: "name" },
        { title: "SKU", key: "sku" },
      ],
      showingImported: false, 
    };
  },
  computed: {
    filteredProducts() {
      if (!this.search) return this.products;
      const searchLower = this.search.toLowerCase();
      return this.products.filter(
        p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower)
      );
    },
  },
  mounted() {
    this.fetchMockProducts();
  },
  methods: {
    onSearch() {
      if (!this.search) return this.products;
      const searchLower = this.search.toLowerCase();
      return this.products.filter(
        p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower)
      );
    },

   
    async fetchMockProducts() {
      this.dataLoaded = false;
      this.message = "";
      try {
        const response = await axios.get(`${config.apiBaseUrl}/MockErpService/erpMockData`);
        const json = response.data;
        if (json.coreResponseCode === 1 && json.data) {
          this.products = json.data;
          this.showingImported = false;
        } else {
          this.products = [];
          this.message = json.message || "ERP Mock ürünleri alınamadı.";
          this.messageType = "error";
        }
      } catch (error) {
        this.message = "API hatası: ERP Mock ürünleri getirilemedi.";
        this.messageType = "error";
        console.error(error);
        this.products = [];
      } finally {
        this.dataLoaded = true;
      }
    },

    async importProductsFromErp() {
      this.importLoading = true;
      this.message = "";
      try {
        const response = await axios.get(`${config.apiBaseUrl}/ProductService/products/external`);
        const json = response.data;
        if (json.coreResponseCode === 1) {
          this.message = json.message || "Ürünler başarıyla içe aktarıldı.";
          this.messageType = "success";
        } else {
          this.message = json.message || "Ürünler içe aktarılamadı.";
          this.messageType = "error";
        }
      } catch (error) {
        this.message = "İçe aktarma API çağrısında hata oluştu.";
        this.messageType = "error";
      } finally {
        this.importLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.no-padding {
  padding-left: 0 !important;
  padding-right: 0 !important;
}
</style>
