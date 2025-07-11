<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from '@primevue/core/api';
import axios from 'axios';

onMounted(async () => {
    try {
        const [booksRes, studentsRes] = await Promise.all([
            axios.get('/api/books'),
            axios.get('/api/students')
        ]);
        books.value = booksRes.data;
        students.value = studentsRes.data;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal mengambil data', life: 3000 });
    }
});

const toast = useToast();
const dt = ref();
const dialog = ref(false);
const deleteDialog = ref(false);
const deleteSelectedDialog = ref(false);
const submitted = ref(false);
const imageFile = ref(null);
const baseUrl = import.meta.env.VITE_API_URL;
const isBookMode = ref(true);
const books = ref([]);
const students = ref([]);

const statusOptions = ['Aktif', 'Non Aktif'];
const yearOptions = Array.from({ length: 30 }, (_, i) => {
    const year = 2000 + i;
    return { label: `${year}`, value: year };
});

const selectedItems = ref();
const item = ref({});
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

function openNew() {
    item.value = {};
    imageFile.value = null;
    submitted.value = false;
    dialog.value = true;
}

function hideDialog() {
    dialog.value = false;
    submitted.value = false;
}

async function saveItem() {
  submitted.value = true;

  if (!isBookMode.value) {
    if (!item.value.nim) {
      toast.add({ severity: 'error', summary: 'Gagal', detail: 'NIM wajib diisi', life: 3000 });
      return;
    }
    if (!item.value.name) {
      toast.add({ severity: 'error', summary: 'Gagal', detail: 'Nama wajib diisi', life: 3000 });
      return;
    }
  } else {
    if (!item.value.title) {
      toast.add({ severity: 'error', summary: 'Gagal', detail: 'Judul wajib diisi', life: 3000 });
      return;
    }
  }

  try {
    const url = isBookMode.value ? '/api/books' : '/api/students';
    const method = item.value.id ? 'put' : 'post';
    const fullUrl = item.value.id ? `${url}/${item.value.id}` : url;

    if (!isBookMode.value) {
      const response = await axios[method](fullUrl, item.value, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const index = students.value.findIndex(s => s.id === item.value.id);
      if (index >= 0) {
        students.value[index] = response.data;
      } else {
        students.value.push(response.data);
      }
    } 
    else {
      const formData = new FormData();
      for (const key in item.value) {
        if (key !== 'image' && item.value[key] !== undefined && item.value[key] !== null) {
          formData.append(key, item.value[key]);
        }
      }
      if (imageFile.value) {
        formData.append('image', imageFile.value);
      } else if (item.value.image && !item.value.image.startsWith('blob:')) {
        formData.append('existingImage', item.value.image);
      }

      const response = await axios[method](fullUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const index = books.value.findIndex(b => b.id === item.value.id);
      if (index >= 0) {
        books.value[index] = response.data;
      } else {
        books.value.push(response.data);
      }
    }

    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data berhasil disimpan', life: 3000 });
    dialog.value = false;
    item.value = {};
    imageFile.value = null;
  } catch (error) {
    console.error('Error saving item:', error.response?.data || error);
    
    let errorMessage = 'Gagal menyimpan data';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    if (error.response?.data?.errors) {
      errorMessage = error.response.data.errors.join(', ');
    }

    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: errorMessage,
      life: 5000
    });
  }
}
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        imageFile.value = file;
        item.value.image = URL.createObjectURL(file);
    }
}

function editItem(data) {
    item.value = { ...data };
    dialog.value = true;
}

function confirmDelete(data) {
    item.value = data;
    deleteDialog.value = true;
}

async function deleteItem() {
    const list = isBookMode.value ? books : students;
    const url = isBookMode.value ? '/api/books' : '/api/students';

    try {
        await axios.delete(`${url}/${item.value.id}`);
        list.value = list.value.filter((i) => i.id !== item.value.id);
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data dihapus', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menghapus data', life: 3000 });
    }

    deleteDialog.value = false;
    item.value = {};
}

function confirmDeleteSelected() {
    deleteSelectedDialog.value = true;
}

