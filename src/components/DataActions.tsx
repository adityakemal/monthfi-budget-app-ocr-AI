"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import dayjs from "dayjs";
import { useBudgetStore } from "@/store/budget";
import { processReceipt } from "@/app/action";
import type { Transaction } from "@/types";
import { OcrConfirmationModal } from "./OcrConfirmationModal";

export function DataActions() {
  const { transactions, importData, addTransaction } = useBudgetStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ocrInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);

  const downloadCSV = (data: any[], filename: string) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        name: "Makan siang",
        nominal: 25000,
        kategori: "Makanan",
        keterangan: "Nasi padang",
        date: dayjs().format("DD/MM/YYYY"),
      },
    ];
    downloadCSV(template, "template_transaksi.csv");
  };

  const handleExport = () => {
    const data = transactions.map((t) => ({
      name: t.name,
      nominal: t.nominal,
      kategori: t.kategori,
      keterangan: t.keterangan || "",
      date: t.date,
      source: t.source || "Web",
    }));
    downloadCSV(data, "export_transaksi.csv");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedTxs: Transaction[] = [];
        results.data.forEach((row: any) => {
          if (row.name && row.nominal && row.kategori) {
            const rawNominal = row.nominal.toString().replace(/[^0-9]/g, "");
            const parsedNominal = parseInt(rawNominal, 10);

            let rowDate = new Date().toISOString();
            if (row.date) {
              const parts = row.date.split("/");
              if (parts.length === 3) {
                // DD/MM/YYYY
                const d = new Date(
                  parseInt(parts[2]),
                  parseInt(parts[1]) - 1,
                  parseInt(parts[0]),
                );
                if (!isNaN(d.getTime())) rowDate = d.toISOString();
              } else {
                const d = new Date(row.date);
                if (!isNaN(d.getTime())) rowDate = d.toISOString();
              }
            }

            if (parsedNominal > 0) {
              parsedTxs.push({
                id: crypto.randomUUID(),
                name: row.name,
                nominal: parsedNominal,
                kategori: row.kategori,
                keterangan: row.keterangan || "",
                date: rowDate,
                source: row.source || "CSV",
              });
            }
          }
        });

        if (parsedTxs.length > 0) {
          importData(parsedTxs);
          alert(`Berhasil mengimpor ${parsedTxs.length} transaksi!`);
        } else {
          alert(
            "Format CSV tidak valid atau data kosong. Pastikan kolom name, nominal, dan kategori terisi.",
          );
        }

        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      error: (error: any) => {
        alert(`Error parsing CSV: ${error.message}`);
      },
    });
  };

  const handleOcrClick = () => {
    ocrInputRef.current?.click();
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = async () => {
          let width = img.width;
          let height = img.height;
          let quality = 0.8;
          const MAX_DIMENSION = 1800;

          if (width > height) {
            if (width > MAX_DIMENSION) {
              height = Math.round((height * MAX_DIMENSION) / width);
              width = MAX_DIMENSION;
            }
          } else {
            if (height > MAX_DIMENSION) {
              width = Math.round((width * MAX_DIMENSION) / height);
              height = MAX_DIMENSION;
            }
          }

          const getBlob = (w: number, h: number, q: number): Promise<Blob | null> => {
            return new Promise((res) => {
              const canvas = document.createElement("canvas");
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext("2d");
              if (!ctx) return res(null);
              ctx.drawImage(img, 0, 0, w, h);
              canvas.toBlob((blob) => res(blob), "image/webp", q);
            });
          };

          const MAX_FILE_SIZE = 480 * 1024; // 480 KB limit (under 500KB)
          let currentBlob: Blob | null = null;
          let attempts = 0;

          while (attempts < 6) {
            currentBlob = await getBlob(width, height, quality);
            if (currentBlob && currentBlob.size <= MAX_FILE_SIZE) {
              break;
            }
            // Jika masih lebih besar dari batas 500KB, kurangi dimensi dan kualitas
            width = Math.round(width * 0.8);
            height = Math.round(height * 0.8);
            quality = Math.max(0.5, quality - 0.1);
            attempts++;
          }

          if (currentBlob) {
            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const compressedFile = new File([currentBlob], newFileName, {
              type: "image/webp",
              lastModified: Date.now(),
            });
            
            if (compressedFile.size > file.size && file.size <= MAX_FILE_SIZE) {
              resolve(file);
            } else {
              resolve(compressedFile);
            }
          } else {
            resolve(file);
          }
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const handleOcrChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsScanning(true);
      
      // Kompres gambar sebelum dikirim
      const compressedFile = await compressImage(file);
      
      const formData = new FormData();
      formData.append("file", compressedFile);

      const result = await processReceipt(formData);

      if (result.error) {
        alert(`Error OCR: ${result.error}`);
        return;
      }

      setOcrResult(result);
      setIsOcrModalOpen(true);
    } catch (error: any) {
      alert(`Error OCR: ${error.message}`);
    } finally {
      setIsScanning(false);
      if (ocrInputRef.current) ocrInputRef.current.value = "";
    }
  };

  const handleOcrSave = (savedTransactions: any[]) => {
    // Generate UUIDs and add to store
    const toSave: Transaction[] = savedTransactions.map((tx) => ({
      ...tx,
      id: crypto.randomUUID(),
    }));

    // We can use importData to bulk add, or addTransaction loop.
    // Using importData as done in CSV import:
    if (toSave.length > 0) {
      toSave.forEach((tx) => addTransaction(tx as any));
      alert(`Berhasil menyimpan ${toSave.length} transaksi dari OCR!`);
    }

    setIsOcrModalOpen(false);
    setOcrResult(null);
  };

  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-xl mt-4"
      style={{ background: "var(--surface)" }}
    >
      <p
        className="text-[14px] font-semibold"
        style={{ color: "var(--text-display)" }}
      >
        Manajemen Data
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={handleDownloadTemplate}
          className="w-full h-11 text-[13px] font-medium rounded-lg"
          style={{
            border: "1px solid var(--border-visible)",
            color: "var(--text-secondary)",
            background: "transparent",
          }}
        >
          Unduh Template
        </button>
        <button
          onClick={handleExport}
          className="w-full h-11 text-[13px] font-medium rounded-lg"
          style={{
            border: "1px solid var(--border-visible)",
            color: "var(--text-secondary)",
            background: "transparent",
          }}
        >
          Export CSV
        </button>
        <button
          onClick={handleImportClick}
          className="w-full h-11 text-[13px] font-bold rounded-lg"
          style={{
            background: "var(--accent)",
            color: "white",
            border: "none",
          }}
        >
          Import CSV
        </button>
        <button
          onClick={handleOcrClick}
          disabled={isScanning}
          className="w-full h-11 text-[13px] font-bold rounded-lg flex items-center justify-center gap-2"
          style={{
            background: "var(--success, #10b981)",
            color: "white",
            border: "none",
            opacity: isScanning ? 0.7 : 1,
          }}
        >
          {isScanning ? "Memproses..." : "📷 Scan Struk"}
        </button>
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <input
          type="file"
          accept="image/*"
          ref={ocrInputRef}
          style={{ display: "none" }}
          onChange={handleOcrChange}
        />
      </div>

      <OcrConfirmationModal
        isOpen={isOcrModalOpen}
        onClose={() => setIsOcrModalOpen(false)}
        ocrData={ocrResult}
        onSave={handleOcrSave}
      />

      {isScanning && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
          <p className="text-white text-lg font-semibold animate-pulse">
            Memproses Foto...
          </p>
          <p className="text-white/80 text-sm mt-2">
            Mohon tunggu, AI sedang membaca data struk.
          </p>
        </div>
      )}
    </div>
  );
}
