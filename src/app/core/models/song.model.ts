export interface Song {
  id?: string;
  categoryId: string;
  title: string;
  author?: string;
  originalKey: string;
  capo: number;
  body: string;
  videoUrl?: string;
  createdAt: number;
  updatedAt: number;
}
