<template>
  <div :class="isPengurus ? 'p-6 max-w-5xl mx-auto space-y-8' : 'px-4 py-3 max-w-7xl mx-auto space-y-3.5'">
    
    <!-- HEADER MASJID AL MUHAJIRIN + JAM LIVE & JADWAL SHOLAT 5 WAKTU -->
    <div class="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 text-white rounded-2xl px-5 py-3.5 shadow-md border border-emerald-700/60">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        <!-- KIRI: LOGO & IDENTITAS MASJID -->
        <div class="flex items-center gap-3.5">
          <div class="bg-white/95 p-1.5 rounded-xl shadow-sm shrink-0">
            <img
              src="/logo-masjid.png"
              alt="Logo Masjid Al Muhajirin"
              class="h-14 w-14 sm:h-16 sm:w-16 object-contain"
            />
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wide leading-tight text-white">
              MASJID AL MUHAJIRIN
            </h1>
            <p class="text-xs sm:text-sm font-medium text-emerald-200">
              Laporan Kas Publik Masjid • {{ currentDateStr }}
            </p>
          </div>
        </div>

        <!-- TENGAH / KANAN: JAM LIVE & JADWAL SHOLAT 5 WAKTU -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <!-- Jam Digital Real-Time -->
          <div class="bg-emerald-950/80 border border-emerald-600/50 rounded-xl px-3.5 py-2 text-center shrink-0 flex flex-col justify-center">
            <div class="text-lg sm:text-xl font-mono font-extrabold text-amber-300 tracking-wider leading-none">
              {{ currentTimeStr }}
            </div>
            <div class="text-[10px] font-semibold text-emerald-300 uppercase tracking-widest mt-1">
              WIB • Tangerang
            </div>
          </div>

          <!-- 5 Waktu Sholat -->
          <div class="grid grid-cols-5 gap-1.5 bg-emerald-950/60 border border-emerald-600/40 p-1.5 rounded-xl">
            <div
              v-for="prayer in prayerList"
              :key="prayer.name"
              :class="prayer.isNext ? 'bg-amber-500 text-emerald-950 shadow-sm scale-[1.02]' : 'bg-emerald-900/70 text-white'"
              class="px-2.5 py-1.5 rounded-lg text-center transition flex flex-col justify-center min-w-[58px]"
            >
              <span
                class="text-[10px] font-bold uppercase tracking-tight"
                :class="prayer.isNext ? 'text-emerald-950' : 'text-emerald-300'"
              >
                {{ prayer.name }}
              </span>
              <span class="text-xs sm:text-sm font-extrabold font-mono mt-0.5">
                {{ prayer.time }}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- 1. RINGKASAN 3 KANTONG SALDO KAS -->
    <div>
      <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
        <h2 class="text-base sm:text-lg font-bold text-gray-800">Saldo Kas Masjid Terkini</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          v-for="w in wallets"
          :key="w.id"
          class="bg-white/95 backdrop-blur-sm px-4 py-4 rounded-xl shadow-sm border-l-4 flex items-center justify-between transition hover:shadow-md"
          :class="{
            'border-emerald-600': w.type === 'operasional',
            'border-blue-600': w.type === 'zakat',
            'border-amber-500': w.type === 'wakaf'
          }"
        >
          <div>
            <p class="text-xs text-gray-500 font-semibold">{{ w.name }}</p>
            <p class="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1">
              Rp {{ Number(w.balance).toLocaleString('id-ID') }}
            </p>
          </div>
          <div
            class="w-11 h-11 rounded-full flex items-center justify-center text-2xl shadow-inner shrink-0"
            :class="{
              'bg-emerald-50 text-emerald-700 border border-emerald-100': w.type === 'operasional',
              'bg-blue-50 text-blue-700 border border-blue-100': w.type === 'zakat',
              'bg-amber-50 text-amber-700 border border-amber-100': w.type === 'wakaf'
            }"
          >
            {{ w.type === 'operasional' ? '🕌' : w.type === 'zakat' ? '🤝' : '🏛️' }}
          </div>
        </div>
      </div>
    </div>

    <!-- ===================================================================== -->
    <!-- TAMPILAN KHUSUS JAMAAH -->
    <!-- ===================================================================== -->
    <div v-if="!isPengurus" class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
      
      <!-- KOLOM KIRI (7 KOLOM): RIWAYAT PENERIMAAN & PENGELUARAN KAS -->
      <div class="lg:col-span-7 bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2 bg-gray-50/70">
          <h3 class="text-sm sm:text-base font-bold text-gray-800">
            Riwayat Penerimaan & Pengeluaran Kas
          </h3>

          <div class="flex flex-wrap items-center gap-1.5">
            <button
              @click="filterType = 'all'"
              :class="filterType === 'all' ? 'bg-emerald-700 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'"
              class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition"
            >
              Semua
            </button>
            <button
              @click="filterType = 'income'"
              :class="filterType === 'income' ? 'bg-emerald-700 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'"
              class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition"
            >
              Pemasukan (+)
            </button>
            <button
              @click="filterType = 'expense'"
              :class="filterType === 'expense' ? 'bg-amber-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'"
              class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition"
            >
              Pengeluaran (-)
            </button>
            <button @click="fetchDashboardData" class="text-[11px] text-emerald-700 hover:underline font-bold ml-1">
              ↻ Muat Ulang
            </button>
          </div>
        </div>

        <div class="overflow-x-auto overflow-y-auto max-h-[340px] flex-1">
          <table class="w-full text-left border-collapse">
            <thead class="sticky top-0 z-10 bg-gray-50 text-gray-600 text-[11px] uppercase border-b shadow-2xs">
              <tr>
                <th class="px-3 py-2.5">Tanggal</th>
                <th class="px-3 py-2.5">Kategori & Keterangan</th>
                <th class="px-3 py-2.5">Kantong Kas</th>
                <th class="px-3 py-2.5 text-right">Nominal</th>
                <th class="px-3 py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-xs">
              <tr v-for="trx in displayedTransactions" :key="trx.id" class="hover:bg-emerald-50/40 transition">
                <td class="px-3 py-2.5 whitespace-nowrap text-gray-500">
                  {{ new Date(trx.transaction_date).toLocaleDateString('id-ID') }}
                </td>
                <td class="px-3 py-2.5">
                  <div class="font-bold text-gray-900">{{ trx.categories?.name }}</div>
                  <div class="text-gray-500 text-[11px] line-clamp-1">{{ trx.description }}</div>
                  <div v-if="trx.witness_1 || trx.witness_2" class="text-emerald-700 text-[10px] font-medium mt-0.5">
                    Saksi Penghitung: {{ trx.witness_1 }} & {{ trx.witness_2 }}
                  </div>
                </td>
                <td class="px-3 py-2.5 text-gray-600 whitespace-nowrap">{{ trx.wallets?.name }}</td>
                <td
                  class="px-3 py-2.5 font-extrabold whitespace-nowrap text-right"
                  :class="trx.type === 'income' ? 'text-emerald-600' : 'text-red-600'"
                >
                  {{ trx.type === 'income' ? '+' : '-' }} Rp {{ Number(trx.actual_amount ?? trx.amount).toLocaleString('id-ID') }}
                </td>
                <td class="px-3 py-2.5 text-center whitespace-nowrap">
                  <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                    Disetujui DKM
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

      <!-- KOLOM KANAN (5 KOLOM): RINGKASAN CASHFLOW & ALOKASI PENGELUARAN -->
      <div class="lg:col-span-5 flex flex-col gap-3.5 justify-between">
        
        <div class="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
          <div>
            <h3 class="text-sm sm:text-base font-bold text-gray-800">📊 Ringkasan Cashflow Kas Masjid</h3>
            <p class="text-[11px] text-gray-500">Perbandingan total dana masuk dan penyaluran operasional masjid</p>
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <div class="bg-emerald-50 border border-emerald-200/70 p-3 rounded-xl">
              <span class="text-[11px] font-bold text-emerald-800">Total Pemasukan</span>
              <p class="text-base sm:text-lg font-extrabold text-emerald-700 mt-0.5">
                + Rp {{ totalApprovedIncome.toLocaleString('id-ID') }}
              </p>
            </div>
            <div class="bg-red-50 border border-red-200/70 p-3 rounded-xl">
              <span class="text-[11px] font-bold text-red-800">Total Pengeluaran</span>
              <p class="text-base sm:text-lg font-extrabold text-red-600 mt-0.5">
                - Rp {{ totalApprovedExpense.toLocaleString('id-ID') }}
              </p>
            </div>
          </div>

          <div class="space-y-1">
            <div class="flex justify-between text-[11px] font-bold text-gray-600">
              <span>Penyerapan Dana: {{ expenseRatio }}%</span>
              <span>Sisa Tersimpan: {{ 100 - expenseRatio }}%</span>
            </div>
            <div class="w-full h-2.5 bg-emerald-100 rounded-full overflow-hidden flex">
              <div
                class="bg-amber-500 h-full transition-all duration-500"
                :style="{ width: expenseRatio + '%' }"
              ></div>
            </div>
            <div class="flex items-center gap-4 text-[10px] text-gray-500 pt-0.5">
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Dana Tersalurkan</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-300 inline-block"></span> Saldo Kas Aktif</span>
            </div>
          </div>
        </div>

        <div class="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-100 space-y-2.5 flex-1">
          <div>
            <h3 class="text-sm sm:text-base font-bold text-gray-800">🕌 Alokasi Pengeluaran per Bidang</h3>
            <p class="text-[11px] text-gray-500">Rincian penyaluran kas masjid yang telah disahkan DKM</p>
          </div>

          <div v-if="expenseBreakdown.length > 0" class="space-y-2.5 overflow-y-auto max-h-[145px] pr-1">
            <div v-for="cat in expenseBreakdown" :key="cat.name" class="space-y-1">
              <div class="flex justify-between text-xs font-bold">
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
          <div v-else class="text-xs text-gray-400 py-4 text-center">
            Belum ada catatan pengeluaran yang disahkan.
          </div>
        </div>

      </div>
    </div>

    <!-- ===================================================================== -->
    <!-- TAMPILAN KHUSUS 3 PENGURUS DKM -->
    <!-- ===================================================================== -->
    <template v-if="isPengurus">
      <!-- 3. ANTREAN VERIFIKASI & PERSETUJUAN -->
      <div v-if="visiblePendingTransactions.length > 0" class="bg-amber-50 border border-amber-200 rounded-xl p-5">
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
                    class="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white text-gray-900"
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

      <!-- 4. PENYELESAIAN SPJ & DOKUMENTASI BON BELANJA -->
      <div v-if="openSpjList.length > 0" class="bg-purple-50 border border-purple-200 rounded-xl p-5">
        <div class="mb-4">
          <h3 class="text-lg font-bold text-purple-900">
            🧾 Penyelesaian SPJ & Dokumentasi Bon ({{ openSpjList.length }})
          </h3>
          <p class="text-xs text-purple-700">
            Maksimal penyelesaian SPJ adalah <strong>3 x 24 jam (72 jam)</strong> setelah dana dicairkan.
            <span v-if="userRole === 'pelaksana_harian'"> Silakan unggah bukti bon/nota belanja yang sesuai.</span>
            <span v-else> (Pemantauan & Pemeriksaan oleh {{ userRole === 'bendahara' ? 'Bendahara Umum' : 'Ketua DKM' }}).</span>
          </p>
        </div>

        <div class="space-y-4">
          <div
            v-for="spj in openSpjList"
            :key="spj.id"
            class="bg-white p-4 rounded-lg shadow-sm border-l-4 transition"
            :class="getSpjDeadlineStatus(spj).isOverdue ? 'border-red-600 bg-red-50/40 ring-1 ring-red-200' : 'border-purple-600'"
          >
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="text-xs font-bold px-2.5 py-0.5 rounded"
                    :class="getSpjDeadlineStatus(spj).isOverdue ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-800'"
                  >
                    Dana Cair • Menunggu Bon SPJ
                  </span>

                  <span
                    class="text-xs font-extrabold px-2.5 py-0.5 rounded"
                    :class="getSpjDeadlineStatus(spj).isOverdue ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-100 text-amber-800'"
                  >
                    {{ getSpjDeadlineStatus(spj).label }}
                  </span>
                </div>

                <h4
                  class="font-bold mt-1.5"
                  :class="getSpjDeadlineStatus(spj).isOverdue ? 'text-red-700' : 'text-gray-900'"
                >
                  {{ spj.description }}
                </h4>
                <p
                  class="text-sm mt-0.5"
                  :class="getSpjDeadlineStatus(spj).isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'"
                >
                  Budget Dicairkan:
                  <strong :class="getSpjDeadlineStatus(spj).isOverdue ? 'text-red-700' : 'text-purple-800'">
                    Rp {{ Number(spj.amount).toLocaleString('id-ID') }}
                  </strong>
                  • {{ spj.categories?.name }}
                  <span v-if="spj.applicant_name"> • Pelaksana: <strong>{{ spj.applicant_name }}</strong></span>
                </p>
              </div>

              <!-- TOMBOL UPLOAD HANYA UNTUK PELAKSANA HARIAN -->
              <div v-if="userRole === 'pelaksana_harian'">
                <button
                  @click="activeSpjId = (activeSpjId === spj.id ? null : spj.id); actualAmount = spj.amount"
                  class="px-4 py-2 text-sm font-bold text-white rounded-lg transition shadow-sm"
                  :class="getSpjDeadlineStatus(spj).isOverdue ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-700 hover:bg-purple-800'"
                >
                  {{ activeSpjId === spj.id ? 'Tutup Form SPJ' : '+ Lengkapi Bon SPJ' }}
                </button>
              </div>

              <!-- BENDAHARA & KETUA DKM HANYA PEMANTAU / APPROVAL SAJA -->
              <div v-else class="text-right">
                <span
                  class="inline-block text-xs font-bold px-3 py-1.5 rounded-lg border"
                  :class="getSpjDeadlineStatus(spj).isOverdue
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : 'bg-gray-100 text-gray-600 border-gray-200'"
                >
                  {{ getSpjDeadlineStatus(spj).isOverdue
                    ? '⚠️ Melewati Batas 3x24 Jam — Segera Tagih Pelaksana'
                    : 'Menunggu Pelaksana Upload Bukti Bon' }}
                </span>
              </div>
            </div>

            <!-- FORM UPLOAD BON SPJ -->
            <div v-if="userRole === 'pelaksana_harian' && activeSpjId === spj.id" class="mt-4 pt-4 border-t border-gray-200 space-y-3">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-gray-700 mb-1">
                    Total Realisasi Belanja Sesuai Bon (Rp) *
                  </label>
                  <input v-model="actualAmount" type="number" required min="0" class="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white text-gray-900" />
                  <p v-if="Number(spj.amount) - Number(actualAmount) > 0" class="text-xs text-emerald-700 font-semibold mt-1">
                    Sisa dana Rp {{ (Number(spj.amount) - Number(actualAmount)).toLocaleString('id-ID') }} akan otomatis dikembalikan ke Kas Masjid.
                  </p>
                </div>

                <div>
                  <label class="block text-xs font-bold text-gray-700 mb-1">
                    Upload Foto Bukti Bon / Nota Belanja *
                  </label>
                  <input type="file" accept="image/*,application/pdf" multiple @change="handleSpjFilesChange" class="w-full text-xs text-gray-900 bg-white border border-gray-300 rounded-lg p-1.5" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Catatan Rincian Belanja SPJ</label>
                <input v-model="spjNotes" type="text" placeholder="Contoh: Nota konsumsi Rp 500rb, Bisyarah Ustadz Rp 500rb" class="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white text-gray-900" />
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

      <!-- 5. RIWAYAT TRANSAKSI & EXPORT LAPORAN TAHUNAN -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- BARIS EXPORT LAPORAN TAHUNAN & APPROVAL BASAH -->
        <div class="p-4 sm:p-5 bg-emerald-50/70 border-b border-emerald-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h4 class="text-sm font-extrabold text-emerald-900">
              📑 Rekapitulasi Laporan Tahunan & Pengesahan Fisik (TTD Basah)
            </h4>
            <p class="text-xs text-emerald-700">
              Unduh rekapitulasi pembukuan Excel (.xlsx) atau cetak Laporan Resmi PDF dengan kolom tanda tangan basah pengurus DKM.
            </p>
          </div>

          <!-- KELOMPOK TOMBOL SEJAJAR SECARA HORIZONTAL -->
          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <!-- Pilihan Tahun Laporan -->
            <select
              v-model="selectedYear"
              class="border border-emerald-300 rounded-lg px-3 py-2 text-xs font-bold bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            >
              <option value="all">Semua Tahun</option>
              <option v-for="yr in availableYears" :key="yr" :value="yr">Tahun {{ yr }}</option>
            </select>

            <!-- Tombol Export Excel & PDF Sejajar -->
            <div class="flex items-center gap-2">
              <button
                @click="exportAnnualExcel"
                class="px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>📊 Export Excel (.xlsx)</span>
              </button>

              <button
                @click="exportAnnualPDF"
                class="px-3.5 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>🖨️ Cetak Laporan PDF (TTD Basah)</span>
              </button>
            </div>
          </div>
        </div>

        <div class="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="text-lg font-bold text-gray-800">
              Riwayat Transaksi & Pemeriksaan Bukti Bon SPJ
            </h3>
            <p v-if="userRole !== 'pelaksana_harian'" class="text-xs text-gray-500 mt-0.5">
              Klik tautan <strong>[Lihat Bon #1]</strong>, <strong>[Lihat Bon #2]</strong>, dst. untuk memeriksa bukti nota yang telah diunggah oleh Pelaksana Harian.
            </p>
          </div>

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
                  <div v-if="trx.applicant_name" class="text-gray-600 text-xs mt-0.5">
                    Pemohon: <strong>{{ trx.applicant_name }}</strong>
                    <span v-if="trx.bendahara_name"> • Verifikator: <strong>{{ trx.bendahara_name }}</strong></span>
                    <span v-if="trx.ketua_name"> • Pengesah: <strong>{{ trx.ketua_name }}</strong></span>
                  </div>
                  <div v-if="trx.spj_notes" class="text-purple-700 text-xs mt-0.5 font-medium">
                    Catatan SPJ: {{ trx.spj_notes }}
                  </div>
                  <div v-if="trx.witness_1 || trx.witness_2" class="text-emerald-700 text-xs mt-0.5">
                    Saksi Penghitung: {{ trx.witness_1 }} & {{ trx.witness_2 }}
                  </div>

                  <div class="flex flex-wrap items-center gap-2 mt-1.5">
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
                      class="text-xs bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded font-bold hover:bg-purple-100 transition"
                    >
                      🧾 Lihat Bon #{{ idx + 1 }} ↗
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
                  <div v-if="trx.is_budget_request && trx.actual_amount !== null && trx.actual_amount !== trx.amount" class="text-xs font-normal text-gray-400">
                    (Budget awal: Rp {{ Number(trx.amount).toLocaleString('id-ID') }})
                  </div>
                </td>
                <td class="p-3.5">
                  <span
                    v-if="trx.is_budget_request && trx.status === 'approved' && trx.actual_amount === null"
                    class="px-2.5 py-1 text-xs font-semibold rounded-full"
                    :class="getSpjDeadlineStatus(trx).isOverdue ? 'bg-red-100 text-red-700 font-bold' : 'bg-purple-100 text-purple-800'"
                  >
                    {{ getSpjDeadlineStatus(trx).isOverdue ? 'Terlambat SPJ (>3x24 Jam)' : 'Cair (Belum SPJ)' }}
                  </span>
                  <span v-else-if="trx.is_budget_request && trx.actual_amount !== null" class="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
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
                <td colspan="5" class="p-6 text-center text-gray-400">Belum ada data transaksi pada periode/kategori ini.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- RUNNING TEXT DINAMIS (UKURAN DIPERBESAR & ELEGAN) -->
    <div class="bg-emerald-50 border border-emerald-200 rounded-xl overflow-hidden shadow-2xs py-3 px-4 flex items-center gap-3.5">
      <span class="bg-emerald-700 text-white text-xs sm:text-sm font-extrabold px-3 py-1.5 rounded-lg shrink-0 uppercase tracking-wide flex items-center gap-1.5 shadow-sm">
        💡 Pesan Infaq
      </span>
      <div class="overflow-hidden whitespace-nowrap w-full relative h-7 flex items-center">
        <div class="animate-fade-slide text-sm sm:text-base font-semibold text-emerald-950 absolute w-full truncate">
          {{ currentRunningText }}
        </div>
      </div>
    </div>

    <!-- FOOTER COPYRIGHT FATHIN FIKRY DEV -->
    <footer class="mt-6 pt-3 pb-5 border-t border-gray-200 text-center text-xs text-gray-500 space-y-1">
      <p class="font-semibold text-emerald-900">Sistem Keuangan & e-KasMasjid Masjid Al Muhajirin</p>
      <p>© 2026 <span class="font-bold text-gray-700">Fathin Fikry dev</span>. All rights reserved.</p>
    </footer>

  </div>
</template>

<style scoped>
@keyframes fadeSlide {
  0% {
    opacity: 0;
    transform: translateY(12px);
  }
  15% {
    opacity: 1;
    transform: translateY(0);
  }
  85% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-12px);
  }
}

