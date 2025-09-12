import { FilterExperiencesDto } from '../dtos/filter-experiences.dto';
import { ExperiencesService } from '../services/experiences.service';
export declare class ExperiencesController {
    private experiencesService;
    constructor(experiencesService: ExperiencesService);
    getAllExperiences(filterParams: FilterExperiencesDto): Promise<{
        data: import("../types/experience-response.type").ExperienceResponse[];
        total: number;
    }>;
    getExperienceById(id: number): Promise<import("../types/experience-response.type").ExperienceResponse>;
}
