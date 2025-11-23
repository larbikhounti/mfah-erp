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
  Patch,
} from '@nestjs/common';
import { CreateCommentDto } from '../dtos/create-comment.dto';
import { UpdateCommentDto } from '../dtos/update-comment.dto';
import { BulkDeleteCommentsDto } from '../dtos/bulk-delete-comments.dto';
import { FilterCommentsDto } from '../dtos/filter-comments.dto';
import { CommentsService } from '../services/comments.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AdminRoleGuard } from '../../auth/guards/admin-role.guard';

@ApiTags('comments')
@Controller({
  path: 'comments',
  version: '1',
})
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  // === ADMIN CRUD OPERATIONS ===

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Post('admin/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new comment (Admin only)' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  createComment(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Get('admin/list/all')
  @ApiOperation({ summary: 'Get all comments with filtering (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of comments retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  getAllCommentsAdmin(@Query() filterParams: FilterCommentsDto) {
    return this.commentsService.findAll(filterParams);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Get('admin/:id')
  @ApiOperation({ summary: 'Get comment by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Comment retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  getCommentByIdAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.findOne(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Put('admin/:id')
  @ApiOperation({ summary: 'Update comment by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  updateComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Delete('admin/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete comment by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete comment with related tickets',
  })
  deleteComment(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.remove(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Delete('admin/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete comments by IDs (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Comments deleted successfully',
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
  bulkDeleteComments(@Body() bulkDeleteDto: BulkDeleteCommentsDto) {
    return this.commentsService.bulkDelete(bulkDeleteDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Patch('admin/:id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore deleted comment (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Comment restored successfully',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  restoreComment(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.restore(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Post('admin/bulk-restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore multiple comments (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Bulk restore completed',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  bulkRestoreComments(@Body() body: { commentIds: number[] }) {
    return this.commentsService.bulkRestore(body.commentIds);
  }
}
