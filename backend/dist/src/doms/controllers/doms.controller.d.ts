import { CreateDomDto } from '../dtos/create-dom.dto';
import { UpdateDomDto } from '../dtos/update-dom.dto';
import { BulkDeleteDomsDto } from '../dtos/bulk-delete-doms.dto';
import { FilterDomsDto } from '../dtos/filter-doms.dto';
import { DomsService } from '../services/doms.service';
export declare class DomsController {
    private domsService;
    constructor(domsService: DomsService);
    getAllDoms(filterParams: FilterDomsDto): Promise<{
        data: import("../types/dom-response.type").DomResponse[];
        total: number;
    }>;
    getDomById(id: number): Promise<import("../types/dom-response.type").DomResponse>;
    createDom(createDomDto: CreateDomDto): Promise<import("../types/dom-response.type").DomResponse>;
    getDomByIdAdmin(id: number): Promise<import("../types/dom-response.type").DomResponse>;
    updateDom(id: number, updateDomDto: UpdateDomDto): Promise<import("../types/dom-response.type").DomResponse>;
    bulkDeleteDoms(bulkDeleteDto: BulkDeleteDomsDto): Promise<{
        message: string;
        deletedCount: number;
        notFound: number[];
        hasRelatedRecords: number[];
    }>;
    deleteDom(id: number): Promise<{
        message: string;
    }>;
    getAllDomsAdmin(filterParams: FilterDomsDto): Promise<{
        data: import("../types/dom-response.type").DomResponse[];
        total: number;
    }>;
}
