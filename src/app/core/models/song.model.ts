export interface Song {
  id?: number;
  categoryId: number;
  title: string;
  author?: string;
  originalKey: string;  // ex.: 'D', 'Em', 'G'
  capo: number;         // casa do capotraste (0 = sem)
  body: string;         // cifra em formato ChordPro: [D]Eis-me a[G]qui
  createdAt: number;
  updatedAt: number;
}
