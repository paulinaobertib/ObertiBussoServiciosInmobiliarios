export interface Comment {
  id: number;
  description: string;
  propertyId: number;
}

export type CommentCreate = Omit<Comment, "id">;
