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
var AuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const public_decorator_1 = require("../decorator/public.decorator");
const core_1 = require("@nestjs/core");
let AuthGuard = AuthGuard_1 = class AuthGuard {
    constructor(jwtService, configService, reflector) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.reflector = reflector;
        this.logger = new common_1.Logger(AuthGuard_1.name);
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        try {
            const request = context.switchToHttp().getRequest();
            const token = this.extractTokenFromHeader(request);
            if (!token) {
                throw new common_1.UnauthorizedException();
            }
            const payload = await this.verifyAccessToken(token);
            if (!payload) {
                throw new common_1.UnauthorizedException('Invalid access token');
            }
            request['user'] = payload;
        }
        catch (error) {
            this.logger.error('Error occurred while verifying access token', error);
            throw new common_1.UnauthorizedException();
        }
        return true;
    }
    extractTokenFromHeader(request) {
        var _a, _b;
        const [type, token] = (_b = (_a = request.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')) !== null && _b !== void 0 ? _b : [];
        this.logger.debug(`Extracted token from header: ${token}`);
        return type === 'Bearer' ? token : undefined;
    }
    verifyAccessToken(token) {
        try {
            return this.jwtService.verifyAsync(token, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
            });
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid access token');
        }
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = AuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        core_1.Reflector])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map