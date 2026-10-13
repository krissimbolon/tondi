# Tondi — instructions for importing opportunities from ChatGPT

## Prompt

> Cari peluang [pilih: pelatihan, seminar, lomba, kompetisi, ujian, tes, sertifikasi, proyek, fellowship, kerja, magang, pertukaran, bootcamp, challenge, volunteer] yang realistis untuk mahasiswa komputasi statistik Indonesia. Utamakan kesempatan yang masih terbuka, dapat didaftarkan di Jakarta atau daring, dengan sumber primer yang dapat diverifikasi. Buat satu berkas JSON yang lolos kontrak `tondi/import-v1` (bukan Markdown atau pseudocode). Masing-masing item harus memiliki ID stabil dan unik, kategori `type` yang tepat, nama penyelenggara, judul, `sourceUrl` yang mengarah ke pengumuman asli, `registrationUrl` jika ada, status yang benar-benar terverifikasi, dan tanggal yang hanya diisi jika diketahui. Jika belum diverifikasi, gunakan `sourceKind: unverified`, `status: discovered`, dan `null` untuk tanggal tidak diketahui. Jangan membuat capaian (`achievements`) atau metrik CV sebelum ada bukti hasil nyata. Dedup berdasarkan organisasi, judul dan URL asli. Berikan ringkasan verifikasi dan catatan keterbatasan terpisah dari JSON. 

## Import schema

```json
{
  "format": "tondi/import-v1",
  "opportunities": [
    {
      "id": "organizer-originalpostid-2026",
      "type": "pelatihan",
      "title": "Example only - replace with verified program",
      "organizer": "Example organization",
      "sourceUrl": "https://example.org/announcement",
      "registrationUrl": "",
      "deadline": null,
      "startDate": null,
      "endDate": null,
      "status": "discovered",
      "sourceKind": "unverified",
      "verifiedAt": null,
      "tags": ["research"]
    }
  ],
  "achievements": []
}
```

The JSON shown above is a schema demonstration, **not** a real opportunity. In Tondi, open `/app/impor`, paste or upload, validate the preview, check duplicates, and then confirm. Data is saved to a private draft. The public portfolio is unaffected until the owner publishes specifically approved, evidence-backed achievements.

## Fields and accepted categories

Categories: `pelatihan`, `lomba`, `ujian`, `tes`, `kompetisi`, `challenge`, `event`, `beasiswa`, `internship`, `job`, `project`, `volunteer`, `fellowship`, `lainnya`.

States: `discovered`, `open`, `applied`, `accepted`, `participating`, `completed`, `closed`, `archived`.

Source types: `official`, `partner`, `media`, `unverified`. State `open` must not be used unless an appropriate primary source confirms active registration.

## Evidence and CV claims

A participant does not automatically qualify as a winner, practitioner, or certified professional. Never invent scores, awards, rankings, work outcomes or contribution percentages. Store a record of verified participation and its provenance first; attach public proof, method, sample size and attribution before enabling a public metric. This protects the credibility of Tondi's CV Studio.
