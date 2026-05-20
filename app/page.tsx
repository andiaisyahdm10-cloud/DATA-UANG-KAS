"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Coins,
  UserCheck,
  UserX,
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertTriangle,
  Search,
  RefreshCw,
  ArrowLeft,
  DollarSign,
  Info,
  Layers,
  Sparkles,
  BookOpen
} from "lucide-react";

// Tipe data siswa pencatatan kas kelas
interface SiswaKas {
  id: string;
  nama: string;
  kelas: string;
  jumlah: number;
  status: "Lunas" | "Belum Lunas";
  tanggal: string;
}

// Data awal default untuk demonstrasi keindahan dashboard
const DATA_AWAL_DEFAULT: SiswaKas[] = [
  {
    id: "siswa-1",
    nama: "Budi Santoso",
    kelas: "XII RPL 1",
    jumlah: 20000,
    status: "Lunas",
    tanggal: "2026-05-19 14:32"
  },
  {
    id: "siswa-2",
    nama: "Siti Aminah",
    kelas: "XII RPL 1",
    jumlah: 10000,
    status: "Belum Lunas",
    tanggal: "2026-05-19 15:45"
  },
  {
    id: "siswa-3",
    nama: "Ryan Hidayat",
    kelas: "XII RPL 1",
    jumlah: 25000,
    status: "Lunas",
    tanggal: "2026-05-20 09:12"
  },
  {
    id: "siswa-4",
    nama: "Amanda Putri",
    kelas: "XII RPL 1",
    jumlah: 5000,
    status: "Belum Lunas",
    tanggal: "2026-05-20 11:30"
  }
];

