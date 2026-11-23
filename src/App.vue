<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- NAVBAR ATAS -->
    <header class="bg-emerald-800 text-white shadow-md sticky top-0 z-40">
      <div class="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <!-- KIRI: JUDUL APLIKASI & IDENTITAS USER -->
        <div class="flex items-center gap-3 cursor-pointer" @click="currentView = 'dashboard'">
          <span class="text-2xl sm:text-3xl">🕌</span>
          <div>
            <h1 class="font-bold text-lg sm:text-xl leading-tight">e-KasMasjid</h1>
            <p class="text-[11px] text-emerald-200">Transparansi Keuangan & Kas DKM</p>

            <!-- Identitas User Tepat di Bawah Tulisan Transparansi -->
            <div v-if="user" class="mt-1.5">
              <span class="inline-flex items-center gap-1.5 text-[11px] font-bold bg-emerald-950/80 text-amber-300 border border-emerald-600 px-2.5 py-0.5 rounded-full">
                <span>{{ roleIcon }}</span>
                <span>{{ formattedUserBadge }}</span>
              </span>
            </div>
            <div v-else class="mt-1">
              <span class="inline-block text-[10px] font-semibold uppercase tracking-wider text-emerald-200">
                Mode Akses Publik (Jamaah)
              </span>
            </div>
          </div>
        </div>

        <!-- KANAN: MENU NAVIGASI -->
        <nav class="flex items-center gap-2">
          <button
            @click="currentView = 'dashboard'"
            :class="currentView === 'dashboard' ? 'bg-emerald-950 text-white' : 'text-emerald-100 hover:bg-emerald-700'"
            class="px-3.5 py-2 rounded-lg text-sm font-semibold transition"
          >
            Dashboard & Saldo
          </button>

          <!-- Tombol Input HANYA muncul untuk 3 Pengurus DKM (Bukan Jamaah) -->
          <button
            v-if="isPengurus"
            @click="currentView = 'form'"
            :class="currentView === 'form' ? 'bg-emerald-950 text-white' : 'text-emerald-100 hover:bg-emerald-700'"
            class="px-3.5 py-2 rounded-lg text-sm font-semibold transition"
          >
            + Catat Transaksi
          </button>

          <button
            v-if="user"
            @click="handleLogout"
            class="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-lg text-sm font-bold transition"
          >
            Keluar
          </button>

          <button
            v-else
            @click="currentView = 'login'"
            class="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow transition"
          >
            Login Pengurus
          </button>
        </nav>
      </div>
    </header>

    <!-- KONTEN UTAMA -->
    <main class="flex-1">
      <LoginView
        v-if="currentView === 'login'"
        @login-success="onLoginSuccess"
      />
      <FormView
        v-else-if="currentView === 'form' && isPengurus"
        :userRole="userRole"
      />
      <ListView
        v-else
        :user="user"
        :userRole="userRole"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from './supabase'
import ListView from './views/ListView.vue'
import FormView from './views/FormView.vue'
import LoginView from './views/LoginView.vue'

const currentView = ref('dashboard')
const user = ref(null)
const userRole = ref(null)
const fullName = ref('')

// Hanya 3 peran pengurus yang berhak mengakses form input
const isPengurus = computed(() => {
  return ['pelaksana_harian', 'bendahara', 'ketua_dkm'].includes(userRole.value)
})

const roleIcon = computed(() => {
  if (userRole.value === 'pelaksana_harian') return '👤'
  if (userRole.value === 'bendahara') return '💼'
  if (userRole.value === 'ketua_dkm') return '👑'
  return '🕌'
})

const roleTitle = computed(() => {
  if (userRole.value === 'pelaksana_harian') return 'Pelaksana Harian'
  if (userRole.value === 'bendahara') return 'Bendahara Umum'
  if (userRole.value === 'ketua_dkm') return 'Ketua DKM'
  return 'Jamaah Masjid'
})

const formattedUserBadge = computed(() => {
  const name = fullName.value || user.value?.email?.split('@')[0] || ''
  if (!name || name.toLowerCase() === roleTitle.value.toLowerCase() || userRole.value === 'jamaah') {
    return roleTitle.value
  }
  return `${name} (${roleTitle.value})`
})

const fetchUserProfile = async (currentUser) => {
  if (!currentUser) {
    userRole.value = null
    fullName.value = ''
    return
  }

  const { data } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', currentUser.id)
    .single()

  userRole.value = data?.role || 'jamaah'
  fullName.value = data?.full_name || currentUser.email?.split('@')[0] || 'Jamaah'
}

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  user.value = session?.user || null
  if (user.value) await fetchUserProfile(user.value)

  supabase.auth.onAuthStateChange(async (_event, session) => {
    user.value = session?.user || null
    if (user.value) {
      await fetchUserProfile(user.value)
    } else {
      userRole.value = null
      fullName.value = ''
      currentView.value = 'dashboard'
    }
  })
})

const onLoginSuccess = async (loggedInUser) => {
  user.value = loggedInUser
  await fetchUserProfile(loggedInUser)
  currentView.value = 'dashboard'
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  user.value = null
  userRole.value = null
  fullName.value = ''
  currentView.value = 'dashboard'
}
</script>