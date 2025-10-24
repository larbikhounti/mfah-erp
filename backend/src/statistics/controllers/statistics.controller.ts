import { Controller, Get, Param, Query, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { StatisticsService } from '../services/statistics.service';
import { StatisticsResponse } from '../types/statistics-response.type';

@ApiTags('statistics')
@Controller({
  path: 'statistics',
  version: '1',
})
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @Get('dom/:domId')
  @ApiOperation({
    summary: 'Get statistics for a specific DOM or all DOMs',
    description:
      'Returns statistics including experiences, tickets, and revenue data. Use "all" for aggregated statistics across all DOMs. Optionally filter by date range.',
  })
  @ApiParam({
    name: 'domId',
    description: 'DOM ID (number) or "all" for all DOMs',
    example: '1',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date for filtering (ISO 8601 format)',
    required: false,
    example: '2024-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date for filtering (ISO 8601 format)',
    required: false,
    example: '2024-12-31T23:59:59.999Z',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid DOM ID or date format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'DOM not found',
  })
  async getStatisticsByDom(
    @Param('domId') domId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<StatisticsResponse> {
    try {
      const statistics = await this.statisticsService.getStatisticsByDom(
        domId,
        startDate,
        endDate,
      );

      return {
        success: true,
        data: statistics,
      };
    } catch (error) {
      throw error;
    }
  }
}
