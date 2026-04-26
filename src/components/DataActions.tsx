'use client';

import { useRef } from 'react';
import Papa from 'papaparse';
import dayjs from 'dayjs';
import { useBudgetStore } from '@/store/budget';
import type { Transaction } from '@/types';

export function DataActions() {
  const { transactions, importData } = useBudgetStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadCSV = (data: any[], filename: string) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    
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
        name: 'Makan siang',
        nominal: 25000,
        kategori: 'Makanan',
        keterangan: 'Nasi padang',
        date: dayjs().format('DD/MM/YYYY')
      }
    ];
    downloadCSV(template, 'template_transaksi.csv');
  };

  const handleExport = () => {
    const data = transactions.map(t => ({
      name: t.name,
      nominal: t.nominal,
      kategori: t.kategori,
      keterangan: t.keterangan || '',
      date: t.date,
      source: t.source || 'Web'
    }));
    downloadCSV(data, 'export_transaksi.csv');
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
            const rawNominal = row.nominal.toString().replace(/[^0-9]/g, '');
            const parsedNominal = parseInt(rawNominal, 10);
            
            let rowDate = new Date().toISOString();
            if (row.date) {
              const parts = row.date.split('/');
              if (parts.length === 3) {
                // DD/MM/YYYY
                const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
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
                keterangan: row.keterangan || '',
                date: rowDate,
                source: row.source || 'CSV'
              });
            }
          }
        });

        if (parsedTxs.length > 0) {
          importData(parsedTxs);
          alert(`Berhasil mengimpor ${parsedTxs.length} transaksi!`);
        } else {
          alert('Format CSV tidak valid atau data kosong. Pastikan kolom name, nominal, dan kategori terisi.');
        }
        
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      error: (error: any) => {
        alert(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl mt-4" style={{ background: 'var(--surface)' }}>
      <p className="text-[14px] font-semibold" style={{ color: 'var(--text-display)' }}>Manajemen Data</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={handleDownloadTemplate}
          className="w-full h-11 text-[13px] font-medium rounded-lg"
          style={{ border: '1px solid var(--border-visible)', color: 'var(--text-secondary)', background: 'transparent' }}
        >
          Unduh Template
        </button>
        <button
          onClick={handleExport}
          className="w-full h-11 text-[13px] font-medium rounded-lg"
          style={{ border: '1px solid var(--border-visible)', color: 'var(--text-secondary)', background: 'transparent' }}
        >
          Export CSV
        </button>
        <button
          onClick={handleImportClick}
          className="w-full h-11 text-[13px] font-bold rounded-lg"
          style={{ background: 'var(--accent)', color: 'white', border: 'none' }}
        >
          Import CSV
        </button>
        <input 
          type="file" 
          accept=".csv" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange} 
        />
      </div>
    </div>
  );
}
