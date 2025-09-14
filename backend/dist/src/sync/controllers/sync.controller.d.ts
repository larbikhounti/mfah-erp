import { SyncService } from '../services/sync.service';
import { SyncRequestDto } from '../dtos/SyncRequest.dto';
import { SyncResponseDto } from '../dtos/sync-response.dto';
export declare class SyncController {
    private readonly syncService;
    constructor(syncService: SyncService);
    sync(syncRequest: SyncRequestDto): Promise<SyncResponseDto>;
    getSyncHistory(domeId: number, limit?: number): Promise<{
        error: string | null;
        id: number;
        domeId: number;
        lastSyncAt: Date;
        syncedAt: Date;
        wasSuccess: boolean;
        dataCount: number | null;
    }[]>;
}
