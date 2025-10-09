export interface CouponResponse {
  id: number;
  code: string;
  discount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  _count?: {
    tickets: number;
  };
}
