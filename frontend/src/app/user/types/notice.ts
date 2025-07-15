export interface Notice {
  id: number;
  userId: string;
  date: string;
  title: string;
  description: string;
  mainImage: string | File | null;
}

export type NoticeCreate = {
  userId: string;
  title: string;
  description: string;
  mainImage: File;
};