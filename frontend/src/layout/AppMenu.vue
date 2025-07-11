<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
    },
    {
         label: 'Transaksi',
          items: [
             { label: 'Pinjam Buku', icon: 'pi pi-fw pi-id-card', to: '/Transaksi' },
                { label: 'History Peminjaman', icon: 'pi pi-fw pi-id-card', to: '/HistoryPeminjaman' }
             ]
    },
    {
        label: 'Master Data',
        items: [
                { label: 'Master Data', icon: 'pi pi-fw pi-id-card', to: '/MasterData' },
                { label: 'Inventory', icon: 'pi pi-fw pi-id-card', to: '/Inventory' }
             ]
    },
   
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
