<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ProgressSpinner from 'primevue/progressspinner';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const filter = ref({
    nim: '', nama: '', kodeBuku: '', judulBuku: '', pengarang: ''
});

const dataHistory = ref([]);
const loading = ref(false);
const error = ref(null);

const showDialog = ref(false);
const selectedId = ref(null);

const openDialog = (id) => {
    selectedId.value = id;
    showDialog.value = true;
};

const closeDialog = () => {
    showDialog.value = false;
    selectedId.value = null;
};

const fetchHistory = async () => {
    try {
        loading.value = true;
        error.value = null;
        const response = await axios.get(`${baseUrl}/api/pinjam/history`);

        if (!response.data.success || !response.data.data) {
            throw new Error('Format response tidak valid');
        }

        dataHistory.value = response.data.data.map(item => ({
            id: item.id,
            nim: item.nim,
            nama: item.nama,
            tanggal_pinjam: item.tanggal_pinjam,
            tanggal_kembali: item.tanggal_kembali,
            Book: {
                kodebuku: item.buku?.kodebuku || '',
                title: item.buku?.judul || '',
                author: item.buku?.pengarang || '',
                penerbit: item.buku?.penerbit || ''
            }
        }));
    } catch (err) {
        console.error(err);
        error.value = err.response?.data?.message || err.message || 'Terjadi kesalahan saat memuat data';
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchHistory();
});

function calculateLoanDays(startDate, endDate) {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.max(end - start, 0);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

const filteredData = computed(() => {
    return dataHistory.value
        .map(item => ({
            ...item,
            lama_pinjam: calculateLoanDays(item.tanggal_pinjam, item.tanggal_kembali)
        }))
        .filter(row => {
            const filterLower = {
                nim: filter.value.nim.toLowerCase(),
                nama: filter.value.nama.toLowerCase(),
                kodeBuku: filter.value.kodeBuku.toLowerCase(),
                judulBuku: filter.value.judulBuku.toLowerCase(),
                pengarang: filter.value.pengarang.toLowerCase()
            };
            return (
                row.nim.toLowerCase().includes(filterLower.nim) &&
                row.nama.toLowerCase().includes(filterLower.nama) &&
                (row.Book?.kodebuku || '').toLowerCase().includes(filterLower.kodeBuku) &&
                (row.Book?.title || '').toLowerCase().includes(filterLower.judulBuku) &&
                (row.Book?.author || '').toLowerCase().includes(filterLower.pengarang)
            );
        });
});

function formatTanggal(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
}

function rowClass(data) {
    return data.lama_pinjam > 14 ? 'highlight-row' : '';
}

const kembalikanBuku = async () => {
    if (!selectedId.value) return;

    try {
        const response = await axios.put(`${baseUrl}/api/pinjam/kembalikan/${selectedId.value}`);
        console.log('Berhasil dikembalikan:', response.data);
        await fetchHistory();
        closeDialog();
    } catch (err) {
        console.error('Gagal mengembalikan:', err);
        alert('Gagal mengembalikan buku. Silakan coba lagi.');
    }
};
</script>

<template>
    <div class="card">
        <h2 class="text-xl font-bold mb-4">History Peminjaman Buku</h2>

        <div v-if="loading" class="text-center p-4">
            <ProgressSpinner />
            <p class="mt-2">Memuat data...</p>
        </div>

        <div v-else-if="error" class="p-4 bg-red-100 text-red-800 rounded mb-4">
            <i class="pi pi-exclamation-triangle mr-2"></i>
            Gagal memuat data: {{ error }}
        </div>

        <div v-else>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                <InputText v-model="filter.nim" placeholder="Filter NIM" />
                <InputText v-model="filter.nama" placeholder="Filter Nama Mahasiswa" />
                <InputText v-model="filter.kodeBuku" placeholder="Filter Kode Buku" />
                <InputText v-model="filter.judulBuku" placeholder="Filter Judul Buku" />
                <InputText v-model="filter.pengarang" placeholder="Filter Pengarang" />
            </div>

            <DataTable
                :value="filteredData"
                paginator
                :rows="5"
                :rowsPerPageOptions="[5, 10, 20]"
                :rowClass="rowClass"
                stripedRows
                removableSort
                class="p-datatable-sm"
            >
                <Column field="nim" header="NIM" sortable />
                <Column field="nama" header="Nama Mahasiswa" sortable />
                <Column field="Book.kodebuku" header="Kode Buku" sortable>
                    <template #body="{ data }">
                        {{ data.Book?.kodebuku || '-' }}
                    </template>
                </Column>
                <Column field="Book.title" header="Judul Buku" sortable>
                    <template #body="{ data }">
                        {{ data.Book?.title || '-' }}
                    </template>
                </Column>
                <Column field="Book.author" header="Pengarang" sortable>
                    <template #body="{ data }">
                        {{ data.Book?.author || '-' }}
                    </template>
                </Column>
                <Column field="Book.penerbit" header="Penerbit">
                    <template #body="{ data }">
                        {{ data.Book?.penerbit || '-' }}
                    </template>
                </Column>
                <Column field="tanggal_pinjam" header="Tanggal Pinjam" sortable>
                    <template #body="{ data }">
                        {{ formatTanggal(data.tanggal_pinjam) }}
                    </template>
                </Column>
                <Column field="tanggal_kembali" header="Tanggal Kembali" sortable>
                    <template #body="{ data }">
                        {{ formatTanggal(data.tanggal_kembali) || 'Belum dikembalikan' }}
                    </template>
                </Column>
                <Column field="lama_pinjam" header="Lama Pinjam" sortable>
                    <template #body="{ data }">
                        <span :class="{ 'text-red-500 font-medium': data.lama_pinjam > 14 }">
                            {{ data.lama_pinjam }} hari
                        </span>
                    </template>
                </Column>
                <Column header="Aksi">
                    <template #body="{ data }">
                        <button 
                            v-if="!data.tanggal_kembali" 
                            @click="openDialog(data.id)" 
                            class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                        >
                            Kembalikan
                        </button>
                        <span v-else class="text-green-600 text-sm">Sudah kembali</span>
                    </template>
                </Column>
            </DataTable>

            <!-- Dialog hanya 1 kali -->
            <Dialog
                v-model:visible="showDialog"
                modal
                header="Konfirmasi Pengembalian"
                :style="{ width: '350px' }"
            >
                <p>Apakah Anda yakin ingin mengembalikan buku ini?</p>
                <template #footer>
                    <Button label="Batal" icon="pi pi-times" class="p-button-text" @click="closeDialog" />
                    <Button label="Kembalikan" icon="pi pi-check" class="p-button-success" @click="kembalikanBuku" />
                </template>
            </Dialog>
        </div>
    </div>
</template>

<style scoped>
.card {
    padding: 2rem;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.highlight-row {
    background-color: #ffe5e5 !important;
}
</style>
