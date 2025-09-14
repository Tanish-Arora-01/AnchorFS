// src/lib/files.service.ts
import { supabase } from '../contexts/AuthContext';

export type FileItem = {
  fileId: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  sizeBytes: number;
  totalChunks: number;
  
};

type RequestOptions = RequestInit & {
  responseType?: 'json' | 'blob';
};

async function request<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Accept') && options.responseType !== 'blob') {
    headers.set('Accept', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const { responseType, ...fetchOpts } = options;
  const res = await fetch(path, { ...fetchOpts, headers });

  if (!res.ok) {
    let msg: string;
    try { msg = await res.text(); } catch { msg = `HTTP ${res.status}`; }
    throw new Error(msg);
  }

  if (responseType === 'blob') {
    return (await res.blob()) as unknown as T;
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    return (await res.json()) as T;
  }

  // Fallback: try JSON, then text
  try { return (await res.json()) as T; } catch { /* ignore */ }
  return (await res.text()) as unknown as T;
}

export const FilesAPI = {
  list: () => request<FileItem[]>('/api/files'),
  upload: (file: File) => {
    const fd = new FormData();
    fd.append('file', file); // browser sets multipart boundary
    return request('/api/upload', { method: 'POST', body: fd });
  },
  verify: (fileId: string) => request(`/api/verify/${fileId}`),

  // Protected download as blob with Authorization header
  downloadBlob: (fileId: string) =>
    request<Blob>(`/api/download/${fileId}`, { method: 'GET', responseType: 'blob' }),

  usage: () => request<{ usedBytes: number; limitBytes: number }>('/api/storage/usage'),

  downloadToFile: async (fileId: string, fileName: string) => {
    const blob = await FilesAPI.downloadBlob(fileId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || fileId;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};
