export interface CommentResponse {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  _count?: {
    ticketComments: number;
  };
}
