import { CategoryPreview } from './todo.model';

export type AccessType = 'PRIVATE' | 'PUBLIC';

export type FileType =
  | 'pdf'
  | 'docx'
  | 'doc'
  | 'xlsx'
  | 'xls'
  | 'pptx'
  | 'ppt'
  | 'txt'
  | 'csv'
  | 'png'
  | 'jpg'
  | 'jpeg'
  | 'webp'
  | 'gif'
  | 'svg'
  | 'heic'
  | 'mp4'
  | 'mov'
  | 'avi'
  | 'mkv'
  | 'webm'
  | 'mp3'
  | 'wav'
  | 'aac'
  | 'flac'
  | 'm4a'
  | 'zip'
  | 'rar'
  | '7z'
  | 'tar'
  | 'json'
  | 'xml'
  | 'html'
  | 'css'
  | 'ts'
  | 'js';

export interface DocumentResponse {
  id: number;
  title: string;
  description: string;
  fileType: string;
  fileSizeBytes: number;
  accessType: AccessType;
  uploadedAt: string;
  categories: CategoryPreview[] | null;
  presignedUrl: string | null;
}

export interface DocumentFilter {
  fileType?: string;
  accessType?: AccessType;
  uploadedFrom?: string;
  uploadedTo?: string;
  categoryIds?: number[];
}
