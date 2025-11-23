import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCouponDto } from '../dtos/create-coupon.dto';
import { UpdateCouponDto } from '../dtos/update-coupon.dto';
import { BulkDeleteCouponsDto } from '../dtos/bulk-delete-coupons.dto';
import { FilterCouponsDto } from '../dtos/filter-coupons.dto';
import { CouponResponse } from '../types/coupon-response.type';

@Injectable()
export class CouponsService {
  private readonly logger = new Logger(CouponsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCouponDto): Promise<CouponResponse> {
    try {
      // Check if coupon with this code already exists
      const existingCoupon = await this.prisma.coupons.findUnique({
        where: { code: data.code },
      });

      if (existingCoupon) {
        throw new HttpException(
          'Coupon with this code already exists',
          HttpStatus.CONFLICT,
        );
      }

      const coupon = await this.prisma.coupons.create({
        data: {
          ...data,
          isActive: data.isActive ?? true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          _count: {
            select: {
              tickets: true,
            },
          },
        },
      });

      return coupon;
    } catch (error) {
      this.logger.error('Error creating coupon:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error creating coupon',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(
    filterParams: FilterCouponsDto,
  ): Promise<{ data: CouponResponse[]; total: number }> {
    try {
      const { offset = 0, limit = 10, search, isActive, couponId, showArchived } = filterParams;

      // Build the where clause based on filter parameters
        const where: any = {
        
      };

      if (!showArchived) {
        where.deletedAt = null;
      }else {
        where.deletedAt = { not: null };
      }

      if (search) {
        where.code = { contains: search, mode: 'insensitive' };
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (couponId) {
        where.id = couponId;
      }

      // Execute queries in parallel
      const [coupons, total] = await Promise.all([
        this.prisma.coupons.findMany({
          where,
          skip: offset,
          take: limit,
          include: {
            _count: {
              select: {
                tickets: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.coupons.count({ where }),
      ]);

      return {
        data: coupons,
        total,
      };
    } catch (error) {
      this.logger.error('Error fetching coupons:', error);
      throw new HttpException(
        'Error fetching coupons',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<CouponResponse> {
    try {
      const coupon = await this.prisma.coupons.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              tickets: true,
            },
          },
        },
      });

      if (!coupon) {
        throw new HttpException('Coupon not found', HttpStatus.NOT_FOUND);
      }

      return coupon;
    } catch (error) {
      this.logger.error(`Error fetching coupon with id ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error fetching coupon',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByCode(code: string): Promise<CouponResponse> {
    try {
      const coupon = await this.prisma.coupons.findUnique({
        where: { code },
        include: {
          _count: {
            select: {
              tickets: true,
            },
          },
        },
      });

      if (!coupon) {
        throw new HttpException('Coupon not found', HttpStatus.NOT_FOUND);
      }

      if (!coupon.isActive) {
        throw new HttpException('Coupon is not active', HttpStatus.BAD_REQUEST);
      }

      return coupon;
    } catch (error) {
      this.logger.error(`Error fetching coupon with code ${code}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error fetching coupon',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, data: UpdateCouponDto): Promise<CouponResponse> {
    try {
      // Check if coupon exists
      const existingCoupon = await this.prisma.coupons.findUnique({
        where: { id },
      });

      if (!existingCoupon) {
        throw new HttpException('Coupon not found', HttpStatus.NOT_FOUND);
      }

      // Check if another coupon with this code already exists (if code is being updated)
      if (data.code && data.code !== existingCoupon.code) {
        const codeConflict = await this.prisma.coupons.findUnique({
          where: { code: data.code },
        });

        if (codeConflict) {
          throw new HttpException(
            'Code already taken by another coupon',
            HttpStatus.CONFLICT,
          );
        }
      }

      const coupon = await this.prisma.coupons.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          _count: {
            select: {
              tickets: true,
            },
          },
        },
      });

      return coupon;
    } catch (error) {
      this.logger.error(`Error updating coupon with id ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error updating coupon',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const coupon = await this.prisma.coupons.findUnique({
        where: { id },
      });

      if (!coupon) {
        throw new HttpException('Coupon not found', HttpStatus.NOT_FOUND);
      }

      // Check if already deleted
      if (coupon.deletedAt) {
        throw new HttpException(
          'Coupon is already deleted',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Soft delete the coupon
      await this.prisma.coupons.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return { message: 'Coupon deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting coupon with id ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error deleting coupon',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async bulkDelete(
    bulkDeleteDto: BulkDeleteCouponsDto,
  ): Promise<{
    message: string;
    deletedCount: number;
    notFound: number[];
    alreadyDeleted: number[];
  }> {
    try {
      const { couponIds } = bulkDeleteDto;

      // Check which coupons exist
      const existingCoupons = await this.prisma.coupons.findMany({
        where: { id: { in: couponIds } },
        select: {
          id: true,
          deletedAt: true,
        },
      });

      const existingCouponIds = existingCoupons.map((coupon) => coupon.id);
      const notFoundIds = couponIds.filter((id) => !existingCouponIds.includes(id));

      // Filter out coupons that are already deleted
      const alreadyDeletedCoupons = existingCoupons.filter((coupon) => coupon.deletedAt !== null);
      const alreadyDeletedIds = alreadyDeletedCoupons.map((coupon) => coupon.id);

      const deletableIds = existingCouponIds.filter(
        (id) => !alreadyDeletedIds.includes(id),
      );

      // Soft delete coupons
      const deleteResult = await this.prisma.coupons.updateMany({
        where: { id: { in: deletableIds } },
        data: { deletedAt: new Date() },
      });

      return {
        message: `Bulk delete completed. ${deleteResult.count} coupons deleted.`,
        deletedCount: deleteResult.count,
        notFound: notFoundIds,
        alreadyDeleted: alreadyDeletedIds,
      };
    } catch (error) {
      this.logger.error('Error in bulk delete coupons:', error);
      throw new HttpException(
        'Error in bulk delete operation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async restore(id: number): Promise<{ message: string }> {
    try {
      const coupon = await this.prisma.coupons.findUnique({
        where: { id },
      });

      if (!coupon) {
        throw new HttpException('Coupon not found', HttpStatus.NOT_FOUND);
      }

      if (!coupon.deletedAt) {
        throw new HttpException(
          'Coupon is not deleted',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.prisma.coupons.update({
        where: { id },
        data: { deletedAt: null },
      });

      return { message: 'Coupon restored successfully' };
    } catch (error) {
      this.logger.error(`Error restoring coupon with id ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error restoring coupon',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async bulkRestore(
    couponIds: number[],
  ): Promise<{
    message: string;
    restoredCount: number;
    notFound: number[];
    notDeleted: number[];
  }> {
    try {
      const existingCoupons = await this.prisma.coupons.findMany({
        where: { id: { in: couponIds } },
        select: {
          id: true,
          deletedAt: true,
        },
      });

      const existingCouponIds = existingCoupons.map((coupon) => coupon.id);
      const notFoundIds = couponIds.filter((id) => !existingCouponIds.includes(id));

      const notDeletedCoupons = existingCoupons.filter((coupon) => coupon.deletedAt === null);
      const notDeletedIds = notDeletedCoupons.map((coupon) => coupon.id);

      const restorableIds = existingCouponIds.filter(
        (id) => !notDeletedIds.includes(id),
      );

      const restoreResult = await this.prisma.coupons.updateMany({
        where: { id: { in: restorableIds } },
        data: { deletedAt: null },
      });

      return {
        message: `Bulk restore completed. ${restoreResult.count} coupons restored successfully.`,
        restoredCount: restoreResult.count,
        notFound: notFoundIds,
        notDeleted: notDeletedIds,
      };
    } catch (error) {
      this.logger.error('Error bulk restoring coupons:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error bulk restoring coupons',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
