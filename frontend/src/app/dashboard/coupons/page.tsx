"use client";

import { useEffect } from "react";
import { useCouponsStore } from "@/stores/coupons-store";
import { EnhancedCouponTable } from "@/components/coupon/enhanced-coupon-table";

export default function CouponsPage() {
  const { fetchCoupons } = useCouponsStore();

  // Fetch coupons on component mount
  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Coupons Management</h1>
          <p className="text-muted-foreground">
            Manage discount coupons and promotional codes for tickets and experiences
          </p>
        </div>
      </div>

      <EnhancedCouponTable />
    </section>
  );
}
