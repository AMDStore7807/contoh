============================================================
RANGKUMAN: Cara Query Langsung Backend GenieACS NBI (Port 7557)
============================================================

Ini adalah rangkuman cara meng-query backend NBI (genieacs-nbi) secara langsung, misalnya dari browser atau curl, berdasarkan analisis file `lib/nbi.ts` dan `lib/query.ts`.

## KESIMPULAN UTAMA

1.  **Backend Tidak Mengerti `?filter`**:
    Port 7557 (NBI) **TIDAK** mengerti parameter `?filter=active` atau `?filter=...`. Parameter `?filter` adalah logika yang hanya ada di UI bawaan (port 3000).

2.  **Parameter Wajib adalah `?query`**:
    Backend NBI secara spesifik mencari parameter query string yang bernama **`query`**.

3.  **Nilai `?query` adalah JSON String**:
    Nilai dari `?query` harus berupa **JSON string** yang berisi query format MongoDB.

4.  **JSON Wajib di-URL-Encode**:
    Saat digunakan di browser, JSON string itu (yang mengandung `{`, `}`, `"`) harus di-URL-encode agar valid.
    Contoh: `{}` menjadi `%7B%7D`.

5.  **Logika Query "Smart" (`lib/query.ts`)**:

    - Backend otomatis menambahkan `._value` pada field parameter (jika key tidak diakhiri `_`).
    - Backend otomatis mengubah string dengan wildcard `*` (asterisk) menjadi query `$regex`.
    - Backend otomatis mencoba normalisasi nilai string ke angka atau tanggal.

6.  **Filter Dinamis (Waktu) Dihitung Manual**:
    Untuk filter seperti "aktif" atau "offline", Bos harus menghitung tanggal ISO String-nya secara manual (Waktu Sekarang - X menit/hari), lalu memasukkannya ke JSON query.

7.  **Parameter Lainnya**:
    Backend NBI juga menerima parameter `projection`, `sort`, `limit`, dan `skip`.

## CONTOH URL (Untuk di-paste ke Browser di Port 7557)

---

**1. Get Semua Device (Tanpa Filter)**

- **JSON Query**: `{}`
- **URL Encoded**: `%7B%7D`
- **URL**:
  http://localhost:7557/devices?query=%7B%7D

---

**2. Get Semua Device (Dengan Pagination)**

- **Tujuan**: Ambil 50 device pertama (halaman 1)
- **URL**:
  http://localhost:7557/devices?query=%7B%7D&limit=50&skip=0

---

**3. Filter Berdasarkan ID (Serial Number)**

- **JSON Query**: `{"_id": "SERIAL-ANDA"}`
- **URL Encoded**: `%7B%22_id%22%3A%22SERIAL-ANDA%22%7D`
- **URL**:
  http://localhost:7557/devices?query=%7B%22_id%22%3A%22SERIAL-ANDA%22%7D

---

**4. Filter Berdasarkan Model Name (Pakai Wildcard `*`)**

- **JSON Query**: `{"InternetGatewayDevice.DeviceInfo.ModelName": "*Router*"}`
- **URL Encoded**: `%7B%22InternetGatewayDevice.DeviceInfo.ModelName%22%3A%22*Router*%22%7D`
- **URL**:
  http://localhost:7557/devices?query=%7B%22InternetGatewayDevice.DeviceInfo.ModelName%22%3A%22*Router*%22%7D

---

**5. Filter "Aktif" (Device lapor < 5 menit terakhir)**

- **PENTING**: Tanggal ISO String di bawah ini (`2025-10-25T09:31:00.000Z`) harus Bos hitung manual (Waktu Sekarang - 5 Menit) setiap kali menjalankan.
- **JSON Query**: `{"_lastInform": {"$gt": "2025-10-25T09:31:00.000Z"}}`
- **URL Encoded**: `%7B%22_lastInform%22%3A%7B%22%24gt%22%3A%222025-10-25T09%3A31%3A00.000Z%22%7D%7D`
- **URL**:
  http://localhost:7557/devices?query=%7B%22_lastInform%22%3A%7B%22%24gt%22%3A%222025-10-25T09%3A31%3A00.000Z%22%7D%7D

---

**6. Filter "Offline Lama" (Device lapor > 30 hari lalu)**

- **PENTING**: Tanggal ISO String di bawah ini (`2025-09-25T...`) harus Bos hitung manual (Waktu Sekarang - 30 Hari).
- **JSON Query**: `{"_lastInform": {"$lt": "2025-09-25T09:34:00.000Z"}}`
- **URL Encoded**: `%7B%22_lastInform%22%3A%7B%22%24lt%22%3A%222025-09-25T09%3A34%3A00.000Z%22%7D%7D`
- **URL**:
  http://localhost:7557/devices?query=%7B%22_lastInform%22%3A%7B%22%24lt%22%3A%222025-09-25T09%3A34%3A00.000Z%22%7D%7D

---

**7. Contoh Kombinasi Lengkap**

- **Tujuan**: Cari Model `*Router*`, ambil `_id` & `_lastInform`, urutkan (terbaru dulu), batasi 5.
- **JSON Query**: `{"InternetGatewayDevice.DeviceInfo.ModelName": "*Router*"}` (Encoded: `%7B%22InternetGatewayDevice.DeviceInfo.ModelName%22%3A%22*Router*%22%7D`)
- **JSON Sort**: `{"_lastInform": -1}` (Encoded: `%7B%22_lastInform%22%3A-1%7D`)
- **URL**:
  http://localhost:7557/devices?query=%7B%22InternetGatewayDevice.DeviceInfo.ModelName%22%3A%22*Router*%22%7D&projection=\_id,\_lastInform&sort=%7B%22_lastInform%22%3A-1%7D&limit=5

---
