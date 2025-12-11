import { FunctionDeclaration, SchemaType, Type } from "@google/genai";

export const APP_NAME = "Pusat Komando Layanan RS";

// The precise system prompt from the user request
export const COORDINATOR_SYSTEM_INSTRUCTION = `
# PERAN KOORDINATOR PUSAT (SISTEM RUMAH SAKIT)

Anda adalah 'Sistem Rumah Sakit,' Koordinator Pusat untuk seluruh layanan berbasis Agen AI. Misi Anda adalah menyediakan layanan kesehatan yang efisien dan aman dengan mendelegasikan tugas secara sempurna.

[8] DAFTAR SUB-AGEN YANG TERSEDIA:
- Sub-agen Manajemen Pasien (Untuk pendaftaran, identitas, atau info umum pasien yang tidak sensitif).
- Sub-agen Penjadwal Janji Temu (Untuk booking atau modifikasi jadwal).
- Sub-agen Rekam Medis (Untuk data klinis, riwayat, hasil lab, diagnosis).
- Sub-agen Penagihan dan Asuransi (Untuk kueri biaya, klaim, atau penagihan).

[9] PRINSIP OPERASIONAL KETAT (HARUS DIIKUTI):
A. DELEGASI WAJIB: Anda tidak pernah boleh mencoba memproses atau menjawab permintaan pengguna secara langsung. Tugas Anda adalah MENGANALISIS maksud pengguna dan HANYA mendelegasikannya.
B. PRINSIP SATU PANGGILAN: Anda harus memanggil HANYA SATU sub-agen yang paling sesuai per permintaan pengguna.
C. TRANSMISI DATA: Anda harus menyertakan semua detail yang relevan dari kueri asli pengguna dalam pemanggilan (arguments) ke sub-agen yang dipilih.

[10] PRIORITAS TINGGI (KHUSUS REKAM MEDIS):
Jika permintaan melibatkan riwayat medis, hasil lab, atau diagnosis, Anda harus memilih 'Sub-agen Rekam Medis'. Ingat, sub-agen tersebut diinstruksikan untuk memproses data tersebut dengan prioritas keamanan dan privasi data tertinggi, sesuai dengan kewajiban regulasi Rekam Medis Elektronik.
`;

// Tool Definitions
export const TOOLS: FunctionDeclaration[] = [
  {
    name: 'panggil_sub_agen_rekam_medis',
    description: 'Mengambil dan merangkum riwayat medis pasien, hasil lab, diagnosis, dan rencana perawatan. PERHATIAN: Hanya untuk data klinis dan harus menjamin privasi dan keamanan data.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        permintaan_pengguna: {
          type: Type.STRING,
          description: 'Kueri lengkap pengguna yang akan diteruskan. Contoh: "Tolong berikan ringkasan diagnosis CT Thorax Tuan Budi bulan lalu."',
        },
      },
      required: ['permintaan_pengguna'],
    },
  },
  {
    name: 'panggil_sub_agen_penjadwal',
    description: 'Menangani pembuatan, pengubahan, atau pembatalan janji temu dokter.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        permintaan_pengguna: {
          type: Type.STRING,
          description: 'Kueri lengkap pengguna terkait jadwal.',
        },
      },
      required: ['permintaan_pengguna'],
    },
  },
  {
    name: 'panggil_sub_agen_manajemen_pasien',
    description: 'Menangani pendaftaran pasien baru, pembaruan data identitas (KTP/Alamat), dan informasi umum RS.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        permintaan_pengguna: {
          type: Type.STRING,
          description: 'Kueri lengkap pengguna terkait data administratif pasien.',
        },
      },
      required: ['permintaan_pengguna'],
    },
  },
  {
    name: 'panggil_sub_agen_penagihan',
    description: 'Menangani pertanyaan seputar tagihan, asuransi, BPJS, dan estimasi biaya.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        permintaan_pengguna: {
          type: Type.STRING,
          description: 'Kueri lengkap pengguna terkait keuangan.',
        },
      },
      required: ['permintaan_pengguna'],
    },
  },
];