.animate-fade-slide {
  animation: fadeSlide 8s infinite ease-in-out;
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
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
const selectedYear = ref(String(new Date().getFullYear()))

const currentTimeStr = ref('')
const currentDateStr = ref('')
const nowTimestamp = ref(Date.now())
const prayerTimes = ref({
  Subuh: '04:10',
  Dzuhur: '11:45',
  Ashar: '15:08',
  Maghrib: '17:58',
  Isya: '19:12'
})
let clockTimer = null

// Data daftar ayat & hadis untuk running text dinamis bergantian
const runningTexts = ref([
  'QS. Al-Baqarah: 261 — "Perumpamaan orang yang menginfakkan hartanya di jalan Allah seperti sebutir biji yang menumbuhkan tujuh tangkai..."',
  'QS. Al-Baqarah: 267 — "Wahai orang-orang yang beriman! Infakkanlah sebagian dari hasil usahamu yang baik-baik."',
  'HR. Muslim — "Apabila anak Adam meninggal dunia, terputuslah amalnya kecuali tiga perkara: sedekah jariyah, ilmu yang bermanfaat, atau anak shalih."',
  'HR. Bukhari — "Hartamu yang sebenarnya adalah apa yang telah engkau sedekahkan (untuk akhirat)."'
])

const currentTextIndex = ref(0)
const currentRunningText = computed(() => runningTexts.value[currentTextIndex.value])
let textInterval = null

const updateClock = () => {
  const now = new Date()
  nowTimestamp.value = now.getTime()
  currentTimeStr.value = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\./g, ':')

  currentDateStr.value = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const fetchPrayerTimes = async () => {
  try {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/1104/${yyyy}/${mm}/${dd}`)
    const json = await res.json()
    if (json?.status && json?.data?.jadwal) {
      const j = json.data.jadwal
      prayerTimes.value = {
        Subuh: j.subuh,
        Dzuhur: j.dzuhur,
        Ashar: j.ashar,
        Maghrib: j.maghrib,
        Isya: j.isya
      }
    }
  } catch (e) {}
}

const prayerList = computed(() => {
  const entries = Object.entries(prayerTimes.value)
  const now = new Date(nowTimestamp.value)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  let nextFound = false
  const list = entries.map(([name, time]) => {
    const [h, m] = time.split(':').map(Number)
    const pMinutes = h * 60 + m
    let isNext = false
    if (!nextFound && pMinutes > nowMinutes) {
      isNext = true
      nextFound = true
    }
    return { name, time, isNext }
  })

  if (!nextFound && list.length > 0) {
    list[0].isNext = true
  }
  return list
})

const getSpjDeadlineStatus = (trx) => {
  const startTimeStr = trx.approved_at || trx.created_at || trx.transaction_date
  const startMs = new Date(startTimeStr).getTime()
  const maxDurationMs = 3 * 24 * 60 * 60 * 1000
  const deadlineMs = startMs + maxDurationMs
  const remainingMs = deadlineMs - nowTimestamp.value

  if (remainingMs <= 0) {
    const overdueHours = Math.floor(Math.abs(remainingMs) / (1000 * 60 * 60))
    return {
      isOverdue: true,
      label: `🚨 TERLAMBAT SPJ: Lewat ${overdueHours} jam (Maks 3x24 Jam)`
    }
  }

  const remHours = Math.floor(remainingMs / (1000 * 60 * 60))
  const remMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))
  return {
    isOverdue: false,
    label: `⏳ Batas SPJ: ${remHours} jam ${remMinutes} mnt lagi (Maks 3x24 Jam)`
  }
}

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

const availableYears = computed(() => {
  const years = new Set([String(new Date().getFullYear())])
  transactions.value.forEach(t => {
    if (t.transaction_date) {
      years.add(String(new Date(t.transaction_date).getFullYear()))
    }
  })
  return Array.from(years).sort((a, b) => b - a)
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
  if (isPengurus.value && selectedYear.value !== 'all') {
    base = base.filter(t => String(new Date(t.transaction_date).getFullYear()) === selectedYear.value)
  }
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
    .order('transaction_date', { ascending: false })
    .limit(500)
  if (trxData) transactions.value = trxData
}

onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)
  fetchPrayerTimes()
  fetchDashboardData()

  textInterval = setInterval(() => {
    currentTextIndex.value = (currentTextIndex.value + 1) % runningTexts.value.length
  }, 7000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
  if (textInterval) clearInterval(textInterval)
})

const exportAnnualExcel = () => {
  const periodLabel = selectedYear.value === 'all' ? 'Semua_Tahun' : `Tahun_${selectedYear.value}`
  const reportData = approvedTransactions.value.filter(t =>
    selectedYear.value === 'all' ? true : String(new Date(t.transaction_date).getFullYear()) === selectedYear.value
  )

  if (reportData.length === 0) {
    alert('Tidak ada data transaksi yang disahkan pada periode tahun ini.')
    return
  }

  let totalIn = 0
  let totalOut = 0

  const rows = reportData.map((t, index) => {
    const isInc = t.type === 'income'
    const nominal = Number(t.actual_amount ?? t.amount ?? 0)
    if (isInc) totalIn += nominal
    else totalOut += nominal

    return {
      'No': index + 1,
      'Tanggal': new Date(t.transaction_date).toLocaleDateString('id-ID'),
      'Jenis': isInc ? 'Pemasukan' : 'Pengeluaran',
      'Kantong Kas': t.wallets?.name || '-',
      'Kategori': t.categories?.name || '-',
      'Uraian / Keterangan': t.description || '-',
      'Pemasukan (Rp)': isInc ? nominal : 0,
      'Pengeluaran (Rp)': !isInc ? nominal : 0,
      'Pemohon / Saksi': t.applicant_name || (t.witness_1 ? `${t.witness_1} & ${t.witness_2}` : '-'),
      'Status SPJ': t.is_budget_request ? (t.actual_amount !== null ? 'SPJ Selesai' : 'Belum SPJ') : 'Selesai'
    }
  })

  rows.push({
    'No': '',
    'Tanggal': '',
    'Jenis': 'TOTAL REKAPITULASI',
    'Kantong Kas': '',
    'Kategori': '',
    'Uraian / Keterangan': `Surplus / Defisit Periode: Rp ${(totalIn - totalOut).toLocaleString('id-ID')}`,
    'Pemasukan (Rp)': totalIn,
    'Pengeluaran (Rp)': totalOut,
    'Pemohon / Saksi': '',
    'Status SPJ': ''
  })

  const worksheet = XLSX.utils.json_to_sheet(rows)
  worksheet['!cols'] = [
    { wch: 5 }, { wch: 14 }, { wch: 15 }, { wch: 24 }, { wch: 25 },
    { wch: 40 }, { wch: 18 }, { wch: 18 }, { wch: 24 }, { wch: 15 }
  ]

  const walletRows = wallets.value.map(w => ({
    'Kantong Kas Masjid': w.name,
    'Saldo Terkini (Rp)': Number(w.balance || 0)
  }))
  const walletSheet = XLSX.utils.json_to_sheet(walletRows)
  walletSheet['!cols'] = [{ wch: 30 }, { wch: 22 }]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rincian Transaksi')
  XLSX.utils.book_append_sheet(workbook, walletSheet, 'Saldo Kantong Kas')

  XLSX.writeFile(workbook, `Laporan_Keuangan_Masjid_Al_Muhajirin_${periodLabel}.xlsx`)
}

const exportAnnualPDF = () => {
  const periodTitle = selectedYear.value === 'all' ? 'SEMUA PERIODE' : `TAHUN ${selectedYear.value}`
  const reportData = approvedTransactions.value.filter(t =>
    selectedYear.value === 'all' ? true : String(new Date(t.transaction_date).getFullYear()) === selectedYear.value
  )

  if (reportData.length === 0) {
    alert('Tidak ada data transaksi yang disahkan pada periode tahun ini.')
    return
  }

  const doc = new jsPDF('p', 'mm', 'a4')
  const tanggalCetak = new Date().toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('DEWAN KEMAKMURAN MASJID (DKM)', 105, 16, { align: 'center' })
  doc.setFontSize(16)
  doc.text('MASJID AL MUHAJIRIN', 105, 23, { align: 'center' })
  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Laporan Pertanggungjawaban Keuangan & Kas Publik Masjid', 105, 29, { align: 'center' })
  doc.setLineWidth(0.7)
  doc.line(14, 33, 196, 33)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`REKAPITULASI LAPORAN KEUANGAN ${periodTitle}`, 105, 41, { align: 'center' })

  let totalIn = 0
  let totalOut = 0

  const tableBody = reportData.map((t, idx) => {
    const isInc = t.type === 'income'
    const nominal = Number(t.actual_amount ?? t.amount ?? 0)
    if (isInc) totalIn += nominal
    else totalOut += nominal

    return [
      idx + 1,
      new Date(t.transaction_date).toLocaleDateString('id-ID'),
      `${t.categories?.name || '-'}\n${t.description || ''}`,
      t.wallets?.name || '-',
      isInc ? `Rp ${nominal.toLocaleString('id-ID')}` : '-',
      !isInc ? `Rp ${nominal.toLocaleString('id-ID')}` : '-'
    ]
  })

  autoTable(doc, {
    startY: 46,
    head: [['No', 'Tanggal', 'Kategori & Uraian Transaksi', 'Kantong Kas', 'Pemasukan', 'Pengeluaran']],
    body: tableBody,
    foot: [[
      '', '', 'TOTAL KESELURUHAN', '',
      `Rp ${totalIn.toLocaleString('id-ID')}`,
      `Rp ${totalOut.toLocaleString('id-ID')}`
    ]],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.2, textColor: [30, 30, 30] },
    headStyles: { fillColor: [6, 95, 70], textColor: 255, fontStyle: 'bold', halign: 'center' },
    footStyles: { fillColor: [240, 253, 244], textColor: [6, 95, 70], fontStyle: 'bold' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 9 },
      1: { halign: 'center', cellWidth: 20 },
      2: { cellWidth: 66 },
      3: { cellWidth: 33 },
      4: { halign: 'right', cellWidth: 27 },
      5: { halign: 'right', cellWidth: 27 }
    }
  })

  let finalY = doc.lastAutoTable.finalY + 8

  if (finalY > 215) {
    doc.addPage()
    finalY = 20
  }

  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'bold')
  doc.text('Posisi Saldo Kas Masjid Terkini:', 14, finalY)
  finalY += 5
  doc.setFont('helvetica', 'normal')
  wallets.value.forEach(w => {
    doc.text(`• ${w.name}: Rp ${Number(w.balance || 0).toLocaleString('id-ID')}`, 18, finalY)
    finalY += 5
  })

  finalY += 6
  doc.setFontSize(9.5)
  doc.text(`Tangerang, ${tanggalCetak}`, 196, finalY, { align: 'right' })

  finalY += 7
  doc.setFont('helvetica', 'bold')
  doc.text('Disusun Oleh,', 40, finalY, { align: 'center' })
  doc.text('Diperiksa Oleh,', 105, finalY, { align: 'center' })
  doc.text('Mengetahui & Mengesahkan,', 170, finalY, { align: 'center' })

  finalY += 4.5
  doc.setFont('helvetica', 'normal')
  doc.text('Pelaksana Harian', 40, finalY, { align: 'center' })
  doc.text('Bendahara Umum', 105, finalY, { align: 'center' })
  doc.text('Ketua DKM Al Muhajirin', 170, finalY, { align: 'center' })

  finalY += 24
  doc.setFont('helvetica', 'bold')
  doc.text('( _______________________ )', 40, finalY, { align: 'center' })
  doc.text('( _______________________ )', 105, finalY, { align: 'center' })
  doc.text('( _______________________ )', 170, finalY, { align: 'center' })

  const pdfBlobUrl = doc.output('bloburl')
  window.open(pdfBlobUrl, '_blank')
}

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
  doc.text('Diveriksa Bendahara,', 105, yHeader, { align: 'center' })
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