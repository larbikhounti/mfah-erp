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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterGamesDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class FilterGamesDto {
}
exports.FilterGamesDto = FilterGamesDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by game name (partial match)',
        example: 'Virtual',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterGamesDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by game type ID',
        example: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], FilterGamesDto.prototype, "gameTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by machine type ID',
        example: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], FilterGamesDto.prototype, "machineTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by minimum price',
        example: 10.0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FilterGamesDto.prototype, "minPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by maximum price',
        example: 50.0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FilterGamesDto.prototype, "maxPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by minimum play time (minutes)',
        example: 15,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], FilterGamesDto.prototype, "minPlayTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by maximum play time (minutes)',
        example: 60,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], FilterGamesDto.prototype, "maxPlayTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Page number for pagination',
        example: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], FilterGamesDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of items per page',
        example: 10,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], FilterGamesDto.prototype, "limit", void 0);
//# sourceMappingURL=filter-games.dto.js.map