import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateCouponDto } from '../dtos/create-coupon.dto';
import { UpdateCouponDto } from '../dtos/update-coupon.dto';
import { BulkDeleteCouponsDto } from '../dtos/bulk-delete-coupons.dto';
import { FilterCouponsDto } from '../dtos/filter-coupons.dto';
import { Public } from 'src/decorator/public.decorator';
import { CouponsService } from '../services/coupons.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AdminRoleGuard } from '../../auth/guards/admin-role.guard';

@ApiTags('coupons')
@Controller({
  path: 'coupons',
  version: '1',
})
export class CouponsController {
  constructor(private couponsService: CouponsService) {}

  // === PUBLIC ENDPOINTS ===

  @Public()
  @Get('all')
  @ApiOperation({ summary: 'Get all coupons with filtering (Public)' })
  @ApiResponse({
    status: 200,
    description: 'List of coupons retrieved successfully',
  })
  getAllCoupons(@Query() filterParams: FilterCouponsDto) {
    return this.couponsService.findAll(filterParams);
  }

  @Public()
  @Get('code/:code')
  @ApiOperation({ summary: 'Get coupon by code (Public)' })
  @ApiResponse({ status: 200, description: 'Coupon retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  @ApiResponse({ status: 400, description: 'Coupon is not active' })
  getCouponByCode(@Param('code') code: string) {
    return this.couponsService.findByCode(code);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get coupon by ID (Public)' })
  @ApiResponse({ status: 200, description: 'Coupon retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  getCouponById(@Param('id', ParseIntPipe) id: number) {
    return this.couponsService.findOne(id);
  }

  // === ADMIN CRUD OPERATIONS ===

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Post('admin/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new coupon (Admin only)' })
  @ApiResponse({ status: 201, description: 'Coupon created successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 409, description: 'Coupon with code already exists' })
  createCoupon(@Body() createCouponDto: CreateCouponDto) {
    return this.couponsService.create(createCouponDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Get('admin/:id')
  @ApiOperation({ summary: 'Get coupon by ID with admin details (Admin only)' })
  @ApiResponse({ status: 200, description: 'Coupon retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  getCouponByIdAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.couponsService.findOne(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Put('admin/:id')
  @ApiOperation({ summary: 'Update coupon by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Coupon updated successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  @ApiResponse({
    status: 409,
    description: 'Code already taken by another coupon',
  })
  updateCoupon(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCouponDto: UpdateCouponDto,
  ) {
    return this.couponsService.update(id, updateCouponDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Delete('admin/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete coupons by IDs (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Coupons deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        deletedCount: { type: 'number' },
        notFound: { type: 'array', items: { type: 'number' } },
        hasRelatedRecords: { type: 'array', items: { type: 'number' } },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  bulkDeleteCoupons(@Body() bulkDeleteDto: BulkDeleteCouponsDto) {
    return this.couponsService.bulkDelete(bulkDeleteDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Delete('admin/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete coupon by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Coupon deleted successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete coupon with related records',
  })
  deleteCoupon(@Param('id', ParseIntPipe) id: number) {
    return this.couponsService.remove(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Get('admin/list/all')
  @ApiOperation({ summary: 'Get all coupons with admin privileges (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of coupons retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  getAllCouponsAdmin(@Query() filterParams: FilterCouponsDto) {
    return this.couponsService.findAll(filterParams);
  }
}
