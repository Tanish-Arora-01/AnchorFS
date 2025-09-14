// src/components/dashboard/Categories.tsx
import React, { useMemo } from 'react';
import { Camera, FileText, Video, Mic } from 'lucide-react';

export type FileItem = {
  fileId: string;
  fileName: string;     // e.g., "image/png", "application/pdf", "video/mp4", "audio/mpeg"
  fileType: string;
  uploadedAt: string;
  sizeBytes: number;
  totalChunks: number;
};

// Static visuals only (no counts here)
const tiles = [
  { key: 'Pictures', color: 'bg-gradient-to-br from-indigo-100 to-indigo-300 dark:from-indigo-950/40 dark:to-indigo-800/40', icon: Camera, iconColor: 'text-indigo-500 dark:text-indigo-400' },
  { key: 'Documents', color: 'bg-gradient-to-br from-slate-100 to-slate-300 dark:from-slate-900/60 dark:to-slate-800/60', icon: FileText, iconColor: 'text-slate-500 dark:text-slate-400' },
  { key: 'Videos', color: 'bg-gradient-to-br from-violet-100 to-violet-300 dark:from-violet-950/40 dark:to-violet-800/40', icon: Video, iconColor: 'text-violet-500 dark:text-violet-400' },
  { key: 'Audio', color: 'bg-gradient-to-br from-rose-100 to-rose-300 dark:from-rose-950/40 dark:to-rose-800/40', icon: Mic, iconColor: 'text-rose-500 dark:text-rose-400' },
];

// Map MIME to category key
function categorize(mime: string): 'Pictures' | 'Documents' | 'Videos' | 'Audio' | 'Other' {
  if (!mime) return 'Other';
  if (mime.startsWith('image/')) return 'Pictures';
  if (mime.startsWith('video/')) return 'Videos';
  if (mime.startsWith('audio/')) return 'Audio';
  // Treat everything else as Documents
  return 'Documents';
}

type Props = {
  files: FileItem[];
  loading: boolean;
  error: string;
};

export const Categories: React.FC<Props> = ({ files, loading, error }) => {
  // Compute dynamic counts per category from props
  const counts = useMemo(() => {
    const acc: Record<string, number> = { Pictures: 0, Documents: 0, Videos: 0, Audio: 0, Other: 0 };
    for (const f of files) {
      const key = categorize(f.fileType || '');
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, [files]);

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Categories</h2>

      {error && <div className="mb-3 text-sm text-rose-600 dark:text-rose-400">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          const count = loading ? 'Loading…' : `${counts[t.key] || 0} files`;
          return (
            <div
              key={t.key}
              className={`${t.color} rounded-lg p-3 shadow-sm dark:shadow-lg dark:shadow-slate-950/50 cursor-pointer hover:shadow-md dark:hover:shadow-xl transition-all border border-gray-100 dark:border-slate-800/50`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${t.iconColor}`} />
                <div className="w-5 h-5 bg-white/60 dark:bg-slate-900/60 rounded-full flex items-center justify-center shadow-sm dark:shadow-slate-950/50">
                  <span className="text-[10px] text-gray-400 dark:text-slate-500">★</span>
                </div>
              </div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-slate-100">{t.key}</h3>
              <p className="text-xs text-gray-600 dark:text-slate-400">{count}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
