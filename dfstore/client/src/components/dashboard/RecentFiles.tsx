// src/components/dashboard/RecentFiles.tsx
import React, { useMemo } from "react";
import {
  Share2,
  MoreHorizontal,
  Image,
  FileVideo,
  FileAudio,
  FileText,
  FileArchive,
  File as FileIcon,
} from "lucide-react";
import { FilesAPI } from "../../lib/files.service";

export type FileItem = {
  fileId: string;
  fileName: string; // e.g., "application/pdf", "image/png"
  fileType: string; // MIME
  uploadedAt: string; // ISO
  sizeBytes: number;
  totalChunks: number;
};

// Simple bytes -> human string
const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let i = -1;
  do {
    bytes /= 1024;
    i++;
  } while (bytes >= 1024 && i < units.length - 1);
  return `${bytes.toFixed(2).replace(/\.00$/, "")} ${units[i]}`;
};

const pickIcon = (mime: string) => {
  if (mime?.startsWith("image/"))
    return {
      Icon: Image,
      color: "bg-indigo-50 dark:bg-indigo-950/40",
      iconColor: "text-indigo-500 dark:text-indigo-400",
    };
  if (mime?.startsWith("video/"))
    return {
      Icon: FileVideo,
      color: "bg-violet-50 dark:bg-violet-950/40",
      iconColor: "text-violet-500 dark:text-violet-400",
    };
  if (mime?.startsWith("audio/"))
    return {
      Icon: FileAudio,
      color: "bg-blue-50 dark:bg-blue-950/40",
      iconColor: "text-blue-500 dark:text-blue-400",
    };
  if (mime === "application/zip" || mime === "application/x-zip-compressed")
    return {
      Icon: FileArchive,
      color: "bg-rose-50 dark:bg-rose-950/40",
      iconColor: "text-rose-500 dark:text-rose-400",
    };
  if (mime === "application/pdf")
    return {
      Icon: FileText,
      color: "bg-purple-50 dark:bg-purple-950/40",
      iconColor: "text-purple-500 dark:text-purple-400",
    };
  return {
    Icon: FileIcon,
    color: "bg-slate-50 dark:bg-slate-800/40",
    iconColor: "text-slate-500 dark:text-slate-400",
  };
};

type Props = {
  files: FileItem[];
  loading: boolean;
  error: string;
};

export const RecentFiles: React.FC<Props> = ({ files, loading, error }) => {
  // Sort by uploadedAt desc, take top 10
  const recent10 = useMemo(
    () =>
      files
        .slice()
        .sort(
          (a, b) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        )
        .slice(0, 10),
    [files]
  );

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Recent Files
      </h2>

      {error && (
        <div className="mb-3 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {loading && (
          <div className="text-sm text-gray-500 dark:text-slate-400">
            Loading...
          </div>
        )}

        {!loading && recent10.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-slate-400">
            No recent files
          </div>
        )}

        {recent10.map((f) => {
          const { Icon, color, iconColor } = pickIcon(f.fileType || "");
          const baseName = f.fileName?.split("/").pop() || f.fileId;

          return (
            <div
              key={f.fileId}
              className="flex items-center justify-between p-3 bg-white dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-800/50 hover:shadow-sm dark:hover:shadow-lg dark:hover:shadow-slate-950/50 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-10 h-10 ${color} rounded-md flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-slate-100 text-sm">
                    {baseName}
                  </h3>
                  <div className="flex items-center space-x-2 text-[12px] text-gray-500 dark:text-slate-400">
                    <span>{f.fileType || "file"}</span>
                    <span>•</span>
                    <span>{formatBytes(f.sizeBytes)}</span>
                    <span>•</span>
                    <span>{new Date(f.uploadedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
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
                      alert(
                        `Verify\nMerkle: ${v.merkleRootMatches}\nFile: ${v.fileHashMatches}`
                      );
                    } catch (e: any) {
                      alert(e.message || "Verify failed");
                    }
                  }}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800"
                  title="Verify"
                >
                  <Share2 className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                </button>
                <button
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800"
                  title="More"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
