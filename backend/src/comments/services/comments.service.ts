import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto } from '../dtos/create-comment.dto';
import { UpdateCommentDto } from '../dtos/update-comment.dto';
import { BulkDeleteCommentsDto } from '../dtos/bulk-delete-comments.dto';
import { FilterCommentsDto } from '../dtos/filter-comments.dto';
import { CommentResponse } from '../types/comment-response.type';
import e from 'express';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCommentDto): Promise<CommentResponse> {
    try {
      const comment = await this.prisma.comments.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          _count: {
            select: {
              ticketComments: true,
            },
          },
        },
      });

      return comment;
    } catch (error) {
      this.logger.error('Error creating comment:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error creating comment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(
    filterParams: FilterCommentsDto,
  ): Promise<{ data: CommentResponse[]; total: number }> {
    try {
      const { offset = 0, limit = 10, search, startDate, endDate, showArchived } = filterParams;

      // Build the where clause based on filter parameters
      const where: any = {
        
      };

      if (!showArchived) {
        where.deletedAt = null;
      }else {
        where.deletedAt = { not: null };
      }

      // Search in content
      if (search) {
        where.content = { contains: search, mode: 'insensitive' };
      }

      // Date range filtering
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      // Execute queries in parallel
      const [comments, total] = await Promise.all([
        this.prisma.comments.findMany({
          where,
          skip: offset,
          take: limit,
          include: {
            _count: {
              select: {
                ticketComments: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.comments.count({ where }),
      ]);

      return {
        data: comments,
        total,
      };
    } catch (error) {
      this.logger.error('Error fetching comments:', error);
      throw new HttpException(
        'Error fetching comments',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<CommentResponse> {
    try {
      const comment = await this.prisma.comments.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              ticketComments: true,
            },
          },
        },
      });

      if (!comment) {
        throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
      }

      return comment;
    } catch (error) {
      this.logger.error(`Error fetching comment with id ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error fetching comment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, data: UpdateCommentDto): Promise<CommentResponse> {
    try {
      // Check if comment exists
      const existingComment = await this.prisma.comments.findUnique({
        where: { id },
      });

      if (!existingComment) {
        throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
      }

      const comment = await this.prisma.comments.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          _count: {
            select: {
              ticketComments: true,
            },
          },
        },
      });

      return comment;
    } catch (error) {
      this.logger.error(`Error updating comment with id ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error updating comment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const comment = await this.prisma.comments.findUnique({
        where: { id },
      });

      if (!comment) {
        throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
      }

      // Check if already deleted
      if (comment.deletedAt) {
        throw new HttpException(
          'Comment is already deleted',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Soft delete the comment
      await this.prisma.comments.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return { message: 'Comment deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting comment with id ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error deleting comment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async bulkDelete(
    bulkDeleteDto: BulkDeleteCommentsDto,
  ): Promise<{
    message: string;
    deletedCount: number;
    notFound: number[];
    alreadyDeleted: number[];
  }> {
    try {
      const { commentIds } = bulkDeleteDto;

      // Check which comments exist
      const existingComments = await this.prisma.comments.findMany({
        where: { id: { in: commentIds } },
        select: {
          id: true,
          deletedAt: true,
        },
      });

      const existingCommentIds = existingComments.map((comment) => comment.id);
      const notFoundIds = commentIds.filter((id) => !existingCommentIds.includes(id));

      // Filter out comments that are already deleted
      const alreadyDeletedComments = existingComments.filter((comment) => comment.deletedAt !== null);
      const alreadyDeletedIds = alreadyDeletedComments.map((comment) => comment.id);

      const deletableIds = existingCommentIds.filter(
        (id) => !alreadyDeletedIds.includes(id),
      );

      // Soft delete comments
      const deleteResult = await this.prisma.comments.updateMany({
        where: { id: { in: deletableIds } },
        data: { deletedAt: new Date() },
      });

      return {
        message: `Bulk delete completed. ${deleteResult.count} comments deleted.`,
        deletedCount: deleteResult.count,
        notFound: notFoundIds,
        alreadyDeleted: alreadyDeletedIds,
      };
    } catch (error) {
      this.logger.error('Error in bulk delete comments:', error);
      throw new HttpException(
        'Error in bulk delete operation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async restore(id: number): Promise<{ message: string }> {
    try {
      const comment = await this.prisma.comments.findUnique({
        where: { id },
      });

      if (!comment) {
        throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
      }

      if (!comment.deletedAt) {
        throw new HttpException(
          'Comment is not deleted',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.prisma.comments.update({
        where: { id },
        data: { deletedAt: null },
      });

      return { message: 'Comment restored successfully' };
    } catch (error) {
      this.logger.error(`Error restoring comment with id ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error restoring comment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async bulkRestore(
    commentIds: number[],
  ): Promise<{
    message: string;
    restoredCount: number;
    notFound: number[];
    notDeleted: number[];
  }> {
    try {
      const existingComments = await this.prisma.comments.findMany({
        where: { id: { in: commentIds } },
        select: {
          id: true,
          deletedAt: true,
        },
      });

      const existingCommentIds = existingComments.map((comment) => comment.id);
      const notFoundIds = commentIds.filter((id) => !existingCommentIds.includes(id));

      const notDeletedComments = existingComments.filter((comment) => comment.deletedAt === null);
      const notDeletedIds = notDeletedComments.map((comment) => comment.id);

      const restorableIds = existingCommentIds.filter(
        (id) => !notDeletedIds.includes(id),
      );

      const restoreResult = await this.prisma.comments.updateMany({
        where: { id: { in: restorableIds } },
        data: { deletedAt: null },
      });

      return {
        message: `Bulk restore completed. ${restoreResult.count} comments restored successfully.`,
        restoredCount: restoreResult.count,
        notFound: notFoundIds,
        notDeleted: notDeletedIds,
      };
    } catch (error) {
      this.logger.error('Error bulk restoring comments:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error bulk restoring comments',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
