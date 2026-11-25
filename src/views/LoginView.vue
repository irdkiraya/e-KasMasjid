<template>
  <div class="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-emerald-100 space-y-6">
      
      <!-- Header Logo & Judul -->
      <div class="text-center space-y-2">
        <span class="text-4xl">🕌</span>
        <h2 class="text-2xl font-extrabold text-emerald-900">Login Pengurus DKM</h2>
        <p class="text-xs text-gray-500">Masuk untuk mencatat kas atau menyetujui transaksi</p>
      </div>

      <!-- Form Login -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Email Pengurus</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="bendahara@masjid.com"
            class="w-full border border-gray-300 rounded-xl p-3 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full border border-gray-300 rounded-xl p-3 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition shadow-md disabled:opacity-50 text-sm tracking-wide"
        >
          {{ loading ? 'Memproses...' : 'Masuk ke Sistem' }}
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

const handleLogin = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) throw error

    if (data?.user) {
      emit('login-success', data.user)
    }
  } catch (err) {
    alert('Gagal Login: ' + err.message)
  } finally {
    loading.value = false
  }
}
</script>