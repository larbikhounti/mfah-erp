import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto } from '../dtos/create-comment.dto';
import { UpdateCommentDto } from '../dtos/update-comment.dto';
import { BulkDeleteCommentsDto } from '../dtos/bulk-delete-comments.dto';
import { FilterCommentsDto } from '../dtos/filter-comments.dto';
import { CommentResponse } from '../types/comment-response.type';

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
      const { offset = 0, limit = 10, search, startDate, endDate } = filterParams;

      // Build the where clause based on filter parameters
      const where: any = {};

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

      // Check if comment has related tickets
      if (comment._count && comment._count.ticketComments > 0) {
        throw new HttpException(
          'Cannot delete comment with related tickets',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.prisma.comments.delete({
        where: { id },
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
    hasRelatedRecords: number[];
  }> {
    try {
      const { commentIds } = bulkDeleteDto;
      let deletedCount = 0;
      const notFound: number[] = [];
      const hasRelatedRecords: number[] = [];

      for (const commentId of commentIds) {
        try {
          const comment = await this.prisma.comments.findUnique({
            where: { id: commentId },
            include: {
              _count: {
                select: {
                  ticketComments: true,
                },
              },
            },
          });

          if (!comment) {
            notFound.push(commentId);
            continue;
          }

          // Check if comment has related tickets
          if (comment._count && comment._count.ticketComments > 0) {
            hasRelatedRecords.push(commentId);
            continue;
          }

          await this.prisma.comments.delete({
            where: { id: commentId },
          });

          deletedCount++;
        } catch (error) {
          this.logger.error(`Error deleting comment ${commentId}:`, error);
          // Continue with next comment instead of failing the entire operation
        }
      }

      return {
        message: `Bulk delete completed. ${deletedCount} comments deleted.`,
        deletedCount,
        notFound,
        hasRelatedRecords,
      };
    } catch (error) {
      this.logger.error('Error in bulk delete comments:', error);
      throw new HttpException(
        'Error in bulk delete operation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