async function deleteSelectedItems() {
    const list = isBookMode.value ? books : students;
    const url = isBookMode.value ? '/api/books' : '/api/students';

    try {
        for (const data of selectedItems.value) {
            await axios.delete(`${url}/${data.id}`);
        }
        list.value = list.value.filter((val) => !selectedItems.value.includes(val));
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data terpilih dihapus', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menghapus sebagian data', life: 3000 });
    }

    deleteSelectedDialog.value = false;
    selectedItems.value = null;
}
</script>

<template>
    <div>
        <Toast />
        <div class="mb-3 flex gap-2">
            <Button label="Master Buku" @click="isBookMode = true" :severity="isBookMode ? 'primary' : 'secondary'" />
            <Button label="Master Mahasiswa" @click="isBookMode = false" :severity="!isBookMode ? 'primary' : 'secondary'" />
        </div>

        <Toolbar class="mb-4">
            <template #start>
                <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                <Button label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" 
                    :disabled="!selectedItems || !selectedItems.length" />
            </template>
        </Toolbar>

        <DataTable
            ref="dt"
            v-model:selection="selectedItems"
            :value="isBookMode ? books : students"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :filters="filters"
            :rowsPerPageOptions="[5, 10, 20]"
            currentPageReportTemplate="Menampilkan {first} ke {last} dari {totalRecords} entri"
        >
            <template #header>
                <div class="flex justify-between">
                    <span class="text-lg font-bold">{{ isBookMode ? 'Daftar Buku' : 'Daftar Mahasiswa' }}</span>
                    <InputText v-model="filters['global'].value" placeholder="Cari..." />
                </div>
            </template>

            <Column selectionMode="multiple" style="width: 3rem" />
            <Column field="id" header="ID" sortable></Column>
            
            <Column v-if="isBookMode" field="kodebuku" header="Kode Buku" sortable></Column>
            <Column v-if="isBookMode" field="title" header="Judul" sortable></Column>
            <Column v-if="isBookMode" field="author" header="Pengarang" sortable></Column>
            <Column v-if="isBookMode" field="penerbit" header="Penerbit" sortable></Column>
            <Column v-if="isBookMode" field="tahun" header="Tahun" sortable></Column>
            <Column v-if="isBookMode" field="kategori" header="Kategori" sortable></Column>
            <Column v-if="isBookMode" header="Cover">
                <template #body="{ data }">
                  <img v-if="data.image" :src="`${baseUrl}/uploads/${data.image}`" alt="Book Cover" />
                </template>
            </Column>

            <Column v-if="!isBookMode" field="nim" header="NIM" sortable></Column>
            <Column v-if="!isBookMode" field="name" header="Nama" sortable></Column>
            <Column v-if="!isBookMode" field="department" header="Jurusan" sortable></Column>
            <Column v-if="!isBookMode" field="angkatan" header="Angkatan" sortable></Column>
            <Column v-if="!isBookMode" field="status" header="Status" sortable></Column>
            <Column v-if="!isBookMode" field="telephone" header="Telepon" sortable></Column>

            <Column :exportable="false">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editItem(slotProps.data)" />
                    <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDelete(slotProps.data)" />
                </template>
            </Column>
        </DataTable>

        <Dialog
            v-model:visible="dialog"
            :style="{ width: '35rem' }"
            :header="isBookMode ? 'Buku' : 'Mahasiswa'"
            :modal="true"
            class="p-fluid"
        >
            <div class="flex flex-col gap-3 mt-3">
                <template v-if="isBookMode">
                    <div class="flex items-center gap-3">
                        <label class="w-32" for="kodebuku">Kode Buku</label>
                        <InputText id="kodebuku" v-model="item.kodebuku" class="flex-1" />
                    </div>

                    <div class="flex items-center gap-3">
                        <label class="w-32" for="title">Judul</label>
                        <div class="flex-1">
                            <InputText id="title" v-model="item.title" :invalid="submitted && !item.title" class="w-full" />
                            <small v-if="submitted && !item.title" class="text-red-500">Judul wajib diisi.</small>
                        </div>
                    </div>

                    <div class="flex items-center gap-3">
                        <label class="w-32" for="author">Pengarang</label>
                        <InputText id="author" v-model="item.author" class="flex-1" />
                    </div>

                    <div class="flex items-center gap-3">
                        <label class="w-32" for="penerbit">Penerbit</label>
                        <InputText id="penerbit" v-model="item.penerbit" class="flex-1" />
                    </div>

                    <div class="flex items-center gap-3">
                        <label class="w-32" for="tahun">Tahun</label>
                        <Dropdown
                            id="tahun"
                            v-model="item.tahun"
                            :options="yearOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Pilih Tahun"
                            class="flex-1"
                        />
                    </div>

                    <div class="flex items-center gap-3">
                        <label class="w-32" for="kategori">Kategori</label>
                        <InputText id="kategori" v-model="item.kategori" class="flex-1" />
                    </div>

                    <div class="flex items-center gap-3">
                        <label class="w-32" for="image">Cover Buku</label>
                        <input type="file" id="image" @change="handleImageUpload" accept="image/*" class="flex-1" />
                    </div>

                    <div v-if="item.image" class="flex justify-center mt-3">
                        <img :src="item.image.startsWith('blob:') ? item.image : `/public/uploads/${item.image}`" 
                             alt="Preview" class="max-w-xs max-h-40" />
                    </div>
                </template>

                <template v-else>
                  <div class="flex items-center gap-3">
                    <label class="w-32" for="nim">NIM*</label>
                    <div class="flex-1">
                      <InputText 
                        id="nim" 
                        v-model="item.nim" 
                        :invalid="submitted && !item.nim" 
                        class="w-full" 
                      />
                      <small v-if="submitted && !item.nim" class="text-red-500">
                        NIM wajib diisi
                      </small>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <label class="w-32" for="name">Nama*</label>
                    <div class="flex-1">
                      <InputText 
                        id="name" 
                        v-model="item.name" 
                        :invalid="submitted && !item.name" 
                        class="w-full" 
                      />
                      <small v-if="submitted && !item.name" class="text-red-500">
                        Nama wajib diisi
                      </small>
                    </div>
                  </div>
                    <div class="flex items-center gap-3">
                        <label class="w-32" for="department">Jurusan</label>
                        <InputText id="department" v-model="item.department" class="flex-1" />
                    </div>

                    <div class="flex items-center gap-3">
                        <label class="w-32" for="angkatan">Angkatan</label>
                        <Dropdown
                            id="angkatan"
                            v-model="item.angkatan"
                            :options="yearOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Pilih Tahun"
                            class="flex-1"
                        />
                    </div>

                    <div class="flex items-center gap-3">
                        <label class="w-32" for="status">Status</label>
                        <Dropdown
                            id="status"
                            v-model="item.status"
                            :options="statusOptions"
                            placeholder="Pilih Status"
                            class="flex-1"
                        />
                    </div>

                    <div class="flex items-center gap-3">
                        <label class="w-32" for="telephone">Telepon</label>
                        <InputText id="telephone" v-model="item.telephone" type="number" class="flex-1" />
                    </div>
                </template>
            </div>

            <template #footer>
                <Button label="Batal" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Simpan" icon="pi pi-check" @click="saveItem" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" header="Konfirmasi" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-3xl" />
                <span>Yakin ingin menghapus <b>{{ item.name || item.title }}</b>?</span>
            </div>
            <template #footer>
                <Button label="Tidak" icon="pi pi-times" text @click="deleteDialog = false" />
                <Button label="Ya" icon="pi pi-check" @click="deleteItem" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteSelectedDialog" :style="{ width: '450px' }" header="Konfirmasi" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-3xl" />
                <span>Yakin ingin menghapus data yang dipilih?</span>
            </div>
            <template #footer>
                <Button label="Tidak" icon="pi pi-times" text @click="deleteSelectedDialog = false" />
                <Button label="Ya" icon="pi pi-check" @click="deleteSelectedItems" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
label {
    font-weight: bold;
}
</style>