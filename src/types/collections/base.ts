export type ISOString = string;
export type UID = string;
export type ID = string;

export interface BaseEntity {
  id: ID;
  createdAt?: ISOString;
  updatedAt?: ISOString;
}

export interface FileReference {
  provider: "supabase" | "firebase";
  bucket: string;
  path: string;
  publicUrl?: string; 
  mimeType: string;
  sizeBytes: number;
  fileName: string;
  uploadedAt: ISOString;
}
