<script setup>
import { ref, onMounted } from 'vue'

const weather = ref('Memuat...')
const greeting = ref('')

function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Selamat pagi ☀️'
    if (hour < 18) return 'Selamat siang 🌤️'
    return 'Selamat malam 🌙'
}

onMounted(async () => {
    greeting.value = getGreeting()

    try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-6.2&longitude=106.8&current_weather=true')
        const data = await res.json()
        const w = data.current_weather
        weather.value = `${w.temperature}°C`
    } catch (e) {
        weather.value = 'Gagal memuat cuaca'
    }
})
</script>

<template>
  <div class="grid grid-cols-12 gap-6">
    <div class="col-span-12">
      <div class="bg-white text-gray-900 rounded-2xl p-6 shadow-md flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-semibold">{{ greeting }}</h1>
          <p class="text-sm text-gray-500">Selamat datang di sistem manajemen perpustakaan 📚</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-500">Cuaca saat ini di Jakarta</p>
          <p class="text-lg font-medium">{{ weather }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
