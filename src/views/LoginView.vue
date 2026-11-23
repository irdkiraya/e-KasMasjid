<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-white p-8 rounded-xl shadow-md border border-gray-100">
      <div class="text-center mb-6">
        <div class="text-4xl mb-2">🕌</div>
        <h2 class="text-2xl font-bold text-emerald-800">Login Pengurus DKM</h2>
        <p class="text-sm text-gray-500 mt-1">Masuk untuk mencatat kas atau menyetujui transaksi</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Email Pengurus</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="bendahara@masjid.com"
            class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-emerald-500"
          />
        </div>

        <p v-if="errorMsg" class="text-sm text-red-600 bg-red-50 p-2.5 rounded-lg">
          {{ errorMsg }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50"
        >
          {{ loading ? 'Memeriksa...' : 'Masuk ke Sistem' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'

const emit = defineEmits(['login-success'])

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) throw error
    emit('login-success', data.user)
  } catch (err) {
    errorMsg.value = 'Email atau password salah: ' + err.message
  } finally {
    loading.value = false
  }
}
</script>