export interface Notice {
  id: number;
  userId: string;
  date: string;
  title: string;
  description: string;
}

export type NoticeCreate = Omit<Notice, "id">;
