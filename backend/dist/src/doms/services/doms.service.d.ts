import { PrismaService } from '../../prisma/prisma.service';
import { CreateDomDto } from '../dtos/create-dom.dto';
import { UpdateDomDto } from '../dtos/update-dom.dto';
import { BulkDeleteDomsDto } from '../dtos/bulk-delete-doms.dto';
import { FilterDomsDto } from '../dtos/filter-doms.dto';
import { DomResponse } from '../types/dom-response.type';
export declare class DomsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(data: CreateDomDto): Promise<DomResponse>;
    findAll(filterParams: FilterDomsDto): Promise<{
        data: DomResponse[];
        total: number;
    }>;
    findOne(id: number): Promise<DomResponse>;
    update(id: number, data: UpdateDomDto): Promise<DomResponse>;
    remove(id: number): Promise<{
        message: string;
    }>;
    bulkDelete(bulkDeleteDto: BulkDeleteDomsDto): Promise<{
        message: string;
        deletedCount: number;
        notFound: number[];
        alreadyDeleted: number[];
    }>;
    restore(id: number): Promise<{
        message: string;
    }>;
    bulkRestore(domIds: number[]): Promise<{
        message: string;
        restoredCount: number;
        notFound: number[];
        notDeleted: number[];
    }>;
}
