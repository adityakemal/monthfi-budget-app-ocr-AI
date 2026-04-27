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

  const handleOcrChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsScanning(true);
      const formData = new FormData();
      formData.append("file", file);

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
    const toSave: Transaction[] = savedTransactions.map(tx => ({
      ...tx,
      id: crypto.randomUUID()
    }));
    
    // We can use importData to bulk add, or addTransaction loop. 
    // Using importData as done in CSV import:
    if (toSave.length > 0) {
      toSave.forEach(tx => addTransaction(tx as any));
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
          capture="environment"
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
    </div>
  );
}
