<template>
  <div class="p-6 max-w-5xl mx-auto space-y-8">
    
    <!-- HEADER MASJID AL MUHAJIRIN & LAPORAN KAS PUBLIK -->
    <div class="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-5 md:px-8 md:py-6 flex items-center justify-between gap-6 shadow-sm">
      <div>
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-emerald-950 tracking-wide leading-tight">
          MASJID AL MUHAJIRIN
        </h1>
        <p class="text-base md:text-lg font-semibold text-emerald-700 mt-1.5">
          Laporan Kas Publik Masjid
        </p>
      </div>

      <img
        src="/logo-masjid.png"
        alt="Logo Masjid Al Muhajirin"
        class="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 object-contain shrink-0 drop-shadow-sm"
      />
    </div>

    <!-- 1. RINGKASAN 3 KANTONG SALDO KAS -->
    <div>
      <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 class="text-xl font-bold text-gray-800">Saldo Kas Masjid Terkini</h2>
        <span class="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
          Total Keseluruhan: Rp {{ totalAllWallets.toLocaleString('id-ID') }}
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="w in wallets"
          :key="w.id"
          class="bg-white p-5 rounded-xl shadow-sm border-l-4"
          :class="{
            'border-emerald-600': w.type === 'operasional',
            'border-blue-600': w.type === 'zakat',
            'border-amber-500': w.type === 'wakaf'
          }"
        >
          <p class="text-sm text-gray-500 font-medium">{{ w.name }}</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">
            Rp {{ Number(w.balance).toLocaleString('id-ID') }}
          </p>
        </div>
      </div>
    </div>

    <!-- 2. DASHBOARD CASHFLOW DINAMIS KHUSUS JAMAAH (TAMPIL JIKA BUKAN PENGURUS) -->
    <div v-if="!isPengurus" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Kartu Kiri: Ringkasan Arus Kas & Rasio -->
      <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between space-y-4">
        <div>
          <h3 class="text-base font-bold text-gray-800">📊 Ringkasan Cashflow Kas Masjid</h3>
          <p class="text-xs text-gray-500 mt-0.5">Perbandingan total dana masuk dan penyaluran operasional masjid</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl">
            <span class="text-xs font-semibold text-emerald-800">Total Pemasukan</span>
            <p class="text-lg sm:text-xl font-extrabold text-emerald-700 mt-1">
              + Rp {{ totalApprovedIncome.toLocaleString('id-ID') }}
            </p>
          </div>
          <div class="bg-red-50 border border-red-100 p-3.5 rounded-xl">
            <span class="text-xs font-semibold text-red-800">Total Pengeluaran</span>
            <p class="text-lg sm:text-xl font-extrabold text-red-600 mt-1">
              - Rp {{ totalApprovedExpense.toLocaleString('id-ID') }}
            </p>
          </div>
        </div>

        <!-- Progress Bar Rasio Penggunaan Dana -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs font-semibold text-gray-600">
            <span>Penyerapan Dana: {{ expenseRatio }}%</span>
            <span>Sisa Tersimpan: {{ 100 - expenseRatio }}%</span>
          </div>
          <div class="w-full h-3 bg-emerald-100 rounded-full overflow-hidden flex">
            <div
              class="bg-amber-500 h-full transition-all duration-500"
              :style="{ width: expenseRatio + '%' }"
            ></div>
          </div>
          <div class="flex items-center gap-4 text-[11px] text-gray-500 pt-1">
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Dana Tersalurkan</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-200 inline-block"></span> Saldo Kas Aktif</span>
          </div>
        </div>
      </div>

      <!-- Kartu Kanan: Rincian Penyaluran per Kategori -->
      <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div>
          <h3 class="text-base font-bold text-gray-800">🕌 Alokasi Pengeluaran per Bidang</h3>
          <p class="text-xs text-gray-500 mt-0.5">Rincian penyaluran kas masjid yang telah disahkan DKM</p>
        </div>

        <div v-if="expenseBreakdown.length > 0" class="space-y-3">
          <div v-for="cat in expenseBreakdown" :key="cat.name" class="space-y-1">
            <div class="flex justify-between text-xs font-semibold">
              <span class="text-gray-800">{{ cat.name }}</span>
              <span class="text-gray-700">Rp {{ cat.total.toLocaleString('id-ID') }} ({{ cat.percent }}%)</span>
            </div>
            <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="bg-emerald-600 h-full rounded-full transition-all duration-500"
                :style="{ width: cat.percent + '%' }"
              ></div>
            </div>
          </div>
        </div>
        <div v-else class="text-sm text-gray-400 py-6 text-center">
          Belum ada catatan pengeluaran yang disahkan.
        </div>
      </div>
    </div>

    <!-- 3. ANTREAN VERIFIKASI & PERSETUJUAN (HANYA 3 PENGURUS DKM) -->
    <div v-if="isPengurus && visiblePendingTransactions.length > 0" class="bg-amber-50 border border-amber-200 rounded-xl p-5">
      <h3 class="text-lg font-bold text-amber-900 mb-4">
        📋 Antrean Verifikasi & Persetujuan ({{ visiblePendingTransactions.length }})
      </h3>

      <div class="space-y-4">
        <div
          v-for="item in visiblePendingTransactions"
          :key="item.id"
          class="bg-white p-4 rounded-lg shadow-sm border-l-4"
          :class="item.status === 'pending_bendahara' ? 'border-blue-500' : 'border-amber-500'"
        >
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="text-xs font-bold px-2 py-0.5 rounded"
                  :class="item.status === 'pending_bendahara' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'"
                >
                  {{ item.status === 'pending_bendahara' ? 'Tahap 1: Verifikasi Bendahara' : 'Tahap 2: Persetujuan Ketua DKM' }}
                </span>
                <span v-if="item.is_budget_request" class="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  Pengajuan Budget
                </span>
                <span class="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                  {{ item.categories?.name }}
                </span>
              </div>

              <h4 class="font-bold text-gray-900 mt-1.5">{{ item.description }}</h4>
              <p class="text-sm text-gray-600">
                Nominal:
                <strong :class="item.type === 'income' ? 'text-emerald-700' : 'text-red-600'">
                  Rp {{ Number(item.amount).toLocaleString('id-ID') }}
                </strong>
                • Kantong: {{ item.wallets?.name }}
              </p>

              <div v-if="item.applicant_name" class="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-700">
                <span>Pemohon: <strong>{{ item.applicant_name }}</strong></span>
                <span v-if="item.applicant_sig" class="text-emerald-700 font-semibold">✓ Sudah TTD Pemohon</span>
                <span v-if="item.bendahara_sig" class="text-blue-700 font-semibold">✓ Sudah TTD Bendahara ({{ item.bendahara_name }})</span>
              </div>

              <p v-if="item.witness_1 || item.witness_2" class="text-xs text-gray-700 mt-1">
                Saksi 1: <strong>{{ item.witness_1 }}</strong> | Saksi 2: <strong>{{ item.witness_2 }}</strong>
              </p>

              <a
                v-if="item.receipt_url"
                :href="item.receipt_url"
                target="_blank"
                class="inline-block text-xs font-semibold text-blue-600 underline mt-1.5"
              >
                📄 Buka Dokumen Lampiran / PDF ↗
              </a>
            </div>

            <!-- TOMBOL AKSI SESUAI ROLE PENGURUS -->
            <div class="flex gap-2">
              <template v-if="userRole === 'bendahara' && item.status === 'pending_bendahara'">
                <button
                  @click="handleReject(item.id)"
                  :disabled="processingId === item.id"
                  class="px-3.5 py-2 text-sm font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition"
                >
                  Tolak
                </button>
                <button
                  @click="openApprovalBox(item.id, 'bendahara')"
                  :disabled="processingId === item.id"
                  class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  {{ activeApprovalId === item.id ? 'Batal' : 'Verifikasi & TTD Bendahara ✍️' }}
                </button>
              </template>

              <template v-else-if="userRole === 'ketua_dkm' && item.status === 'pending_ketua'">
                <button
                  @click="handleReject(item.id)"
                  :disabled="processingId === item.id"
                  class="px-3.5 py-2 text-sm font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition"
                >
                  Tolak
                </button>
                <button
                  @click="openApprovalBox(item.id, 'ketua_dkm')"
                  :disabled="processingId === item.id"
                  class="px-4 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition"
                >
                  {{ activeApprovalId === item.id ? 'Batal' : 'Setujui & TTD Ketua DKM ✍️' }}
                </button>
              </template>

              <span v-else class="text-xs italic text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                {{ item.status === 'pending_bendahara' ? 'Menunggu pemeriksaan Bendahara' : 'Menunggu pengesahan Ketua DKM' }}
              </span>
            </div>
          </div>

          <!-- KOTAK PEMBUBUHAN TANDA TANGAN -->
          <div v-if="activeApprovalId === item.id" class="mt-4 pt-4 border-t border-gray-200 bg-gray-50 p-4 rounded-lg space-y-3">
            <p class="text-xs font-bold uppercase tracking-wide" :class="userRole === 'bendahara' ? 'text-blue-900' : 'text-emerald-900'">
              ✍️ Pembubuhan Tanda Tangan {{ userRole === 'bendahara' ? 'Bendahara Umum' : 'Ketua DKM' }}
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">
                  Nama Lengkap {{ userRole === 'bendahara' ? 'Bendahara Umum' : 'Ketua DKM' }} *
                </label>
                <input
                  v-model="approverName"
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap"
                  class="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Goreskan Tanda Tangan di Layar *</label>
                <SignaturePad ref="approvalSigPad" />
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button
                @click="activeApprovalId = null"
                class="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Batal
              </button>
              <button
                v-if="userRole === 'bendahara'"
                @click="submitBendaharaApproval(item)"
                :disabled="processingId === item.id"
                class="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
              >
                {{ processingId === item.id ? 'Menyimpan...' : 'Simpan Verifikasi & TTD ✓' }}
              </button>
              <button
                v-else-if="userRole === 'ketua_dkm'"
                @click="submitKetuaApproval(item)"
                :disabled="processingId === item.id"
                class="px-5 py-2 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition disabled:opacity-50"
              >
                {{ processingId === item.id ? 'Menyimpan...' : 'Simpan Pengesahan & TTD ✓' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. PENYELESAIAN SPJ & DOKUMENTASI BON BELANJA (HANYA 3 PENGURUS DKM) -->
    <div v-if="isPengurus && openSpjList.length > 0" class="bg-purple-50 border border-purple-200 rounded-xl p-5">
      <div class="mb-4">
        <h3 class="text-lg font-bold text-purple-900">
          🧾 Penyelesaian SPJ & Dokumentasi Bon ({{ openSpjList.length }})
        </h3>
        <p class="text-xs text-purple-700">
          Budget berikut sudah dicairkan. Unggah foto bon/nota belanja untuk menyelesaikan laporan pertanggungjawaban.
        </p>
      </div>

      <div class="space-y-4">
        <div
          v-for="spj in openSpjList"
          :key="spj.id"
          class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-600"
        >
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <span class="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                Dana Cair • Menunggu Bon SPJ
              </span>
              <h4 class="font-bold text-gray-900 mt-1">{{ spj.description }}</h4>
              <p class="text-sm text-gray-600">
                Budget Dicairkan: <strong class="text-purple-800">Rp {{ Number(spj.amount).toLocaleString('id-ID') }}</strong>
                • {{ spj.categories?.name }}
              </p>
            </div>

            <button
              @click="activeSpjId = (activeSpjId === spj.id ? null : spj.id); actualAmount = spj.amount"
              class="px-4 py-2 text-sm font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition"
            >
              {{ activeSpjId === spj.id ? 'Tutup Form SPJ' : '+ Lengkapi Bon SPJ' }}
            </button>
          </div>

          <div v-if="activeSpjId === spj.id" class="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">
                  Total Realisasi Belanja Sesuai Bon (Rp) *
                </label>
                <input v-model="actualAmount" type="number" required min="0" class="w-full border border-gray-300 rounded-lg p-2 text-sm" />
                <p v-if="Number(spj.amount) - Number(actualAmount) > 0" class="text-xs text-emerald-700 font-semibold mt-1">
                  Sisa dana Rp {{ (Number(spj.amount) - Number(actualAmount)).toLocaleString('id-ID') }} akan otomatis dikembalikan ke Kas Masjid.
                </p>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">
                  Upload Foto Bon / Nota Belanja (Bisa pilih banyak foto) *
                </label>
                <input type="file" accept="image/*,application/pdf" multiple @change="handleSpjFilesChange" class="w-full text-xs text-gray-600 border border-gray-300 rounded-lg p-1.5" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Catatan Rincian Belanja SPJ</label>
              <input v-model="spjNotes" type="text" placeholder="Contoh: Nota konsumsi Rp 500rb, Bisyarah Ustadz Rp 500rb" class="w-full border border-gray-300 rounded-lg p-2 text-sm" />
            </div>

            <div class="flex justify-end">
              <button
                @click="submitSpjCompletion(spj)"
                :disabled="processingId === spj.id"
                class="px-5 py-2 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition disabled:opacity-50"
              >
                {{ processingId === spj.id ? 'Mengunggah Bon...' : 'Simpan & Selesaikan SPJ ✓' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. RIWAYAT TRANSAKSI DINAMIS (CASHFLOW BERSIH UNTUK JAMAAH) -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 class="text-lg font-bold text-gray-800">
          {{ isPengurus ? 'Riwayat Transaksi & Dokumentasi SPJ' : 'Riwayat Penerimaan & Pengeluaran Kas' }}
        </h3>

        <!-- Filter Interaktif -->
        <div class="flex flex-wrap items-center gap-2">
          <button
            @click="filterType = 'all'"
            :class="filterType === 'all' ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            class="px-3 py-1 rounded-lg text-xs font-bold transition"
          >
            Semua
          </button>
          <button
            @click="filterType = 'income'"
            :class="filterType === 'income' ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            class="px-3 py-1 rounded-lg text-xs font-bold transition"
          >
            Pemasukan (+)
          </button>
          <button
            @click="filterType = 'expense'"
            :class="filterType === 'expense' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            class="px-3 py-1 rounded-lg text-xs font-bold transition"
          >
            Pengeluaran (-)
          </button>
          <button @click="fetchDashboardData" class="text-xs text-emerald-700 hover:underline font-semibold ml-2">
            ↻ Muat Ulang
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-600 text-xs uppercase border-b">
              <th class="p-3.5">Tanggal</th>
              <th class="p-3.5">Kategori & Keterangan</th>
              <th class="p-3.5">Kantong Kas</th>
              <th class="p-3.5">Nominal</th>
              <th class="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-sm">
            <tr v-for="trx in displayedTransactions" :key="trx.id" class="hover:bg-gray-50">
              <td class="p-3.5 whitespace-nowrap text-gray-500">
                {{ new Date(trx.transaction_date).toLocaleDateString('id-ID') }}
              </td>
              <td class="p-3.5">
                <div class="font-semibold text-gray-900">{{ trx.categories?.name }}</div>
                <div class="text-gray-500 text-xs">{{ trx.description }}</div>
                <div v-if="isPengurus && trx.applicant_name" class="text-gray-600 text-xs mt-0.5">
                  Pemohon: <strong>{{ trx.applicant_name }}</strong>
                  <span v-if="trx.bendahara_name"> • Verifikator: <strong>{{ trx.bendahara_name }}</strong></span>
                  <span v-if="trx.ketua_name"> • Pengesah: <strong>{{ trx.ketua_name }}</strong></span>
                </div>
                <div v-if="isPengurus && trx.spj_notes" class="text-purple-700 text-xs mt-0.5">
                  SPJ: {{ trx.spj_notes }}
                </div>
                <div v-if="trx.witness_1 || trx.witness_2" class="text-emerald-700 text-xs mt-0.5">
                  Saksi Penghitung: {{ trx.witness_1 }} & {{ trx.witness_2 }}
                </div>

                <!-- TAUTAN LAMPIRAN & TOMBOL CETAK PDF HANYA UNTUK PENGURUS DKM -->
                <div v-if="isPengurus" class="flex flex-wrap items-center gap-2 mt-1.5">
                  <button
                    v-if="userRole === 'bendahara' && trx.type === 'expense' && (trx.applicant_sig || trx.bendahara_sig || trx.ketua_sig)"
                    @click="printVoucherPDF(trx)"
                    class="text-xs bg-blue-50 text-blue-800 border border-blue-300 px-2.5 py-0.5 rounded font-bold hover:bg-blue-100 transition cursor-pointer"
                  >
                    🖨️ Cetak Bukti PDF (3 TTD)
                  </button>

                  <a v-if="trx.receipt_url" :href="trx.receipt_url" target="_blank" class="text-xs text-blue-600 underline">
                    Lampiran Dokumen
                  </a>
                  <a
                    v-for="(bonUrl, idx) in (trx.spj_receipt_urls || [])"
                    :key="idx"
                    :href="bonUrl"
                    target="_blank"
                    class="text-xs text-purple-700 font-semibold underline"
                  >
                    [Bon #{{ idx + 1 }}]
                  </a>
                </div>
              </td>
              <td class="p-3.5 text-gray-600">{{ trx.wallets?.name }}</td>
              <td
                class="p-3.5 font-bold whitespace-nowrap"
                :class="trx.type === 'income' ? 'text-emerald-600' : 'text-red-600'"
              >
                <div>
                  {{ trx.type === 'income' ? '+' : '-' }} Rp {{ Number(trx.actual_amount ?? trx.amount).toLocaleString('id-ID') }}
                </div>
                <div v-if="isPengurus && trx.is_budget_request && trx.actual_amount !== null && trx.actual_amount !== trx.amount" class="text-xs font-normal text-gray-400">
                  (Budget awal: Rp {{ Number(trx.amount).toLocaleString('id-ID') }})
                </div>
              </td>
              <td class="p-3.5">
                <span v-if="isPengurus && trx.is_budget_request && trx.status === 'approved' && trx.actual_amount === null" class="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                  Cair (Belum SPJ)
                </span>
                <span v-else-if="isPengurus && trx.is_budget_request && trx.actual_amount !== null" class="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                  SPJ Selesai ✓
                </span>
                <span v-else-if="trx.status === 'approved'" class="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                  Disetujui DKM
                </span>
                <span v-else-if="trx.status === 'pending_bendahara'" class="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  Menunggu Bendahara
                </span>
                <span v-else-if="trx.status === 'pending_ketua'" class="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                  Menunggu Ketua
                </span>
                <span v-else class="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                  Ditolak
                </span>
              </td>
            </tr>
            <tr v-if="displayedTransactions.length === 0">
              <td colspan="5" class="p-6 text-center text-gray-400">Belum ada data transaksi pada kategori ini.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { jsPDF } from 'jspdf'
import { supabase } from '../supabase'
import SignaturePad from '../components/SignaturePad.vue'

const props = defineProps({
  user: { type: Object, default: null },
  userRole: { type: String, default: null }
})

const wallets = ref([])
const transactions = ref([])
const processingId = ref(null)
const filterType = ref('all')

const isPengurus = computed(() => {
  return ['pelaksana_harian', 'bendahara', 'ketua_dkm'].includes(props.userRole)
})

const activeApprovalId = ref(null)
const approverName = ref('')
const approvalSigPad = ref(null)

const activeSpjId = ref(null)
const actualAmount = ref(0)
const spjNotes = ref('')
const spjFiles = ref([])

const totalAllWallets = computed(() => {
  return wallets.value.reduce((sum, w) => sum + Number(w.balance || 0), 0)
})

const approvedTransactions = computed(() => {
  return transactions.value.filter(t => t.status === 'approved')
})

const totalApprovedIncome = computed(() => {
  return approvedTransactions.value
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0)
})

const totalApprovedExpense = computed(() => {
  return approvedTransactions.value
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.actual_amount ?? t.amount ?? 0), 0)
})

const expenseRatio = computed(() => {
  if (totalApprovedIncome.value <= 0) return 0
  const pct = Math.round((totalApprovedExpense.value / totalApprovedIncome.value) * 100)
  return Math.min(100, Math.max(0, pct))
})

const expenseBreakdown = computed(() => {
  const map = {}
  const expenses = approvedTransactions.value.filter(t => t.type === 'expense')
  const grandTotal = totalApprovedExpense.value

  expenses.forEach(t => {
    const catName = t.categories?.name || 'Lain-lain'
    const val = Number(t.actual_amount ?? t.amount ?? 0)
    map[catName] = (map[catName] || 0) + val
  })

  return Object.entries(map)
    .map(([name, total]) => ({
      name,
      total,
      percent: grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0
    }))
    .sort((a, b) => b.total - a.total)
})

const visiblePendingTransactions = computed(() => {
  return transactions.value.filter(t => t.status === 'pending_bendahara' || t.status === 'pending_ketua')
})

const openSpjList = computed(() => {
  return transactions.value.filter(t => t.is_budget_request && t.status === 'approved' && t.actual_amount === null)
})

const displayedTransactions = computed(() => {
  let base = isPengurus.value ? transactions.value : approvedTransactions.value
  if (filterType.value !== 'all') {
    base = base.filter(t => t.type === filterType.value)
  }
  return base
})

const fetchDashboardData = async () => {
  const { data: walletData } = await supabase.from('wallets').select('*').order('name')
  if (walletData) wallets.value = walletData

  const { data: trxData } = await supabase
    .from('transactions')
    .select(`*, wallets ( name ), categories ( name )`)
    .order('created_at', { ascending: false })
    .limit(50)
  if (trxData) transactions.value = trxData
}

onMounted(fetchDashboardData)

const openApprovalBox = async (trxId, role) => {
  if (activeApprovalId.value === trxId) {
    activeApprovalId.value = null
    return
  }
  activeApprovalId.value = trxId
  if (props.user) {
    const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', props.user.id).single()
    approverName.value = prof?.full_name || (role === 'bendahara' ? 'Bendahara Umum' : 'Ketua DKM')
  }
}

const printVoucherPDF = (trx) => {
  const doc = new jsPDF()
  const tanggalTransaksi = new Date(trx.transaction_date).toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  const tanggalCetak = new Date().toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('DEWAN KEMAKMURAN MASJID (DKM)', 105, 18, { align: 'center' })
  doc.setFontSize(15)
  doc.text('MASJID AL MUHAJIRIN', 105, 25, { align: 'center' })
  doc.setLineWidth(0.6)
  doc.line(15, 30, 195, 30)

  doc.setFontSize(12)
  doc.text(
    trx.is_budget_request
      ? 'BUKTI PENGAJUAN & PERSETUJUAN ANGGARAN (KASBON)'
      : 'BUKTI PENGESAHAN PENGELUARAN KAS MASJID',
    105,
    40,
    { align: 'center' }
  )

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Tanggal Pengajuan : ${tanggalTransaksi}`, 20, 52)
  doc.text(`Nomor Referensi   : TRX-${String(trx.id).substring(0, 8).toUpperCase()}`, 20, 58)
  doc.text(`Status Dokumen    : ${trx.status === 'approved' ? 'DISETUJUI / SAH' : trx.status.toUpperCase()}`, 20, 64)

  doc.setFont('helvetica', 'bold')
  doc.text('Sumber Kantong Kas', 20, 76)
  doc.text(`: ${trx.wallets?.name || '-'}`, 70, 76)

  doc.text('Kategori Anggaran', 20, 83)
  doc.text(`: ${trx.categories?.name || '-'}`, 70, 83)

  doc.text('Nominal Pengajuan', 20, 90)
  doc.text(`: Rp ${Number(trx.amount).toLocaleString('id-ID')}`, 70, 90)

  if (trx.actual_amount !== null && trx.actual_amount !== undefined) {
    doc.text('Realisasi SPJ', 20, 97)
    doc.text(`: Rp ${Number(trx.actual_amount).toLocaleString('id-ID')}`, 70, 97)
  }

  const yDesc = trx.actual_amount !== null && trx.actual_amount !== undefined ? 104 : 97
  doc.text('Uraian Keperluan', 20, yDesc)
  doc.setFont('helvetica', 'normal')
  const splitDesc = doc.splitTextToSize(`: ${trx.description}`, 120)
  doc.text(splitDesc, 70, yDesc)

  const yHeader = 132
  const ySig = 137
  const yName = 166

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Pemohon / Pelaksana,', 42, yHeader, { align: 'center' })
  doc.text('Diverifikasi Bendahara,', 105, yHeader, { align: 'center' })
  doc.text('Disetujui Ketua DKM,', 168, yHeader, { align: 'center' })

  if (trx.applicant_sig) doc.addImage(trx.applicant_sig, 'PNG', 20, ySig, 44, 20)
  if (trx.bendahara_sig) doc.addImage(trx.bendahara_sig, 'PNG', 83, ySig, 44, 20)
  if (trx.ketua_sig) doc.addImage(trx.ketua_sig, 'PNG', 146, ySig, 44, 20)

  doc.setFontSize(9.5)
  doc.text(`( ${trx.applicant_name || 'Pelaksana Harian'} )`, 42, yName, { align: 'center' })
  doc.text(`( ${trx.bendahara_name || 'Bendahara Umum'} )`, 105, yName, { align: 'center' })
  doc.text(`( ${trx.ketua_name || 'Ketua DKM'} )`, 168, yName, { align: 'center' })

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8.5)
  doc.text(
    `Dicetak oleh Bendahara Umum pada ${tanggalCetak} melalui Sistem Keuangan e-KasMasjid Al Muhajirin.`,
    105,
    185,
    { align: 'center' }
  )

  const pdfBlobUrl = doc.output('bloburl')
  window.open(pdfBlobUrl, '_blank')
}

const submitBendaharaApproval = async (trx) => {
  const sigImg = approvalSigPad.value?.[0]?.getSignatureImage() || approvalSigPad.value?.getSignatureImage()
  if (!sigImg) {
    alert('Bendahara wajib membubuhkan tanda tangan di layar terlebih dahulu!')
    return
  }

  processingId.value = trx.id
  try {
    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'pending_ketua',
        bendahara_approved_by: props.user.id,
        bendahara_approved_at: new Date().toISOString(),
        bendahara_name: approverName.value || 'Bendahara Umum',
        bendahara_sig: sigImg
      })
      .eq('id', trx.id)

    if (error) throw error
    alert('Verifikasi & TTD Bendahara berhasil disimpan! Diteruskan ke Ketua DKM.')
    activeApprovalId.value = null
    await fetchDashboardData()
  } catch (error) {
    alert('Gagal memproses verifikasi: ' + error.message)
  } finally {
    processingId.value = null
  }
}

const submitKetuaApproval = async (trx) => {
  const sigImg = approvalSigPad.value?.[0]?.getSignatureImage() || approvalSigPad.value?.getSignatureImage()
  if (!sigImg) {
    alert('Ketua DKM wajib membubuhkan tanda tangan di layar terlebih dahulu!')
    return
  }

  processingId.value = trx.id
  try {
    const finalKetuaName = approverName.value || 'Ketua DKM'

    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'approved',
        approved_by: props.user.id,
        approved_at: new Date().toISOString(),
        ketua_name: finalKetuaName,
        ketua_sig: sigImg
      })
      .eq('id', trx.id)

    if (error) throw error
    alert('Disetujui Ketua DKM! Saldo kas masjid telah diperbarui.')
    activeApprovalId.value = null
    await fetchDashboardData()
  } catch (error) {
    alert('Gagal memproses pengesahan: ' + error.message)
  } finally {
    processingId.value = null
  }
}

const handleReject = async (trxId) => {
  if (!confirm('Tolak pengajuan ini?')) return
  processingId.value = trxId
  try {
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'rejected' })
      .eq('id', trxId)

    if (error) throw error
    alert('Pengajuan ditolak.')
    activeApprovalId.value = null
    await fetchDashboardData()
  } catch (error) {
    alert('Gagal menolak: ' + error.message)
  } finally {
    processingId.value = null
  }
}

const handleSpjFilesChange = (e) => {
  spjFiles.value = Array.from(e.target.files || [])
}

const submitSpjCompletion = async (spjItem) => {
  if (spjFiles.value.length === 0) {
    alert('Harap pilih minimal 1 foto bon / nota pembayaran untuk dokumentasi SPJ!')
    return
  }

  processingId.value = spjItem.id
  try {
    const uploadedUrls = []

    for (const file of spjFiles.value) {
      const ext = file.name.split('.').pop()
      const fileName = `SPJ_${spjItem.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${ext}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bukti-transaksi')
        .upload(`spj-bon/${fileName}`, file)

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('bukti-transaksi')
        .getPublicUrl(uploadData.path)

      uploadedUrls.push(publicUrlData.publicUrl)
    }

    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        actual_amount: parseFloat(actualAmount.value),
        spj_notes: spjNotes.value || 'Bon belanja telah dilampirkan',
        spj_receipt_urls: uploadedUrls
      })
      .eq('id', spjItem.id)

    if (updateError) throw updateError

    alert('SPJ berhasil diselesaikan & seluruh foto bon telah terdokumentasi!')
    activeSpjId.value = null
    spjFiles.value = []
    spjNotes.value = ''
    await fetchDashboardData()
  } catch (err) {
    alert('Gagal menyimpan SPJ: ' + err.message)
  } finally {
    processingId.value = null
  }
}
</script>