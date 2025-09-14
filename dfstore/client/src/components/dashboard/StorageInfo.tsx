// src/components/dashboard/StorageInfo.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { FilesAPI } from '../../lib/files.service';

type Props = { onUploaded?: () => void };

const GB = 1024 ** 3;
const MB = 1024 ** 2;

const fmtSmart = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 MB';
  if (bytes < GB) return `${(bytes / MB).toFixed(2).replace(/\.00$/, '')} MB`;
  return `${(bytes / GB).toFixed(2).replace(/\.00$/, '')} GB`;
};

export const StorageInfo: React.FC<Props> = ({ onUploaded }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string>('');
  const [usage, setUsage] = useState<{ usedBytes: number; limitBytes: number } | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [usageErr, setUsageErr] = useState<string>('');

  const loadUsage = async () => {
    setLoadingUsage(true);
    setUsageErr('');
    try {
      const u = await FilesAPI.usage(); // expects { usedBytes, limitBytes }
      // Optional: force a 5 GB cap client-side if backend not yet updated
      const limitBytes = u.limitBytes ?? 5 * GB;
      setUsage({ usedBytes: u.usedBytes, limitBytes });
    } catch (e: any) {
      setUsageErr(e?.message || 'Failed to load usage');
    } finally {
      setLoadingUsage(false);
    }
  };

  useEffect(() => { loadUsage(); }, []);

  const openPicker = () => inputRef.current?.click();

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // fixed typo: was e.target.files?.
    if (!file) return;
    setUploading(true);
    setMsg('');
    try {
      await FilesAPI.upload(file);
      setMsg('Uploaded successfully');
      onUploaded?.();
      await loadUsage(); // refresh usage after upload
    } catch (err: any) {
      setMsg(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const pct = useMemo(() => {
    if (!usage) return 0;
    if (usage.limitBytes <= 0) return 0;
    return Math.min(100, Math.round((usage.usedBytes / usage.limitBytes) * 100));
  }, [usage]);

  return (
    <div className="w-80 bg-white dark:bg-slate-900 border-l border-gray-100 dark:border-slate-800/50 p-6 shadow-sm dark:shadow-slate-900/50">
      <input ref={inputRef} type="file" onChange={onPick} className="hidden" />

      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 ring-4 ring-[var(--accent)]/10 dark:ring-[var(--accent)]/20">
          <Upload className="w-9 h-9 text-[var(--accent)] dark:text-indigo-400" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">Add new files</h3>
        <p className="text-xs text-gray-500 mb-3">Upload files to your cloud storage quickly</p>
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={openPicker}
            disabled={uploading}
            className="px-4 py-2 bg-[var(--accent)] hover:bg-opacity-90 text-white rounded-full transition-colors text-sm font-medium shadow-sm disabled:opacity-60"
          >
            {uploading ? 'Uploading…' : 'Upload Files'}
          </button>
        </div>
        {msg && <p className="mt-2 text-xs text-gray-600 dark:text-slate-400">{msg}</p>}
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Your Storage</span>
          <span className="text-sm text-[var(--accent)] font-semibold">
            {loadingUsage ? 'Loading…' : `${pct}% used`}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[var(--accent)] to-indigo-400 h-3 rounded-full transition-all duration-300 shadow-inner"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{usage ? `${fmtSmart(usage.usedBytes)} used` : '—'}</span>
          <span>{usage ? `${(usage.limitBytes / GB).toFixed(2).replace(/\.00$/, '')} GB total` : '—'}</span>
        </div>

        {usageErr && <div className="mt-2 text-xs text-rose-600">{usageErr}</div>}
      </div>
    </div>
  );
};
