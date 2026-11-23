<template>
  <div class="p-6 max-w-2xl mx-auto">
    <!-- Tombol Navigasi Tab -->
    <div class="flex bg-gray-100 p-1 rounded-xl mb-6">
      <button
        @click="activeTab = 'income'"
        :class="activeTab === 'income' ? 'bg-emerald-700 text-white shadow' : 'text-gray-600 hover:text-gray-900'"
        class="flex-1 py-2.5 rounded-lg font-bold transition"
      >
        + Catat Pemasukan
      </button>
      <button
        @click="activeTab = 'expense'"
        :class="activeTab === 'expense' ? 'bg-amber-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'"
        class="flex-1 py-2.5 rounded-lg font-bold transition"
      >
        - Catat Pengeluaran / Budget
      </button>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 class="text-xl font-bold mb-5" :class="activeTab === 'income' ? 'text-emerald-800' : 'text-amber-800'">
        {{ activeTab === 'income' ? 'Formulir Penerimaan Dana Masjid' : 'Formulir Pengeluaran & Pengajuan Budget' }}
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- PILIHAN JENIS PENGELUARAN (FLOW 1 & FLOW 2) -->
        <div v-if="activeTab === 'expense'" class="bg-amber-50 p-3.5 rounded-lg border border-amber-200">
          <label class="block text-xs font-bold text-amber-900 uppercase mb-2">Jenis Pengeluaran</label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <label
              class="flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer bg-white"
              :class="isBudgetRequest ? 'border-amber-600 ring-1 ring-amber-600' : 'border-gray-200'"
            >
              <input type="radio" :value="true" v-model="isBudgetRequest" class="text-amber-600" />
              <div>
                <div class="text-sm font-bold text-gray-900">1. Pengajuan Budget (Kasbon)</div>
                <div class="text-xs text-gray-500">Cair dulu via Bendahara & Ketua, bon menyusul</div>
              </div>
            </label>

            <label
              class="flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer bg-white"
              :class="!isBudgetRequest ? 'border-amber-600 ring-1 ring-amber-600' : 'border-gray-200'"
            >
              <input type="radio" :value="false" v-model="isBudgetRequest" class="text-amber-600" />
              <div>
                <div class="text-sm font-bold text-gray-900">2. Penyelesaian Kasbon</div>
                <div class="text-xs text-gray-500">Pelaporan realisasi belanja & lampiran bon/nota</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Pilih Kantong Dana -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">
            {{ activeTab === 'income' ? 'Masuk ke Kantong Kas' : 'Sumber Dana (Kantong Kas)' }}
          </label>
          <select v-model="walletId" required class="w-full border border-gray-300 rounded-lg p-2.5">
            <option value="">-- Pilih Kantong Dana --</option>
            <option v-for="w in wallets" :key="w.id" :value="w.id">
              {{ w.name }} (Saldo: Rp {{ Number(w.balance).toLocaleString('id-ID') }})
            </option>
          </select>
        </div>

        <!-- Pilih Kategori Dinamis -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Kategori</label>
          <select v-model="categoryId" required class="w-full border border-gray-300 rounded-lg p-2.5">
            <option value="">-- Pilih Kategori --</option>
            <option v-for="c in filteredCategories" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>
        </div>

        <!-- FIELD KHUSUS PEMASUKAN -->
        <template v-if="activeTab === 'income'">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Metode Penerimaan</label>
            <select v-model="paymentMethod" required class="w-full border border-gray-300 rounded-lg p-2.5">
              <option value="kotak_amal">Kotak Amal (Jumat / Harian)</option>
              <option value="tunai">Tunai (Datang Langsung)</option>
              <option value="qris">QRIS Masjid</option>
              <option value="transfer_bank">Transfer Bank</option>
            </select>
          </div>
        </template>

        <!-- Nominal -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">
            {{ activeTab === 'expense' && isBudgetRequest ? 'Nominal Pengajuan Budget (Rp)' : activeTab === 'expense' ? 'Nominal Realisasi Kasbon (Rp)' : 'Nominal (Rp)' }}
          </label>
          <input
            v-model="amount"
            type="number"
            required
            min="1000"
            placeholder="Contoh: 1200000"
            class="w-full border border-gray-300 rounded-lg p-2.5"
          />
          <p v-if="activeTab === 'expense' && isBudgetRequest" class="text-xs text-blue-700 font-medium mt-1">
            *Semua pengajuan budget akan diverifikasi Bendahara lalu disetujui Ketua DKM sebelum dana cair.
          </p>
          <p v-else-if="activeTab === 'expense' && Number(amount) > 1000000" class="text-xs text-amber-600 font-medium mt-1">
            *Penyelesaian kasbon di atas Rp 1.000.000 memerlukan persetujuan Ketua DKM.
          </p>
        </div>

        <!-- Keterangan -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">
            {{ activeTab === 'expense' && isBudgetRequest ? 'Rincian Rencana Penggunaan Budget' : activeTab === 'expense' ? 'Rincian Realisasi Belanja Kasbon' : 'Keterangan / Catatan' }}
          </label>
          <textarea
            v-model="description"
            required
            rows="2"
            :placeholder="
              activeTab === 'income'
                ? 'Contoh: Kotak Amal Minggu ke-2 November'
                : isBudgetRequest
                ? 'Contoh: Pengajuan Budget PHBI Ceramah Maulid (Konsumsi, Bisyarah, Dekorasi)'
                : 'Contoh: Penyelesaian Kasbon PHBI Ceramah Maulid (Nota terlampir)'
            "
            class="w-full border border-gray-300 rounded-lg p-2.5"
          ></textarea>
        </div>

        <!-- KOTAK BERITA ACARA DIGITAL & TANDA TANGAN SAKSI 1 & 2 -->
        <div v-if="activeTab === 'income' && paymentMethod === 'kotak_amal'" class="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-4">
          <div class="border-b border-emerald-200 pb-2">
            <p class="text-xs font-bold text-emerald-900 uppercase tracking-wide">
              📄 Berita Acara Digital Penghitungan Kotak Amal
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-800">Nama Saksi 1 *</label>
              <input v-model="witness1" type="text" required placeholder="Contoh: Bpk. Suko" class="w-full border border-gray-300 rounded-lg p-2 text-sm" />
              <label class="block text-xs font-semibold text-gray-600">Tanda Tangan Saksi 1 *</label>
              <SignaturePad ref="sigPad1" />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-800">Nama Saksi 2 *</label>
              <input v-model="witness2" type="text" required placeholder="Contoh: Bpk. Jatmiko" class="w-full border border-gray-300 rounded-lg p-2 text-sm" />
              <label class="block text-xs font-semibold text-gray-600">Tanda Tangan Saksi 2 *</label>
              <SignaturePad ref="sigPad2" />
            </div>
          </div>
        </div>

        <!-- FIELD DONATUR NON-KOTAK AMAL -->
        <div v-else-if="activeTab === 'income'" class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Nama Donatur</label>
            <input v-model="donorName" type="text" placeholder="Hamba Allah" class="w-full border border-gray-300 rounded-lg p-2.5" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">No. WhatsApp (Opsional)</label>
            <input v-model="donorPhone" type="text" placeholder="0812xxxx" class="w-full border border-gray-300 rounded-lg p-2.5" />
          </div>
        </div>

        <!-- Upload File (RAB untuk Budget, atau Bon/Nota untuk Penyelesaian Kasbon) -->
        <div v-if="!(activeTab === 'income' && paymentMethod === 'kotak_amal')">
          <label class="block text-sm font-semibold text-gray-700 mb-1">
            {{
              activeTab === 'expense' && isBudgetRequest
                ? 'Dokumen Rincian Anggaran / RAB (Opsional)'
                : activeTab === 'expense'
                ? 'Foto Bon / Nota Penyelesaian Kasbon *'
                : 'Foto Bukti Transfer / Nota (Opsional)'
            }}
          </label>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*,application/pdf"
            :required="activeTab === 'expense' && !isBudgetRequest"
            @change="handleFileChange"
            class="w-full text-sm text-gray-600"
          />
          <p v-if="activeTab === 'expense' && !isBudgetRequest" class="text-xs text-gray-500 mt-1">
            *Wajib melampirkan foto bon/nota atau bukti transfer sebagai dokumentasi penyelesaian kasbon.
          </p>
        </div>

        <!-- Tombol Submit -->
        <button
          type="submit"
          :disabled="loading"
          :class="activeTab === 'income' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-amber-600 hover:bg-amber-700'"
          class="w-full text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
        >
          {{
            loading
              ? 'Memproses...'
              : activeTab === 'income'
              ? 'Simpan & Ajukan Validasi'
              : isBudgetRequest
              ? 'Ajukan Budget ke Bendahara & Ketua'
              : 'Simpan Penyelesaian Kasbon'
          }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { jsPDF } from 'jspdf'
import { supabase } from '../supabase'
import SignaturePad from '../components/SignaturePad.vue'

const activeTab = ref('income')
const isBudgetRequest = ref(true)
const wallets = ref([])
const categories = ref([])
const loading = ref(false)

const walletId = ref('')
const categoryId = ref('')
const amount = ref('')
const description = ref('')
const paymentMethod = ref('kotak_amal')
const donorName = ref('Hamba Allah')
const donorPhone = ref('')
const witness1 = ref('')
const witness2 = ref('')
const file = ref(null)
const fileInputRef = ref(null)

const sigPad1 = ref(null)
const sigPad2 = ref(null)

const filteredCategories = computed(() => {
  return categories.value.filter(c => c.type === activeTab.value)
})

const fetchData = async () => {
  const { data: walletData } = await supabase.from('wallets').select('*')
  if (walletData) wallets.value = walletData

  const { data: catData } = await supabase.from('categories').select('*').eq('is_active', true)
  if (catData) categories.value = catData
}

onMounted(fetchData)

const handleFileChange = (e) => {
  file.value = e.target.files?.[0] || null
}

const generateBeritaAcaraPDF = (sig1Img, sig2Img, categoryName, walletName, numericAmount) => {
  const doc = new jsPDF()
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('DEWAN KEMAKMURAN MASJID (DKM)', 105, 20, { align: 'center' })
  doc.setFontSize(13)
  doc.text('BERITA ACARA PENGHITUNGAN KOTAK AMAL', 105, 28, { align: 'center' })
  doc.setLineWidth(0.5)
  doc.line(20, 33, 190, 33)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Pada hari ini, ${today}, telah dilakukan penghitungan kotak amal dengan rincian:`, 20, 45)

  doc.setFont('helvetica', 'bold')
  doc.text('Kategori Dana', 25, 60)
  doc.text(`: ${categoryName}`, 75, 60)
  doc.text('Tujuan Kantong Kas', 25, 68)
  doc.text(`: ${walletName}`, 75, 68)
  doc.text('Total Nominal', 25, 76)
  doc.text(`: Rp ${numericAmount.toLocaleString('id-ID')}`, 75, 76)
  doc.text('Keterangan', 25, 84)
  doc.setFont('helvetica', 'normal')
  doc.text(`: ${description.value}`, 75, 84)

  doc.setFont('helvetica', 'bold')
  doc.text('Saksi Penghitung 1,', 45, 115, { align: 'center' })
  doc.text('Saksi Penghitung 2,', 155, 115, { align: 'center' })

  doc.addImage(sig1Img, 'PNG', 20, 120, 50, 22)
  doc.addImage(sig2Img, 'PNG', 130, 120, 50, 22)

  doc.text(`( ${witness1.value} )`, 45, 150, { align: 'center' })
  doc.text(`( ${witness2.value} )`, 155, 150, { align: 'center' })

  return doc.output('blob')
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Silakan login terlebih dahulu.')

    const numericAmount = parseFloat(amount.value)
    let receiptUrl = null

    if (activeTab.value === 'income' && paymentMethod.value === 'kotak_amal') {
      const sig1Img = sigPad1.value?.getSignatureImage()
      const sig2Img = sigPad2.value?.getSignatureImage()
      if (!sig1Img || !sig2Img) {
        throw new Error('Saksi 1 dan Saksi 2 wajib membubuhkan tanda tangan di layar terlebih dahulu!')
      }

      const selectedCat = categories.value.find(c => c.id === categoryId.value)?.name || 'Kotak Amal'
      const selectedWallet = wallets.value.find(w => w.id === walletId.value)?.name || 'Kas Operasional'

      const pdfBlob = generateBeritaAcaraPDF(sig1Img, sig2Img, selectedCat, selectedWallet, numericAmount)
      const pdfFileName = `BeritaAcara_${Date.now()}.pdf`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bukti-transaksi')
        .upload(`berita-acara/${pdfFileName}`, pdfBlob, { contentType: 'application/pdf' })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('bukti-transaksi')
        .getPublicUrl(uploadData.path)

      receiptUrl = publicUrlData.publicUrl
    } else if (file.value) {
      const fileExt = file.value.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const folder = activeTab.value === 'income' ? 'pemasukan' : 'pengeluaran'

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bukti-transaksi')
        .upload(`${folder}/${fileName}`, file.value)

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('bukti-transaksi')
        .getPublicUrl(uploadData.path)

      receiptUrl = publicUrlData.publicUrl
    }

    // Penentuan Status Persetujuan
    let approvalStatus = 'approved'
    if (activeTab.value === 'income' && paymentMethod.value === 'kotak_amal') {
      approvalStatus = 'pending_bendahara'
    } else if (activeTab.value === 'expense' && isBudgetRequest.value) {
      approvalStatus = 'pending_bendahara'
    } else if (activeTab.value === 'expense' && numericAmount > 1000000) {
      approvalStatus = 'pending_ketua'
    }

    const payload = {
      wallet_id: walletId.value,
      category_id: categoryId.value,
      type: activeTab.value,
      amount: numericAmount,
      description: description.value,
      receipt_url: receiptUrl,
      status: approvalStatus,
      created_by: user.id,
      ...(activeTab.value === 'expense' && {
        is_budget_request: isBudgetRequest.value
      }),
      ...(activeTab.value === 'income' && {
        payment_method: paymentMethod.value,
        donor_name: donorName.value || 'Hamba Allah',
        donor_phone: donorPhone.value,
        witness_1: paymentMethod.value === 'kotak_amal' ? witness1.value : null,
        witness_2: paymentMethod.value === 'kotak_amal' ? witness2.value : null,
      })
    }

    const { error: insertError } = await supabase.from('transactions').insert(payload)
    if (insertError) throw insertError

    if (activeTab.value === 'expense' && isBudgetRequest.value) {
      alert('Pengajuan budget berhasil dikirim ke Bendahara & Ketua DKM! Setelah cair, silakan selesaikan SPJ di Dashboard.')
    } else if (activeTab.value === 'expense' && !isBudgetRequest.value && approvalStatus === 'pending_ketua') {
      alert('Penyelesaian kasbon > Rp 1.000.000 berhasil dicatat dan menunggu persetujuan Ketua DKM.')
    } else if (activeTab.value === 'expense' && !isBudgetRequest.value) {
      alert('Penyelesaian kasbon beserta lampiran bon berhasil dicatat!')
    } else if (approvalStatus === 'pending_bendahara') {
      alert('PDF Berita Acara berhasil dibuat & diteruskan ke Bendahara & Ketua DKM.')
    } else {
      alert('Transaksi berhasil dicatat!')
    }

    amount.value = ''
    description.value = ''
    witness1.value = ''
    witness2.value = ''
    donorPhone.value = ''
    file.value = null
    if (fileInputRef.value) fileInputRef.value.value = ''
    sigPad1.value?.clearCanvas()
    sigPad2.value?.clearCanvas()
    await fetchData()
  } catch (error) {
    alert('Gagal menyimpan: ' + error.message)
  } finally {
    loading.value = false
  }
}
</script>