import { PrismaService } from 'src/prisma/prisma.service';
import { FilterExperiencesDto } from '../dtos/filter-experiences.dto';
import { ExperienceResponse } from '../types/experience-response.type';
export declare class ExperiencesService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(filterParams: FilterExperiencesDto): Promise<{
        data: ExperienceResponse[];
        total: number;
    }>;
    getExperienceById(id: number): Promise<ExperienceResponse>;
}
