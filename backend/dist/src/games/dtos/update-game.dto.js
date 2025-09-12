"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateGameDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_game_dto_1 = require("./create-game.dto");
class UpdateGameDto extends (0, swagger_1.PartialType)(create_game_dto_1.CreateGameDto) {
}
exports.UpdateGameDto = UpdateGameDto;
//# sourceMappingURL=update-game.dto.js.map