import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { CdnService } from './cdn.service';
import { Public } from '@app/decorator/public.decorator';

@Controller('cdn')
export class CdnController {
  constructor(private readonly cdnService: CdnService) {}

  @Public()
  @Get('dome-client-side')
  async getDomeClientSide(@Res() res: Response): Promise<void> {
    return this.cdnService.serveDomeClientSide(res);
  }
}