export default function UangKasKelasPage() {
  // State manajemen alur aplikasi
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [siswaList, setSiswaList] = useState<SiswaKas[]>(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("data_uang_kas_kelas");
      if (savedData) {
        try {
          return JSON.parse(savedData);
        } catch (e) {
          return DATA_AWAL_DEFAULT;
        }
      }
    }
    return DATA_AWAL_DEFAULT;
  });
  
  // State manajemen Form Input
  const [namaInput, setNamaInput] = useState<string>("");
  const [kelasInput, setKelasInput] = useState<string>("");
  const [jumlahInput, setJumlahInput] = useState<string>("");
  const [statusInput, setStatusInput] = useState<"Lunas" | "Belum Lunas" | "">("");
  
  // Edit mode tracking
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter dan Pencarian
  const [filterActive, setFilterActive] = useState<"Semua" | "Lunas" | "Belum Lunas">("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pesan feedback (Error / Sukses)
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Ref penunjuk fokus form (untuk auto-focus saat mulai atau edit)
  const inputNamaRef = useRef<HTMLInputElement>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);

  // 1. Sinkronisasi data dimuat otomatis via State Initializer di atas berkelanjutan

  // 2. Simpan setiap ada perubahan pada siswaList
  useEffect(() => {
    if (siswaList.length > 0) {
      localStorage.setItem("data_uang_kas_kelas", JSON.stringify(siswaList));
    } else {
      localStorage.removeItem("data_uang_kas_kelas");
    }
  }, [siswaList]);

  // Toast Auto-Dismiss
  useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => setErrorToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);

  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Handler Mulai Proyek
  const handleMulaiProyek = () => {
    setIsStarted(true);
    // Berikan sedikit jeda sebelum fokus agar elemen ter-render sempurna
    setTimeout(() => {
      inputNamaRef.current?.focus();
    }, 100);
  };

  // Helper Format Rupiah untuk Nominal Angka
  const formatRupiah = (angka: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(angka);
  };

  // Quick preset untuk menambah jumlah kas
  const applyPresetUang = (nominal: number) => {
    setJumlahInput(nominal.toString());
  };

  // Logika Pemeriksaan Data (Validasi) & Simpan Pembayaran
  const handleLanjutSimpan = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi: periksa apakah ada field yang kosong atau nilai tidak sah
    if (!namaInput.trim() || !kelasInput.trim() || !jumlahInput.trim() || !statusInput) {
      // Sistem mendeteksi data kosong -> Tampilkan pesan error
      setErrorToast("Gagal Menyimpan! Harap isi lengkap Nama, Kelas, Jumlah Uang Kas, dan Status Pembayaran.");
      return;
    }

    const nominalUang = parseFloat(jumlahInput);
    if (isNaN(nominalUang) || nominalUang < 0) {
      setErrorToast("Gagal Menyimpan! Jumlah uang kas tidak boleh bernilai negatif atau salah format.");
      return;
    }

    // Ambil format tanggal hari ini
    const waktuSekarang = new Date();
    const formattedTanggal = `${waktuSekarang.getFullYear()}-${String(waktuSekarang.getMonth() + 1).padStart(2, "0")}-${String(waktuSekarang.getDate()).padStart(2, "0")} ${String(waktuSekarang.getHours()).padStart(2, "0")}:${String(waktuSekarang.getMinutes()).padStart(2, "0")}`;

    if (editingId) {
      // EDIT MODE (Memperbarui data)
      setSiswaList(prevList =>
        prevList.map(siswa =>
          siswa.id === editingId
            ? {
                ...siswa,
                nama: namaInput.trim(),
                kelas: kelasInput.trim(),
                jumlah: nominalUang,
                status: statusInput as "Lunas" | "Belum Lunas",
                tanggal: formattedTanggal // Perbarui tanggal pencatatan revisi
              }
            : siswa
        )
      );
      setSuccessToast(`Berhasil memperbarui data kas siswa "${namaInput.trim()}"`);
      setEditingId(null);
    } else {
      // ADD MODE (Menambah data baru)
      const dataBaru: SiswaKas = {
        id: "siswa-" + Date.now(),
        nama: namaInput.trim(),
        kelas: kelasInput.trim(),
        jumlah: nominalUang,
        status: statusInput as "Lunas" | "Belum Lunas",
        tanggal: formattedTanggal
      };
      setSiswaList(prevList => [dataBaru, ...prevList]);
      setSuccessToast(`Pembayaran kas "${namaInput.trim()}" berhasil disimpan ke sistem!`);
    }

    // Reset Form State setelah sukses simpan
    setNamaInput("");
    setKelasInput("");
    setJumlahInput("");
    setStatusInput("");
  };

  // Memasukkan data ke form untuk diperbarui (Edit mode)
  const handleMulaiEdit = (siswa: SiswaKas) => {
    setEditingId(siswa.id);
    setNamaInput(siswa.nama);
    setKelasInput(siswa.kelas);
    setJumlahInput(siswa.jumlah.toString());
    setStatusInput(siswa.status);

    // Scroll form ke view pada layar kecil & letakkan fokus
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setTimeout(() => {
      inputNamaRef.current?.focus();
    }, 300);
  };

  // Batalkan Edit Mode
  const handleBatalEdit = () => {
    setEditingId(null);
    setNamaInput("");
    setKelasInput("");
    setJumlahInput("");
    setStatusInput("");
  };

  // Hapus Data Siswa dari daftar
  const handleHapusSiswa = (id: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data uang kas siswa "${nama}"?`)) {
      setSiswaList(prevList => prevList.filter(siswa => siswa.id !== id));
      setSuccessToast(`Data kas "${nama}" berhasil dihapus.`);
      if (editingId === id) {
        handleBatalEdit();
      }
    }
  };

  // Reset database kembali ke default data dummy
  const handleResetKeDefault = () => {
    if (confirm("Ingin memulihkan data contoh bawaan sistem? Data saat ini akan diganti.")) {
      setSiswaList(DATA_AWAL_DEFAULT);
      setSuccessToast("Data berhasil dipulihkan ke versi contoh default.");
      handleBatalEdit();
    }
  };

  // Bersihkan semua data hingga kosong
  const handleHapusSemuaData = () => {
    if (confirm("⚠️ PERINGATAN: Menghapus semua data kas siswa bersifat permanen. Lanjutkan?")) {
      setSiswaList([]);
      setSuccessToast("Seluruh database uang kas kelas berhasil dibersihkan.");
      handleBatalEdit();
    }
  };

  // --- LOGIKA HITUNG MATEMATIKA AGREGASI ---
  // Menghitung total uang kas terkumpul
  const totalUangKasTerkumpul = siswaList.reduce((acc, curr) => acc + curr.jumlah, 0);

  // Menghitung jumlah masing-masing kategori
  const siswaTerfilterLunas = siswaList.filter(s => s.status === "Lunas");
  const siswaTerfilterBelumLunas = siswaList.filter(s => s.status === "Belum Lunas");

  // Melakukan filter daftar siswa berdasarkan Tab & Kolom Pencarian
  const filteredList = siswaList.filter(siswa => {
    // Filter Pencarian
    const matchesSearch =
      siswa.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      siswa.kelas.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter Tab Kategori
    if (filterActive === "Lunas") {
      return matchesSearch && siswa.status === "Lunas";
    }
    if (filterActive === "Belum Lunas") {
      return matchesSearch && siswa.status === "Belum Lunas";
    }
    return matchesSearch;
  });

  return (
    <div className="relative w-full min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-start">
      
      {/* BACKGROUND AMBIENT GLOW */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none translate-y-1/2" />

      {/* FLOAT FLOATING NOTIFICATIONS (TOASTS) */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none">
        <AnimatePresence>
          {errorToast && (
            <motion.div
              id="error-notification"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="pointer-events-auto flex items-start gap-3 p-4 bg-zinc-900 border border-red-500/40 text-red-200 rounded-xl shadow-2xl backdrop-blur-md mb-2"
            >
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Kesalahan Input</p>
                <p className="text-xs text-red-300/90 mt-0.5">{errorToast}</p>
              </div>
              <button
                onClick={() => setErrorToast(null)}
                className="text-xs text-zinc-500 hover:text-zinc-300 px-1 py-0.5 rounded"
              >
                Tutup
              </button>
            </motion.div>
          )}

          {successToast && (
            <motion.div
              id="success-notification"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="pointer-events-auto flex items-start gap-3 p-4 bg-zinc-900 border border-emerald-500/40 text-emerald-200 rounded-xl shadow-2xl backdrop-blur-md mb-2"
            >
              <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Berhasil disimpan</p>
                <p className="text-xs text-emerald-300/90 mt-0.5">{successToast}</p>
              </div>
              <button
                onClick={() => setSuccessToast(null)}
                className="text-xs text-zinc-500 hover:text-zinc-300 px-1 py-0.5 rounded"
              >
                Tutup
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================== */}
      {/* 1. STATE AWAL : INTRO "MULAI PROYEK" */}
      {/* ========================================================== */}
      <AnimatePresence mode="wait">
        {!isStarted ? (
          <motion.main
            key="start-screen"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex flex-col justify-center items-center text-center z-10"
          >
            {/* Lencana Teratas */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-mono mb-6 shadow-inner tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>SMART FINANCIAL LEDGER CLASS</span>
            </div>

            {/* Judul Tampilan Minimalis Swiss */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-2xl">
              Data Uang Kas <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 drop-shadow-md">Kelas Kita</span>
            </h1>

            <p className="text-zinc-400 text-sm sm:text-lg max-w-xl mb-12 font-sans leading-relaxed">
              Solusi pencatatan kas digital tercepat, rapi, dan transparan. Pantau kondisi kas siswa lunas, sisa tunggakan, dan akumulasi keuangan kelas Anda secara real-time.
            </p>

            {/* Preview visual mini dari apa yang akan dibuka */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-12">
              <div className="bg-zinc-900/60 backdrop-blur border border-zinc-800 p-4 rounded-xl text-left">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                    <Coins className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-xs font-medium text-zinc-400">Total Akumulasi</span>
                </div>
                <div className="text-lg font-bold font-mono text-emerald-400">{formatRupiah(totalUangKasTerkumpul)}</div>
              </div>

              <div className="bg-zinc-900/60 backdrop-blur border border-zinc-800 p-4 rounded-xl text-left">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-1.5 bg-sky-500/10 rounded-lg">
                    <UserCheck className="w-4 h-4 text-sky-400" />
                  </div>
                  <span className="text-xs font-medium text-zinc-400">Sudah Membayar</span>
                </div>
                <div className="text-lg font-bold font-mono text-white">{siswaTerfilterLunas.length} Siswa</div>
              </div>

              <div className="bg-zinc-900/60 backdrop-blur border border-zinc-800 p-4 rounded-xl text-left">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-1.5 bg-rose-500/10 rounded-lg">
                    <UserX className="w-4 h-4 text-rose-400" />
                  </div>
                  <span className="text-xs font-medium text-zinc-400">Belum Lunas</span>
                </div>
                <div className="text-lg font-bold font-mono text-white">{siswaTerfilterBelumLunas.length} Siswa</div>
              </div>
            </div>

            {/* Tombol Utama Mulai Proyek */}
            <motion.button
              id="btn-mulai-sekarang"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMulaiProyek}
              className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-base sm:text-lg rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] transition-all cursor-pointer group"
            >
              <span>Buka Proyek Uang Kas</span>
              <Play className="w-5 h-5 fill-zinc-950 stroke-zinc-950 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>

            <div className="text-xs text-zinc-500 mt-6 font-mono">
              Lokasi Memori Lokal Aktif • Tekan tombol untuk memulai
            </div>
          </motion.main>
        ) : (
          
          // ==========================================================
          // 2. DASHBOARD KERJA : INPUT FORM & DAFTAR KAS SISWA
          // ==========================================================
          <motion.main
            key="dashboard-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 z-10 flex flex-col"
          >
            {/* Navigasi Header Kerja */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-zinc-900 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsStarted(false)}
                  className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer"
                  title="Kembali ke Beranda"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-xs font-mono text-emerald-400 tracking-wider">PROJECT SPACE</h2>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    Data Uang Kas Kelas
                  </h1>
                </div>
              </div>

              {/* Tombol Tindakan Database */}
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto shrink-0 pb-1 sm:pb-0">
                <button
                  onClick={handleResetKeDefault}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs font-medium rounded-lg transition-all cursor-pointer"
                  title="Kembalikan data contoh"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Isi Data Contoh</span>
                </button>
                <button
                  onClick={handleHapusSemuaData}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 border border-zinc-900 hover:bg-red-950 hover:text-red-200 hover:border-red-900 text-zinc-400 text-xs font-medium rounded-lg transition-all cursor-pointer"
                  title="Kosongkan seluruh data"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Semua</span>
                </button>
              </div>
            </div>

            {/* GRID ANALITIS - TOTAL UANG KAS YANG TERKUMPUL & STATUS */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 intense-summary">
              {/* CARD 1: TOTAL KAS TERKUMPUL */}
              <div
                id="stat-total-kas"
                className="bg-zinc-900 border border-zinc-800/80 p-5 rounded-xl shadow-md relative overflow-hidden flex flex-col justify-between min-h-[110px]"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">Total Uang Kas Terkumpul</span>
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                    <Coins className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 truncate">
                    {formatRupiah(totalUangKasTerkumpul)}
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono">Total kalkulasi dari semua laporan pembayaran masuk</p>
                </div>
              </div>

              {/* CARD 2: DAFTAR SISWA SUDAH MEMBAYAR / LUNAS */}
              <div
                id="stat-lunas"
                className="bg-zinc-900 border border-zinc-800/80 p-5 rounded-xl shadow-md relative overflow-hidden flex flex-col justify-between min-h-[110px]"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">Siswa Sudah Lunas</span>
                  <div className="p-1.5 bg-cyan-500/10 rounded-lg">
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white">
                      {siswaTerfilterLunas.length} <span className="text-xs text-zinc-400 font-normal">Siswa</span>
                    </div>
                  </div>
                  {siswaList.length > 0 && (
                    <div className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
                      {Math.round((siswaTerfilterLunas.length / siswaList.length) * 100)}% Lunas
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 3: DAFTAR SISWA BELUM MEMBAYAR */}
              <div
                id="stat-belum-lunas"
                className="bg-zinc-900 border border-zinc-800/80 p-5 rounded-xl shadow-md relative overflow-hidden flex flex-col justify-between min-h-[110px]"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">Siswa Belum Lunas</span>
                  <div className="p-1.5 bg-rose-500/10 rounded-lg">
                    <UserX className="w-4 h-4 text-rose-400" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white">
                      {siswaTerfilterBelumLunas.length} <span className="text-xs text-zinc-400 font-normal">Siswa</span>
                    </div>
                  </div>
                  {siswaList.length > 0 && (
                    <div className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                      {Math.round((siswaTerfilterBelumLunas.length / siswaList.length) * 100)}% Tertunda
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* KONTEN UTAMA: LAYOUT DUA KOLOM */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
              
              {/* KOLOM A: FORM INPUT DATA SISWA (33% WIDTH ON DESKTOP) */}
              <div
                ref={formSectionRef}
                className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden p-5 sm:p-6 shadow-lg snap-mt-4"
              >
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
                  <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {editingId ? "Perbarui Data Kas" : "Input Pembayaran Kas Baru"}
                  </h3>
                  {editingId && (
                    <button
                      onClick={handleBatalEdit}
                      className="text-xs font-medium text-zinc-400 hover:text-white px-2 py-1 bg-zinc-800 rounded-md transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                </div>

                {/* FORM INPUT UTAMA */}
                <form id="form-input-pembayaran" onSubmit={handleLanjutSimpan} className="space-y-4">
                  {/* INPUT: NAMA SISWA */}
                  <div>
                    <label htmlFor="input-nama" className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wide">
                      Nama Lengkap Siswa <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-nama"
                      ref={inputNamaRef}
                      type="text"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg px-3.5 py-2 text-sm text-white placeholder-zinc-600 transition-all outline-none"
                      placeholder="Contoh: Budi Santoso"
                      value={namaInput}
                      onChange={(e) => setNamaInput(e.target.value)}
                    />
                  </div>

                  {/* INPUT: NAMA KELAS */}
                  <div>
                    <label htmlFor="input-kelas" className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wide">
                      Nama Kelas <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-kelas"
                      type="text"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg px-3.5 py-2 text-sm text-white placeholder-zinc-600 transition-all outline-none"
                      placeholder="Contoh: XII RPL 1, XI TKJ 2"
                      value={kelasInput}
                      onChange={(e) => setKelasInput(e.target.value)}
                    />
                    {/* Rekomendasi Kelas Cepat */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {["XII RPL 1", "XI TKJ 2", "X DKV", "XII MM"].map((presetKelas) => (
                        <button
                          key={presetKelas}
                          type="button"
                          onClick={() => setKelasInput(presetKelas)}
                          className="px-2 py-1 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 text-[10px] font-mono rounded transition-all cursor-pointer"
                        >
                          + {presetKelas}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* INPUT: JUMLAH UANG KAS */}
                  <div>
                    <label htmlFor="input-jumlah" className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wide">
                      Jumlah Uang Kas (Rupiah) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs text-zinc-500 font-mono">Rp</span>
                      <input
                        id="input-jumlah"
                        type="number"
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg pl-9 pr-3.5 py-2 text-sm text-white font-mono placeholder-zinc-600 transition-all outline-none"
                        placeholder="0"
                        value={jumlahInput}
                        onChange={(e) => setJumlahInput(e.target.value)}
                      />
                    </div>
                    {/* Quick Presets Uang Kas */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[5000, 10000, 20000, 50000].map((nominal) => (
                        <button
                          key={nominal}
                          type="button"
                          onClick={() => applyPresetUang(nominal)}
                          className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/40 text-[10px] font-mono rounded transition-all cursor-pointer"
                        >
                          {nominal / 1000}k
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* INPUT: STATUS PEMBAYARAN */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wide">
                      Status Pembayaran <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3" id="payment-status-selector">
                      {/* Tombol Status LUNAS */}
                      <button
                        type="button"
                        onClick={() => setStatusInput("Lunas")}
                        className={`flex items-center justify-center gap-2 px-3 py-2.5 border rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          statusInput === "Lunas"
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-extrabold shadow-sm shadow-emerald-500/10"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                        }`}
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Lunas</span>
                      </button>

                      {/* Tombol Status BELUM LUNAS */}
                      <button
                        type="button"
                        onClick={() => setStatusInput("Belum Lunas")}
                        className={`flex items-center justify-center gap-2 px-3 py-2.5 border rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          statusInput === "Belum Lunas"
                            ? "bg-rose-500/10 border-rose-500 text-rose-400 font-extrabold shadow-sm shadow-rose-500/10"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                        }`}
                      >
                        <UserX className="w-4 h-4" />
                        <span>Belum Lunas</span>
                      </button>
                    </div>
                  </div>

                  {/* TOMBOL PENGIRIMAN VALIDASI */}
                  <div className="pt-4">
                    <button
                      id="btn-lanjut-simpan"
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm tracking-wider uppercase rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" strokeWidth={3} />
                      <span>{editingId ? "Simpan Perubahan" : "Lanjut Simpan"}</span>
                    </button>
                  </div>
                </form>

                {/* INFO FLOW CARD */}
                <div className="mt-6 p-4 bg-zinc-950 border border-zinc-900 rounded-lg flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-zinc-500 leading-relaxed font-sans">
                    <span className="font-semibold text-zinc-400 block mb-0.5">Sistem Autentikasi Form</span>
                    Data diuji kelengkapannya sebelum lanjut disimpan. Modifikasi data diperbarui seketika dengan aman di browser Anda menggunakan media penyimpanan lokal.
                  </div>
                </div>
              </div>

              {/* KOLOM B: DATA LEDGER & LISTINGS (67% WIDTH ON DESKTOP) */}
              <div className="lg:col-span-7 flex flex-col gap-4 w-full">
                
                {/* TOOLBAR: TAB CATEGORY SELECTION & BAR DATA PENCARIAN */}
                <div className="bg-zinc-900 p-4 border border-zinc-800 rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
                  {/* Tabs Pemisah */}
                  <div className="flex bg-zinc-950 p-1 border border-zinc-800 rounded-lg w-full sm:w-auto overflow-x-auto shrink-0">
                    {(["Semua", "Lunas", "Belum Lunas"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setFilterActive(tab)}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer shrink-0 ${
                          filterActive === tab
                            ? "bg-zinc-900 text-white shadow"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {tab === "Semua" && "Semua Siswa"}
                        {tab === "Lunas" && "Sudah Membayar"}
                        {tab === "Belum Lunas" && "Belum Membayar"}
                        <span className="ml-1.5 font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-950/80 text-zinc-500 select-none">
                          {tab === "Semua" && siswaList.length}
                          {tab === "Lunas" && siswaTerfilterLunas.length}
                          {tab === "Belum Lunas" && siswaTerfilterBelumLunas.length}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Kolom Input Pencarian */}
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                    <input
                      type="text"
                      placeholder="Cari nama atau kelas..."
                      className="w-full bg-zinc-950 border border-zinc-850 hover:border-zinc-800 focus:border-emerald-500/40 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-zinc-600 outline-none transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* DATA LEDGER CONTAINER (DAFTAR SISWA) */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg flex-1 min-h-[350px] flex flex-col">
                  {/* Header Ledger */}
                  <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-zinc-500" />
                      LEDGER TRANSAKSI PEMBAYARAN KAS
                    </h3>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {filteredList.length} Data Ditampilkan
                    </span>
                  </div>

                  {/* Isi Daftar Siswa */}
                  <div className="p-2 sm:p-4 divide-y divide-zinc-850 overflow-y-auto max-h-[500px] flex-1">
                    <AnimatePresence initial={false}>
                      {filteredList.length > 0 ? (
                        filteredList.map((siswa, idx) => (
                          <motion.div
                            key={siswa.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -15 }}
                            transition={{ duration: 0.2, delay: Math.min(idx * 0.04, 0.2) }}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-4 rounded-lg transition-all ${
                              editingId === siswa.id
                                ? "bg-amber-500/5 border border-amber-500/20 shadow-[inset_0_0_12px_rgba(245,158,11,0.05)]"
                                : "hover:bg-zinc-950/40"
                            }`}
                          >
                            {/* Kiri: Identitas Siswa */}
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold font-mono text-sm shrink-0 border mt-0.5 ${
                                  siswa.status === "Lunas"
                                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                                    : "bg-rose-500/5 border-rose-500/20 text-rose-400"
                                }`}
                              >
                                {siswa.nama.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-sm text-white hover:text-emerald-400 transition-colors">
                                    {siswa.nama}
                                  </h4>
                                  {/* Badge Kelas */}
                                  <span className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 rounded-md font-mono">
                                    {siswa.kelas}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-zinc-500">
                                  <span className="font-mono">{siswa.tanggal}</span>
                                  <span className="text-zinc-700">•</span>
                                  <span className="flex items-center gap-1 text-[11px]">
                                    {siswa.status === "Lunas" ? (
                                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    ) : (
                                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400" />
                                    )}
                                    Status: {siswa.status}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Kanan: Jumlah Uang & Aksi Pembayaran */}
                            <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-zinc-850 pt-2 sm:pt-0">
                              {/* Display Nominal */}
                              <div className="text-right">
                                <div
                                  className={`text-sm sm:text-base font-bold font-mono ${
                                    siswa.status === "Lunas"
                                      ? "text-emerald-400"
                                      : "text-zinc-200"
                                  }`}
                                >
                                  {formatRupiah(siswa.jumlah)}
                                </div>
                                {/* Label Lunas Small */}
                                <span
                                  className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                    siswa.status === "Lunas"
                                      ? "bg-emerald-500/10 text-emerald-300"
                                      : "bg-rose-500/10 text-rose-300"
                                  }`}
                                >
                                  {siswa.status}
                                </span>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => handleMulaiEdit(siswa)}
                                  className="p-2 bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 hover:text-white rounded-lg text-zinc-400 transition-all cursor-pointer group"
                                  title="Edit/Perbarui Data Siswa"
                                >
                                  <Edit2 className="w-3.5 h-3.5 group-hover:scale-105 transition-transform" />
                                </button>
                                <button
                                  onClick={() => handleHapusSiswa(siswa.id, siswa.nama)}
                                  className="p-2 bg-zinc-950 border border-zinc-805 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 rounded-lg text-zinc-400 transition-all cursor-pointer group"
                                  title="Hapus Data Siswa"
                                >
                                  <Trash2 className="w-3.5 h-3.5 group-hover:scale-105 transition-transform" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="py-20 text-center flex flex-col items-center justify-center">
                          <Layers className="w-10 h-10 text-zinc-700 mb-3 block" />
                          <p className="text-sm font-semibold text-zinc-400">Ledger Kosong</p>
                          <p className="text-xs text-zinc-600 mt-1 max-w-xs">
                            {searchQuery
                              ? "Pencarian tidak cocok dengan nama atau kelas apa pun."
                              : "Belum ada transaksi pembayaran kas yang tercatat untuk filter ini."}
                          </p>
                          {(searchQuery || filterActive !== "Semua") && (
                            <button
                              onClick={() => {
                                setSearchQuery("");
                                setFilterActive("Semua");
                              }}
                              className="mt-4 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs text-white rounded-lg transition-all"
                            >
                              Reset Pencarian
                            </button>
                          )}
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Footer Ledger Info */}
                  <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-2">
                    <p>
                      Mencari: <span className="text-zinc-300">&quot;{searchQuery || "semua"}&quot;</span> • Tab:{" "}
                      <span className="text-zinc-300">&quot;{filterActive}&quot;</span>
                    </p>
                    <p className="font-mono">Sync LocalStorage: AKTIF</p>
                  </div>
                </div>

              </div>
            </div>
            
            {/* FOOTER INFORMASI */}
            <footer className="mt-12 py-6 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-xs text-zinc-500">
                © 2026 Uang Kas Kelas. Hak Cipta Dilindungi Undang-Undang.
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
                <span>Versi 1.1.0</span>
                <span>•</span>
                <span>Proyek Digital Kelas Terstruktur</span>
              </div>
            </footer>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
