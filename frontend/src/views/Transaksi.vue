<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import axios from 'axios';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import DataView from 'primevue/dataview';
import SelectButton from 'primevue/selectbutton';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import ProgressSpinner from 'primevue/progressspinner';

const toast = useToast();
const confirm = useConfirm();
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const search = ref('');
const rakFilter = ref(null);
const layout = ref('grid');
const showCartDialog = ref(false);
const cart = ref([]);
const isCheckingStock = ref(false);
const isProcessing = ref(false);
const books = ref([]);
const loading = ref(false);
const error = ref(null);

const viewOptions = ref(['list', 'grid']);
const rakOptions = computed(() => {
  return [...new Set(books.value.map(book => book.rak))]
    .filter(Boolean)
    .map(rak => ({ label: rak, value: rak }));
});

const filteredBooks = computed(() => {
  return books.value.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(search.value.toLowerCase());
    const matchesRak = rakFilter.value ? book.rak === rakFilter.value : true;
    return matchesSearch && matchesRak;
  });
});

const loadBooks = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await axios.get('/api/books');
    books.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Gagal memuat data buku';
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.value,
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const addToCart = async (book) => {
  try {
    const exists = cart.value.find(b => b.id === book.id);
    if (exists) {
      toast.add({
        severity: 'warn',
        summary: 'Peringatan',
        detail: 'Buku sudah ada di keranjang',
        life: 3000
      });
      return;
    }

    isCheckingStock.value = true;
    const { data } = await axios.get(`/api/pinjam/stock/${book.id}`);
    
    if (!data.success) {
      throw new Error(data.message || 'Gagal memeriksa stok');
    }

    if (!data.available) {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Buku tidak tersedia',
        life: 3000
      });
      return;
    }

    cart.value.push({ ...book });
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Buku ditambahkan ke keranjang',
      life: 3000
    });
  } catch (err) {
    console.error('Error:', err);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.response?.data?.message || err.message || 'Gagal memeriksa ketersediaan buku',
      life: 3000
    });
  } finally {
    isCheckingStock.value = false;
  }
};

const removeFromCart = (book) => {
  cart.value = cart.value.filter(b => b.id !== book.id);
  toast.add({
    severity: 'warn',
    summary: 'Dihapus',
    detail: `${book.title} dihapus dari keranjang`,
    life: 2000
  });
};

const processBorrow = async () => {
  try {
    isProcessing.value = true;
    
    if (cart.value.length === 0) {
      toast.add({
        severity: 'warn',
        summary: 'Peringatan',
        detail: 'Keranjang kosong',
        life: 3000
      });
      return;
    }

    const nim = localStorage.getItem('nim');
    if (!nim) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'NIM tidak ditemukan, silakan login ulang',
        life: 3000
      });
      return;
    }

    const payload = {
      nim,
      items: cart.value.map(book => ({
        id: book.id,
        title: book.title
      }))
    };

    const { data } = await axios.post('/api/pinjam', payload);
    
    if (data.success) {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Peminjaman berhasil diproses',
        life: 3000
      });
      cart.value = [];
      showCartDialog.value = false;
      await loadBooks();
    } else {
      throw new Error(data.message || 'Gagal memproses peminjaman');
    }
  } catch (err) {
    console.error('Error:', err);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.response?.data?.message || err.message || 'Gagal memproses peminjaman',
      life: 3000
    });
  } finally {
    isProcessing.value = false;
  }
};

onMounted(() => {
  loadBooks();
});
</script>

