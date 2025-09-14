// src/components/dashboard/Dashboard.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Categories } from './Categories';
import { Files } from './Files';
import { RecentFiles } from './RecentFiles';
import { StorageInfo } from './StorageInfo';
import { FilesAPI } from '../../lib/files.service';

export type FileItem = {
  fileId: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  sizeBytes: number;
  totalChunks: number;
};

export const Dashboard: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await FilesAPI.list(); // fetch from backend once in the parent
      setFiles(data);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFiles(); }, [loadFiles]); // initial fetch

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950">
      <div className="sticky top-0 h-screen z-10">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <Header />
        <div className="flex-1 flex min-h-0">
          <main className="flex-1 overflow-y-auto p-6 min-h-0">
            <Categories files={files} loading={loading} error={error} />
            <Files files={files} loading={loading} error={error} onUploaded={loadFiles} />
            <RecentFiles files={files} loading={loading} error={error} />
          </main>
          <StorageInfo onUploaded={loadFiles} />
        </div>
      </div>
    </div>
  );
};
