import { Controller, Get, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CdnService } from './cdn.service';
import { Public } from '@app/decorator/public.decorator';

@ApiTags('cdn')
@Controller('cdn')
export class CdnController {
  constructor(private readonly cdnService: CdnService) {}

  @Public()
  @Get('dom-client-side')
  @ApiOperation({ summary: 'Download dom-client-side as zip file' })
  @ApiResponse({
    status: 200,
    description: 'Zip file download',
    content: {
      'application/zip': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async getDomeClientSide(@Res() res: Response): Promise<void> {
    return this.cdnService.serveDomeClientSide(res);
  }
}
