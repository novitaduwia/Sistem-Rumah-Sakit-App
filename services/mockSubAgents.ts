import { AgentType, SubAgentResponse } from "../types";

// Simulating a delay to make it feel like an agent is working
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const executeSubAgent = async (toolName: string, args: Record<string, any>): Promise<SubAgentResponse> => {
  await delay(1500); // Simulate processing time

  const request = args.permintaan_pengguna || "No request provided";

  switch (toolName) {
    case 'panggil_sub_agen_rekam_medis':
      return {
        agentType: AgentType.MEDICAL_RECORDS,
        response: `**[PROTOKOL KEAMANAN DATA DIAKTIFKAN]**\n\nVerifikasi akses berhasil. Mengakses Electronic Medical Record (EMR) terenkripsi.\n\nBerdasarkan permintaan: _"${request}"_\n\n**Ringkasan Klinis:**\n- Pasien: Budi Santoso (L)\n- Tanggal Kunjungan Terakhir: 12 Oktober 2024\n- Diagnosis: Bronkitis Akut (J20.9)\n- Hasil Lab: Leukosit sedikit meningkat (11.500/uL), Rontgen Thorax menunjukkan infiltrat minimal.\n- Rencana: Antibiotik Azithromycin 500mg (Selesai), evaluasi ulang 1 minggu.\n\n_Catatan: Data ini bersifat RAHASIA. Dilarang menyebarkan tanpa otorisasi._`
      };

    case 'panggil_sub_agen_penjadwal':
      return {
        agentType: AgentType.APPOINTMENTS,
        response: `**[Sistem Penjadwalan Terpadu]**\n\nMemproses permintaan jadwal: _"${request}"_\n\nSaya telah memeriksa ketersediaan dokter terkait.\n\n**Opsi Tersedia:**\n1. dr. Siti Aminah, Sp.PD - Senin, 09:00 WIB\n2. dr. Budi Gunawan, Sp.P - Selasa, 14:00 WIB\n\nSilakan konfirmasi pilihan Anda untuk mengunci slot waktu.`
      };

    case 'panggil_sub_agen_manajemen_pasien':
      return {
        agentType: AgentType.PATIENT_MANAGEMENT,
        response: `**[Administrasi Pasien]**\n\nMenerima kueri: _"${request}"_\n\nData pasien telah ditemukan di database pusat. Status keanggotaan aktif. Tidak ada perubahan data demografis yang tertunda. Jika Anda ingin memperbarui alamat atau nomor telepon, silakan unggah dokumen pendukung.`
      };

    case 'panggil_sub_agen_penagihan':
      return {
        agentType: AgentType.BILLING,
        response: `**[Layanan Keuangan & Asuransi]**\n\nAnalisis biaya untuk: _"${request}"_\n\nStatus Asuransi: **BPJS Kesehatan Aktif** (Kelas 1).\n\nEstimasi biaya untuk tindakan yang disebutkan ditanggung sepenuhnya oleh BPJS sesuai prosedur rujukan berjenjang. Tidak ada biaya *out-of-pocket* yang diproyeksikan saat ini.`
      };

    default:
      return {
        agentType: AgentType.COORDINATOR,
        response: "Error: Sub-agen tidak dikenali."
      };
  }
};