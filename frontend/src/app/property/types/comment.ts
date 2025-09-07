export interface Comment {
  id: number;
  userId: string;
  description: string;
  date: string;
  propertyId: number;
}

export type CommentCreate = Omit<Comment, 'id' | 'date'>;
