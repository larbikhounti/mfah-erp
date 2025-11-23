export interface GameTypeResponse {
  id: number;
  name: string;
  gamesCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}
