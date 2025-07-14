export interface Comment {
  id: number;
  description: string;
  date: string;
  propertyId: number;
}

export type CommentCreate = Omit<Comment, 'id' | 'date'>;
