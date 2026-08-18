import { SyncService } from '../services/sync.service';
import { SyncRequestDto } from '../dtos/SyncRequest.dto';
import { SyncResponseDto } from '../dtos/sync-response.dto';
import { UploadDataDto } from '../dtos/upload-data.dto';
export declare class SyncController {
    private readonly syncService;
    constructor(syncService: SyncService);
    sync(syncRequest: SyncRequestDto): Promise<SyncResponseDto>;
    upload(uploadData: UploadDataDto): Promise<{
        success: boolean;
        message: string;
        data: {
            domId: number;
            experiencesProcessed: number;
            ticketsProcessed: number;
        };
    }>;
}
