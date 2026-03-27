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
exports.ConfigController = void 0;
const typedi_1 = require("typedi");
const tsoa_1 = require("tsoa");
const env_1 = require("../config/env");
let ConfigController = class ConfigController extends tsoa_1.Controller {
    /**
     * Get payment configuration for Interswitch payment gateway
     */
    async getPaymentConfig() {
        return {
            merchantCode: env_1.variables.interswitch.merchantCode || "MX275869",
            payItemId: `Default_Payable_${env_1.variables.interswitch.merchantCode || "MX275869"}`,
            currencyCode: 566, // NGN
            environment: process.env.NODE_ENV || "development"
        };
    }
};
exports.ConfigController = ConfigController;
__decorate([
    (0, tsoa_1.Get)("/payment"),
    (0, tsoa_1.Response)(200, "Payment configuration retrieved successfully"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getPaymentConfig", null);
exports.ConfigController = ConfigController = __decorate([
    (0, typedi_1.Service)(),
    (0, tsoa_1.Route)("config"),
    (0, tsoa_1.Tags)("Configuration")
], ConfigController);
//# sourceMappingURL=config.js.map