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
            <v-text-field v-model="search" label="ID ile Ara" append-icon="mdi-magnify" single-line hide-details
              @input="onSearch"></v-text-field>
            <v-btn color="success" @click="generateBarcode" small>
              Yeni Barkod Üret
            </v-btn>
          </v-card-title>

          <v-data-table :headers="headers" :items="filteredBarcodes" :search="search" dense class="elevation-1">

            <template v-slot:item="{ item }">
              <tr>
                <td>{{ item.id }}</td>
                <td>{{ item.gtin12 }}</td>

                <td>
                  <img :src="item.barcodeImage" alt="QR Kod" style="max-height: 80px;" />
                </td>

                <td>{{ item.creator }}</td>
                <td>{{ formatDate(item.created) }}</td>
                <td>
                  <span v-if="validationResults[item.id] === true">✅ Evet</span>
                  <span v-else-if="validationResults[item.id] === false">❌ Hayır</span>
                  <span v-else>-</span>
                </td>
                <td>
                  <v-btn color="primary" small @click="validateBarcode(item)">Doğrula</v-btn>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card>

        <v-alert v-if="filteredBarcodes.length === 0 && dataLoaded" type="info" border="left" color="blue lighten-4"
          class="mt-5">
          Gösterilecek barkod verisi bulunamadı.
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>


<script>
import ToolbarChip from "@/components/base/ToolBar.vue";
import ParentComponent from "@/components/base/ParentComponent.vue";
import axios from 'axios';
import config from '@/config';
import QRCode from 'qrcode';

export default {
  name: "AdminDashboard",
  components: {
    ToolbarChip,
    ParentComponent,
  },
  data() {
    return {
      barcodes: [],
      pageName: "Dashboard",
      dataLoaded: false,
      validationResults: {}, // { barcodeId: true/false }
      search: "",
      headers: [
        { title: "ID", key: "id" },
        { title: "GTIN-12", key: "gtin12" },
        { title: "Karekod", key: "barcodeImage" },
        { title: "Oluşturan", key: "creator" },
        { title: "Oluşturma Tarihi", key: "created" },
        { title: "Geçerli mi?", key: "isValid", sortable: false },
        { title: "İşlemler", key: "actions", sortable: false },
      ],
    };
  },
  computed: {
    filteredBarcodes() {
      if (!this.search) return this.barcodes;
      return this.barcodes.filter(bc =>
        String(bc.id).toLowerCase().includes(this.search.toLowerCase())
      );
    }
  },
  mounted() {
    this.getBarcodes();
  },

  methods: {
    onSearch() {
      if (!this.search) {
        this.getBarcodes();
      } else {
        this.getBarcodeById(this.search);
      }
    },
    async getBarcodes() {
      try {
        const response = await axios.get(`${config.apiBaseUrl}/BarcodeService/codes`);
        const json = response.data;

        if (json.coreResponseCode === 1) {
          for (const item of json.data) {
            item.barcodeImage = await this.generateQrDataUrl(item.gtin12);
          }
          this.barcodes = json.data;
        } else {
          console.warn("Veri alınamadı:", json.message);
        }

        this.dataLoaded = true;
      } catch (error) {
        console.error("API hatası:", error);
        this.dataLoaded = true;
      }
    },

    getBarcodeById(id) {
      axios.get(`${config.apiBaseUrl}/BarcodeService/codes/${id}`)
        .then(response => {
          const json = response.data;
          if (json.coreResponseCode === 1 && json.data) {
            this.barcodes = [json.data];
          } else {
            this.barcodes = [];
            console.warn("Barkod bulunamadı:", json.message);
          }
          this.dataLoaded = true;
        })
        .catch(error => {
          console.error("API hatası:", error);
          this.barcodes = [];
          this.dataLoaded = true;
        });
    },
    validateBarcode(barcode) {
      const token = localStorage.getItem('token');
      const dataModel = {
        Gtin12: barcode.gtin12
      };
      axios.post(`${config.apiBaseUrl}/BarcodeService/validate`, dataModel,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .then(response => {
          const json = response.data;
          if (json.coreResponseCode === 1 && json.data?.isValid !== undefined) {
            this.validationResults[barcode.id] = json.data.isValid;
          } else {
            this.validationResults[barcode.id] = false;
            console.warn("Doğrulama başarısız:", json.message);
          }
        })
        .catch(error => {
          this.validationResults[barcode.id] = false;
          console.error("Doğrulama API hatası:", error);
        });
    },
    generateBarcode() {
      const token = localStorage.getItem('token');

      axios.post(`${config.apiBaseUrl}/BarcodeService/codes`, null,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .then(response => {
          const json = response.data;
          if (json.coreResponseCode === 1 && json.data) {
            this.getBarcodes();
          } else {
            console.warn("Barkod üretilemedi:", json.message);
          }
        })
        .catch(error => {
          console.error("Barkod üretme API hatası:", error);
        });
    },
    formatDate(dateString) {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return date.toLocaleString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    },
    async generateQrDataUrl(text) {
      try {
        return await QRCode.toDataURL(text);
      } catch (err) {
        console.error(err);
        return null;
      }
    }

  },

};
</script>

<style scoped>
.no-padding {
  padding-left: 0 !important;
  padding-right: 0 !important;
}
</style>
