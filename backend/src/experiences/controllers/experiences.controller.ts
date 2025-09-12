import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { FilterExperiencesDto } from '../dtos/filter-experiences.dto';
import { Public } from 'src/decorator/public.decorator';
import { ExperiencesService } from '../services/experiences.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('experiences')
@Controller({
  path: 'experiences',
  version: '1',
})
export class ExperiencesController {
  constructor(private experiencesService: ExperiencesService) {}

  // === PUBLIC ENDPOINTS ===

  @Public()
  @Get('all')
  @ApiOperation({ summary: 'Get all experiences with filtering (Public)' })
  @ApiResponse({
    status: 200,
    description: 'List of experiences retrieved successfully',
  })
  getAllExperiences(@Query() filterParams: FilterExperiencesDto) {
    return this.experiencesService.findAll(filterParams);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get experience by ID (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Experience retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Experience not found' })
  getExperienceById(@Param('id', ParseIntPipe) id: number) {
    return this.experiencesService.getExperienceById(id);
  }
}
