// src/components/dashboard/Files.tsx
import React, { useRef, useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { FilesAPI } from '../../lib/files.service';

export type FileItem = {
  fileId: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  sizeBytes: number;
  totalChunks: number;
};



type Props = {
  files: FileItem[];
  loading: boolean;
  error: string;
  onUploaded?: () => void; // notify parent to refresh after upload
};

export const Files: React.FC<Props> = ({ files, loading, error, onUploaded }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string>('');

  const openPicker = () => inputRef.current?.click();

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg('');
    try {
      await FilesAPI.upload(file); // POST /api/upload
      setMsg('Uploaded successfully');
      onUploaded?.(); // trigger parent refresh here
    } catch (err: any) {
      setMsg(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Files</h2>

      {error && (
        <div className="mb-3 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      <input ref={inputRef} type="file" onChange={onPick} className="hidden" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading && <div className="text-sm text-gray-500 dark:text-slate-400">Loading...</div>}
        {!loading && files.length === 0 && <div className="text-sm text-gray-500 dark:text-slate-400">No files yet</div>}

        {files.map((f) => (
          <div key={f.fileId} className="bg-white dark:bg-slate-900/50 rounded-lg p-3 shadow-sm dark:shadow-lg dark:shadow-slate-950/50 border border-gray-100 dark:border-slate-800/50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-slate-100 text-sm">{f.fileName}</h3>
                <p className="text-[11px] text-gray-600 dark:text-slate-400">
                  {(f.sizeBytes / 1_000_000).toFixed(2)} MB • {new Date(f.uploadedAt).toLocaleString()}
                </p>
              </div>
              <FileText className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            </div>

            <div className="mt-3 flex items-center gap-2">
             <button
  onClick={() => FilesAPI.downloadToFile(f.fileId, f.fileName)}
  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
  title="Download"
>
  Download
</button>

              <button
                onClick={async () => {
                  try {
                    const v = await FilesAPI.verify(f.fileId);
                    alert(`Verify\nMerkle: ${v.merkleRootMatches}\nFile: ${v.fileHashMatches}`);
                  } catch (e: any) {
                    alert(e.message || 'Verify failed');
                  }
                }}
                className="text-xs text-gray-700 dark:text-slate-300 hover:underline"
              >
                Verify
              </button>
            </div>

            {msg && <div className="mt-2 text-[11px] text-gray-500 dark:text-slate-400">{msg}</div>}
          </div>
        ))}

        {/* Add file tile */}
        <button
          type="button"
          onClick={openPicker}
          disabled={uploading}
          className="bg-white dark:bg-slate-900/50 rounded-lg p-3 shadow-sm dark:shadow-lg dark:shadow-slate-950/50 border-2 border-dashed border-gray-200 dark:border-slate-800/50 text-left hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
          title="Add file"
        >
          <div className="text-center">
            <Plus className="w-6 h-6 text-gray-300 dark:text-slate-600 mx-auto mb-2 mt-1" />
            <span className="text-xs text-gray-500 dark:text-slate-400">
              {uploading ? 'Uploading…' : 'Add file'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
