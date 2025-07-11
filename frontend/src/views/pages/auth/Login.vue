<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/auth';

const username = ref('');
const password = ref('');
const loading = ref(false);
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const checked = ref(false);
async function handleLogin() {
  if (!username.value || !password.value) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Username dan password harus diisi',
      life: 3000
    });
    return;
  }

  try {
    loading.value = true;
    await authStore.login(username.value, password.value);
    
    toast.add({
      severity: 'success',
      summary: 'Login Berhasil',
      detail: 'Anda akan diarahkan ke dashboard',
      life: 3000
    });
    
    router.push('/');
  } catch (error) {
    let errorMessage = 'Terjadi kesalahan saat login';
    
    if (error.response?.status === 401) {
      errorMessage = 'Username atau password salah';
    } else if (error.response?.status === 500) {
      errorMessage = 'Masalah server, coba lagi nanti';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.add({
      severity: 'error',
      summary: 'Login Gagal',
      detail: errorMessage,
      life: 3000
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
    <div class="flex flex-col items-center justify-center">
      <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
        <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
          <div class="text-center mb-8">
            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Selamat Datang</div>
            <span class="text-muted-color font-medium">Silakan login untuk melanjutkan</span>
          </div>

          <form @submit.prevent="handleLogin">
            <label for="username" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Username</label>
            <InputText 
              id="username" 
              type="text" 
              placeholder="Username" 
              class="w-full md:w-[30rem] mb-8" 
              v-model="username"
              :disabled="loading"
            />

            <label for="password" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Password</label>
           <Password id="password" v-model="password" placeholder="Password" :toggleMask="true" class="mb-4" fluid :feedback="false"></Password>

            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
              <div class="flex items-center">
                <Checkbox v-model="checked" id="rememberme" binary class="mr-2" :disabled="loading" />
                <label for="rememberme">Ingat saya</label>
              </div>
              <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Lupa password?</span>
            </div>

            <Button 
              label="Sign In" 
              class="w-full" 
              type="submit"
              :loading="loading"
            />
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pi-eye {
  transform: scale(1.6);
  margin-right: 1rem;
}

.pi-eye-slash {
  transform: scale(1.6);
  margin-right: 1rem;
}
</style>