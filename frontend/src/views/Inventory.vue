<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from '@primevue/core/api';
import axios from 'axios';

const toast = useToast();
const dt = ref();
const dialog = ref(false);
const inventoryDialog = ref(false);
const deleteDialog = ref(false);
const submitted = ref(false);
const isRakMode = ref(true);

const raks = ref([]);
const books = ref([]);
const inventories = ref([]);

const selectedRak = ref(null);
const selectedBook = ref(null);
const inventoryItem = ref({});

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

onMounted(async () => {
    try {
        const [raksRes, booksRes] = await Promise.all([
            axios.get('/api/raks'),
            axios.get('/api/books')
        ]);
        raks.value = raksRes.data;
        books.value = booksRes.data;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal mengambil data', life: 3000 });
    }
});

async function loadInventories(rakId) {
    try {
        const response = await axios.get(`/api/raks/${rakId}/inventories`);
        
        if (response.data.success) {
            inventories.value = response.data.data;
        } else {
            throw new Error(response.data.message || 'Data inventory tidak ditemukan');
        }
    } catch (error) {
        console.error('Error loading inventories:', error);
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: error.response?.data?.message || error.message || 'Gagal memuat inventory',
            life: 5000
        });
    }
}

function openNew() {
    inventoryItem.value = {};
    submitted.value = false;
    dialog.value = true;
}

function openInventoryDialog(rak) {
    selectedRak.value = rak;
    inventoryItem.value = { rak_id: rak.id, jumlah: 0 };
    inventoryDialog.value = true;
}

function hideDialog() {
    dialog.value = false;
    inventoryDialog.value = false;
    selectedRak.value = null;
    selectedBook.value = null;
}

async function saveRak() {
    submitted.value = true;

    // Validasi client-side
    if (!inventoryItem.value.kode_rak?.trim()) {
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Kode rak wajib diisi',
            life: 3000
        });
        return;
    }

    if (!inventoryItem.value.lokasi?.trim()) {
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Lokasi wajib diisi',
            life: 3000
        });
        return;
    }

    try {
        const payload = {
            kode_rak: inventoryItem.value.kode_rak.trim(),
            lokasi: inventoryItem.value.lokasi.trim(),
            kapasitas: Number(inventoryItem.value.kapasitas) || 0
        };

        console.log('Payload:', payload);

        const response = await axios.post('/api/raks', payload, {
            headers: {
                'Content-Type': 'application/json'
            },
            validateStatus: (status) => {
                return status < 500; // Tangkap semua error kecuali 500
            }
        });

        if (response.data.success) {
            // Handle success
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Rak berhasil disimpan',
                life: 3000
            });
            dialog.value = false;
            // Refresh data
            const res = await axios.get('/api/raks');
            raks.value = res.data;
        } else {
            // Handle custom error messages
            let errorMsg = response.data.message;
            if (response.data.errors) {
                errorMsg += ': ' + response.data.errors.map(e => e.message).join(', ');
            }
            throw new Error(errorMsg);
        }
    } catch (error) {
        console.error('Full error:', error);
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: error.message || 'Terjadi kesalahan saat menyimpan rak',
            life: 5000
        });
    }
}

async function saveInventory() {
    submitted.value = true;

    if (!inventoryItem.value.buku_id || !inventoryItem.value.jumlah) {
        return;
    }

    try {
        const url = '/api/raks/inventory';
        const method = inventoryItem.value.id ? 'put' : 'post';
        const fullUrl = inventoryItem.value.id ? `${url}/${inventoryItem.value.id}` : url;

        const response = await axios[method](fullUrl, inventoryItem.value);
        
        if (inventoryItem.value.id) {
            const index = inventories.value.findIndex(i => i.id === inventoryItem.value.id);
            inventories.value[index] = response.data;
        } else {
            inventories.value.push(response.data);
        }

        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Inventory berhasil disimpan', life: 3000 });
        inventoryDialog.value = false;
    } catch (error) {
        handleError(error, 'menyimpan inventory');
    }
}

function editInventory(data) {
    inventoryItem.value = { 
        ...data,
        buku_id: data.book.id, 
        rak_id: data.rak_id
    };
    inventoryDialog.value = true;
}

function confirmDelete(data) {
    inventoryItem.value = data;
    deleteDialog.value = true;
}

async function deleteItem() {
    try {
        const url = isRakMode.value ? '/api/raks' : '/api/raks/inventory';
        await axios.delete(`${url}/${inventoryItem.value.id}`);
        
        if (isRakMode.value) {
            raks.value = raks.value.filter(r => r.id !== inventoryItem.value.id);
        } else {
            inventories.value = inventories.value.filter(i => i.id !== inventoryItem.value.id);
        }

        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data berhasil dihapus', life: 3000 });
    } catch (error) {
        handleError(error, 'menghapus data');
    } finally {
        deleteDialog.value = false;
    }
}

function handleError(error, action) {
    console.error(`Error ${action}:`, error);
    
    let errorMessage = `Gagal ${action}`;
    if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
    }

    toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: errorMessage,
        life: 5000
    });
}
</script>

