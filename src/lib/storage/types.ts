export type SavedMedia = {
  type: "IMAGE" | "VIDEO";
  path: string;
  thumbnailPath: string | null;
  posterPath: string | null;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
};

export interface StorageProvider {
  savePackageMedia(input: { packageId: string; originalName: string; buffer: Buffer }): Promise<SavedMedia>;
  read(relativePath: string): Promise<Buffer>;
  delete(relativePath: string): Promise<void>;
}
