"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperiencesController = void 0;
const common_1 = require("@nestjs/common");
const filter_experiences_dto_1 = require("../dtos/filter-experiences.dto");
const public_decorator_1 = require("../../decorator/public.decorator");
const experiences_service_1 = require("../services/experiences.service");
const swagger_1 = require("@nestjs/swagger");
let ExperiencesController = class ExperiencesController {
    constructor(experiencesService) {
        this.experiencesService = experiencesService;
    }
    getAllExperiences(filterParams) {
        return this.experiencesService.findAll(filterParams);
    }
    getExperienceById(id) {
        return this.experiencesService.getExperienceById(id);
    }
};
exports.ExperiencesController = ExperiencesController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all experiences with filtering (Public)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of experiences retrieved successfully',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_experiences_dto_1.FilterExperiencesDto]),
    __metadata("design:returntype", void 0)
], ExperiencesController.prototype, "getAllExperiences", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get experience by ID (Public)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Experience retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Experience not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ExperiencesController.prototype, "getExperienceById", null);
exports.ExperiencesController = ExperiencesController = __decorate([
    (0, swagger_1.ApiTags)('experiences'),
    (0, common_1.Controller)({
        path: 'experiences',
        version: '1',
    }),
    __metadata("design:paramtypes", [experiences_service_1.ExperiencesService])
], ExperiencesController);
//# sourceMappingURL=experiences.controller.js.map