<template>
  <div class="card">
    <Toast />
    <ConfirmDialog />

    <div class="flex justify-between items-center mb-4 gap-2 flex-wrap">
      <h2 class="text-xl font-semibold">Self-Service Peminjaman Buku</h2>
      <div class="flex gap-2 flex-wrap">
        <InputText v-model="search" placeholder="Cari buku..." />
        <Select 
          v-model="rakFilter" 
          :options="rakOptions" 
          optionLabel="label" 
          optionValue="value" 
          placeholder="Filter Rak" 
          :showClear="true"
        >
          <template #option="slotProps">
            <div>Rak {{ slotProps.option.label }}</div>
          </template>
        </Select>
        <SelectButton 
          v-model="layout" 
          :options="viewOptions" 
          :allowEmpty="false"
        >
          <template #option="{ option }">
            <i :class="[option === 'list' ? 'pi pi-bars' : 'pi pi-table']" />
          </template>
        </SelectButton>
        <Button 
          :label="`Keranjang (${cart.length})`" 
          icon="pi pi-shopping-cart" 
          @click="showCartDialog = true" 
        />
      </div>
    </div>

    <div v-if="loading" class="text-center p-4">
      <ProgressSpinner />
      <p class="mt-2">Memuat data buku...</p>
    </div>

    <div v-else-if="error" class="p-4 bg-red-100 text-red-800 rounded mb-4">
      <i class="pi pi-exclamation-triangle mr-2"></i>
      {{ error }}
    </div>

    <DataView v-else :value="filteredBooks" :layout="layout">
      <template #list="slotProps">
        <div class="flex flex-col">
          <div v-for="item in slotProps.items" :key="item.id" class="flex p-4 gap-4 border-b">
            <div class="w-28 h-32 flex-shrink-0">
              <img 
                v-if="item.image" 
                :src="`${baseUrl}/uploads/${item.image}`" 
                class="w-full h-full object-cover rounded"
                :alt="item.title" 
              />
              <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center rounded">
                <i class="pi pi-image text-2xl text-gray-400" />
              </div>
            </div>
            <div class="flex-1">
              <div class="font-semibold text-lg">{{ item.title }}</div>
              <div class="text-sm text-surface-500">Penulis: {{ item.author }}</div>
              <div class="text-sm text-gray-500">Kode Buku: {{ item.kodebuku }}</div>
              
              <div class="text-sm">Tahun: {{ item.tahun }}</div>
              <div class="text-sm">Jumlah: {{ item.quantity }}</div>
              <Button 
                label="Pinjam" 
                icon="pi pi-book" 
                severity="success" 
                size="small" 
                class="mt-2" 
                @click="addToCart(item)" 
                :loading="isCheckingStock"
              />
            </div>
          </div>
        </div>
      </template>

      <template #grid="slotProps">
        <div class="grid grid-cols-12 gap-4">
          <div v-for="item in slotProps.items" :key="item.id" class="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3">
            <div class="p-4 border rounded flex flex-col gap-2 h-full">
              <div class="w-full h-48 overflow-hidden">
                <img 
                  v-if="item.image" 
                  :src="`${baseUrl}/uploads/${item.image}`" 
                  class="w-full h-full object-cover rounded"
                  :alt="item.title" 
                />
                <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center rounded">
                  <i class="pi pi-image text-4xl text-gray-400" />
                </div>
              </div>
              <div class="text-lg font-medium line-clamp-2">{{ item.title }}</div>
              <div class="text-sm text-surface-500">Penulis: {{ item.author }}</div>
              <div class="text-sm text-gray-500">Kode: {{ item.kodebuku }}</div>
              <div class="mt-auto pt-2">
                <Button 
                  label="Pinjam" 
                  icon="pi pi-book" 
                  severity="success" 
                  size="small" 
                  class="w-full" 
                  @click="addToCart(item)" 
                  :loading="isCheckingStock"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </DataView>

    <Dialog v-model:visible="showCartDialog" modal header="Keranjang Peminjaman" :style="{ width: '500px' }">
      <div v-if="cart.length" class="flex flex-col gap-2 p-4">
        <div v-for="item in cart" :key="item.id" class="flex justify-between items-center border-b pb-2">
          <div class="flex items-center gap-3">
            <div class="w-12 h-16 flex-shrink-0">
              <img 
                v-if="item.image" 
                :src="`${baseUrl}/uploads/${item.image}`" 
                class="w-full h-full object-cover rounded"
                :alt="item.title" 
              />
              <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center rounded-sm">
                <i class="pi pi-image text-lg text-gray-400" />
              </div>
            </div>
            <div>
              <div class="font-semibold line-clamp-1">{{ item.title }}</div>
            </div>
          </div>
          <Button icon="pi pi-times" text severity="danger" @click="removeFromCart(item)" />
        </div>
        <div class="flex justify-end mt-4">
          <Button 
            label="Konfirmasi Peminjaman" 
            icon="pi pi-check" 
            @click="processBorrow" 
            :loading="isProcessing"
          />
        </div>
      </div>
      <div v-else class="text-center text-gray-500 p-4">
        <i class="pi pi-shopping-cart text-4xl text-gray-300 mb-2" />
        <div>Keranjang kosong</div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.card {
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: white;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>