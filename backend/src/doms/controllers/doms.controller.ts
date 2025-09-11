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
import { CreateDomDto } from '../dtos/create-dom.dto';
import { UpdateDomDto } from '../dtos/update-dom.dto';
import { BulkDeleteDomsDto } from '../dtos/bulk-delete-doms.dto';
import { FilterDomsDto } from '../dtos/filter-doms.dto';
import { Public } from 'src/decorator/public.decorator';
import { DomsService } from '../services/doms.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AdminRoleGuard } from '../../auth/guards/admin-role.guard';

@ApiTags('doms')
@Controller('doms')
export class DomsController {
  constructor(private domsService: DomsService) {}

  // === PUBLIC ENDPOINTS ===

  @Public()
  @Get('all')
  @ApiOperation({ summary: 'Get all DOMs with filtering (Public)' })
  @ApiResponse({
    status: 200,
    description: 'List of DOMs retrieved successfully',
  })
  getAllDoms(@Query() filterParams: FilterDomsDto) {
    return this.domsService.findAll(filterParams);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get DOM by ID (Public)' })
  @ApiResponse({ status: 200, description: 'DOM retrieved successfully' })
  @ApiResponse({ status: 404, description: 'DOM not found' })
  getDomById(@Param('id', ParseIntPipe) id: number) {
    return this.domsService.findOne(id);
  }

  // === ADMIN CRUD OPERATIONS ===

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Post('admin/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new DOM (Admin only)' })
  @ApiResponse({ status: 201, description: 'DOM created successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 409, description: 'DOM with name already exists' })
  createDom(@Body() createDomDto: CreateDomDto) {
    return this.domsService.create(createDomDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Get('admin/:id')
  @ApiOperation({ summary: 'Get DOM by ID with admin details (Admin only)' })
  @ApiResponse({ status: 200, description: 'DOM retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'DOM not found' })
  getDomByIdAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.domsService.findOne(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Put('admin/:id')
  @ApiOperation({ summary: 'Update DOM by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'DOM updated successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'DOM not found' })
  @ApiResponse({
    status: 409,
    description: 'Name already taken by another DOM',
  })
  updateDom(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDomDto: UpdateDomDto,
  ) {
    return this.domsService.update(id, updateDomDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Delete('admin/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete DOM by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'DOM deleted successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'DOM not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete DOM with related records',
  })
  deleteDom(@Param('id', ParseIntPipe) id: number) {
    return this.domsService.remove(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Delete('admin/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete DOMs by IDs (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'DOMs deleted successfully',
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
  bulkDeleteDoms(@Body() bulkDeleteDto: BulkDeleteDomsDto) {
    return this.domsService.bulkDelete(bulkDeleteDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Get('admin/list/all')
  @ApiOperation({ summary: 'Get all DOMs with admin privileges (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of DOMs retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  getAllDomsAdmin(@Query() filterParams: FilterDomsDto) {
    return this.domsService.findAll(filterParams);
  }
}