<template>
    <div class="card">
        <Toast />
        <div class="mb-3 flex gap-2">
            <Button label="Master Rak" @click="isRakMode = true" :severity="isRakMode ? 'primary' : 'secondary'" />
            <Button label="Inventory Buku" @click="isRakMode = false" :severity="!isRakMode ? 'primary' : 'secondary'" />
        </div>

        <Toolbar class="mb-4">
            <template #start>
                <Button 
                    :label="isRakMode ? 'Tambah Rak' : 'Tambah Inventory'" 
                    icon="pi pi-plus" 
                    severity="secondary" 
                    class="mr-2" 
                    @click="isRakMode ? openNew() : openInventoryDialog(selectedRak)" 
                    :disabled="!isRakMode && !selectedRak" 
                />
                <Button 
                    label="Hapus" 
                    icon="pi pi-trash" 
                    severity="secondary" 
                    @click="confirmDelete(inventoryItem)" 
                    :disabled="!inventoryItem.id" 
                />
            </template>
        </Toolbar>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Daftar Rak -->
            <div class="col-span-1">
                <DataTable 
                    :value="raks" 
                    selectionMode="single" 
                    v-model:selection="selectedRak"
                    :class="{ 'cursor-pointer': !isRakMode }"
                    @row-select="!isRakMode ? loadInventories($event.data.id) : null"
                >
                    <Column field="kode_rak" header="Kode Rak" sortable />
                    <Column field="lokasi" header="Lokasi" sortable />
                    <Column field="kapasitas" header="Kapasitas" sortable />
                    <Column v-if="isRakMode" :exportable="false">
                        <template #body="slotProps">
                           <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editItem(slotProps.data)" />
                            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDelete(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>
            </div>

            <!-- Daftar Inventory -->
            <div class="col-span-3" v-if="!isRakMode && selectedRak">
                <div class="mb-4">
                    <h3 class="text-lg font-semibold">Inventory Rak: {{ selectedRak.kode_rak }} - {{ selectedRak.lokasi }}</h3>
                    <p>Kapasitas: {{ selectedRak.kapasitas }}</p>
                </div>
                
                <DataTable :value="inventories">
                    <Column field="book.kodebuku" header="Kode Buku" sortable />
                    <Column field="book.title" header="Judul" sortable />
                    <Column field="jumlah" header="Jumlah" sortable />
                    <Column :exportable="false">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editInventory(slotProps.data)" />
                            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDelete(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <Dialog v-model:visible="dialog" :header="inventoryItem.id ? 'Edit Rak' : 'Tambah Rak'" :modal="true" class="p-fluid">
            <div class="grid grid-cols-1 gap-4">
                <div class="field">
                    <label for="kode_rak">Kode Rak</label>
                    <InputText id="kode_rak" v-model="inventoryItem.kode_rak" required :invalid="submitted && !inventoryItem.kode_rak" />
                    <small v-if="submitted && !inventoryItem.kode_rak" class="p-error">Kode rak wajib diisi.</small>
                </div>
                <div class="field">
                    <label for="lokasi">Lokasi</label>
                    <InputText id="lokasi" v-model="inventoryItem.lokasi" required :invalid="submitted && !inventoryItem.lokasi" />
                    <small v-if="submitted && !inventoryItem.lokasi" class="p-error">Lokasi wajib diisi.</small>
                </div>
                <div class="field">
                    <label for="kapasitas">Kapasitas</label>
                    <InputNumber id="kapasitas" v-model="inventoryItem.kapasitas" :min="1" />
                </div>
            </div>
            <template #footer>
                <Button label="Batal" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Simpan" icon="pi pi-check" @click="saveRak" />
            </template>
        </Dialog>

        <Dialog v-model:visible="inventoryDialog" :header="inventoryItem.id ? 'Edit Inventory' : 'Tambah Inventory'" :modal="true" class="p-fluid">
            <div class="grid grid-cols-1 gap-4">
                <div class="field">
                    <label for="buku_id">Buku</label>
                    <Dropdown 
                        id="buku_id" 
                        v-model="inventoryItem.buku_id" 
                        :options="books" 
                        optionLabel="title" 
                        optionValue="id" 
                        placeholder="Pilih Buku"
                        :invalid="submitted && !inventoryItem.buku_id"
                    />
                    <small v-if="submitted && !inventoryItem.buku_id" class="p-error">Buku wajib dipilih.</small>
                </div>
                <div class="field">
                    <label for="jumlah">Jumlah</label>
                    <InputNumber id="jumlah" v-model="inventoryItem.jumlah" :min="0" :invalid="submitted && inventoryItem.jumlah === undefined" />
                    <small v-if="submitted && inventoryItem.jumlah === undefined" class="p-error">Jumlah wajib diisi.</small>
                </div>
            </div>
            <template #footer>
                <Button label="Batal" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Simpan" icon="pi pi-check" @click="saveInventory" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteDialog" header="Konfirmasi" :modal="true" :style="{ width: '450px' }">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-3xl" />
                <span>Yakin ingin menghapus data ini?</span>
            </div>
            <template #footer>
                <Button label="Tidak" icon="pi pi-times" text @click="deleteDialog = false" />
                <Button label="Ya" icon="pi pi-check" @click="deleteItem" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.card {
    padding: 1.5rem;
    border-radius: 8px;
    background: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.field {
    margin-bottom: 1rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}
</style>