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
exports.BvnVerificationResponseDto = exports.VerifyBvnDto = exports.ErrorResponseDto = exports.InterswitchPaymentDto = exports.PaymentDto = exports.UserDto = exports.AgreementDto = exports.CreateDocumentDto = exports.DocumentDto = exports.VoteMilestoneDto = exports.CreateMilestoneDto = exports.MilestoneDto = exports.ContributionDto = exports.OwnershipCertificateDto = exports.CertificateMemberSummaryDto = exports.CertificateMemberDto = exports.CertificatePoolDto = exports.PoolMemberDto = exports.PoolDashboardDto = exports.JoinPoolDto = exports.CreatePoolDto = exports.PoolDto = exports.CreatePropertyDto = exports.PropertyDto = void 0;
const tsoa_1 = require("tsoa");
const class_validator_1 = require("class-validator");
// Property DTOs
class PropertyDto {
}
exports.PropertyDto = PropertyDto;
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440000"),
    __metadata("design:type", String)
], PropertyDto.prototype, "id", void 0);
__decorate([
    (0, tsoa_1.Example)("3 Bedroom Luxury Apartment in Lekki"),
    __metadata("design:type", String)
], PropertyDto.prototype, "title", void 0);
__decorate([
    (0, tsoa_1.Example)("Lekki Phase 1, Lagos"),
    __metadata("design:type", String)
], PropertyDto.prototype, "location", void 0);
__decorate([
    (0, tsoa_1.Example)(15000000),
    __metadata("design:type", Number)
], PropertyDto.prototype, "price", void 0);
__decorate([
    (0, tsoa_1.Example)("apartment"),
    __metadata("design:type", String)
], PropertyDto.prototype, "type", void 0);
__decorate([
    (0, tsoa_1.Example)(["https://example.com/image1.jpg"]),
    __metadata("design:type", Array)
], PropertyDto.prototype, "images", void 0);
__decorate([
    (0, tsoa_1.Example)(["https://example.com/title-deed.pdf"]),
    __metadata("design:type", Array)
], PropertyDto.prototype, "documents", void 0);
__decorate([
    (0, tsoa_1.Example)(16500000),
    __metadata("design:type", Number)
], PropertyDto.prototype, "ai_valuation", void 0);
__decorate([
    (0, tsoa_1.Example)("available"),
    __metadata("design:type", String)
], PropertyDto.prototype, "status", void 0);
__decorate([
    (0, tsoa_1.Example)(new Date("2024-01-15T10:30:00Z")),
    __metadata("design:type", Date)
], PropertyDto.prototype, "created_at", void 0);
__decorate([
    (0, tsoa_1.Example)(new Date("2024-01-15T10:30:00Z")),
    __metadata("design:type", Date)
], PropertyDto.prototype, "updatedAt", void 0);
class CreatePropertyDto {
}
exports.CreatePropertyDto = CreatePropertyDto;
__decorate([
    (0, tsoa_1.Example)("3 Bedroom Luxury Apartment in Lekki"),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "title", void 0);
__decorate([
    (0, tsoa_1.Example)("Lekki Phase 1, Lagos"),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "location", void 0);
__decorate([
    (0, tsoa_1.Example)(15000000),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "price", void 0);
__decorate([
    (0, tsoa_1.Example)("apartment"),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "type", void 0);
__decorate([
    (0, tsoa_1.Example)(["https://example.com/image1.jpg"]),
    __metadata("design:type", Array)
], CreatePropertyDto.prototype, "images", void 0);
__decorate([
    (0, tsoa_1.Example)(["https://example.com/title-deed.pdf"]),
    __metadata("design:type", Array)
], CreatePropertyDto.prototype, "documents", void 0);
// Pool DTOs
class PoolDto {
}
exports.PoolDto = PoolDto;
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440000"),
    __metadata("design:type", String)
], PoolDto.prototype, "id", void 0);
__decorate([
    (0, tsoa_1.Example)("Lagos Luxury Apartment Co-Own"),
    __metadata("design:type", String)
], PoolDto.prototype, "name", void 0);
__decorate([
    (0, tsoa_1.Example)(5000000),
    __metadata("design:type", Number)
], PoolDto.prototype, "target_amount", void 0);
__decorate([
    (0, tsoa_1.Example)(3250000),
    __metadata("design:type", Number)
], PoolDto.prototype, "raised_amount", void 0);
__decorate([
    (0, tsoa_1.Example)(new Date("2024-12-31")),
    __metadata("design:type", Date)
], PoolDto.prototype, "deadline", void 0);
__decorate([
    (0, tsoa_1.Example)("active"),
    __metadata("design:type", String)
], PoolDto.prototype, "status", void 0);
__decorate([
    (0, tsoa_1.Example)(false),
    __metadata("design:type", Boolean)
], PoolDto.prototype, "is_public", void 0);
__decorate([
    (0, tsoa_1.Example)(15.5),
    __metadata("design:type", Number)
], PoolDto.prototype, "my_ownership_pct", void 0);
__decorate([
    (0, tsoa_1.Example)(new Date("2024-01-15T10:30:00Z")),
    __metadata("design:type", Date)
], PoolDto.prototype, "created_at", void 0);
__decorate([
    (0, tsoa_1.Example)(new Date("2024-01-15T10:30:00Z")),
    __metadata("design:type", Date)
], PoolDto.prototype, "updatedAt", void 0);
__decorate([
    (0, tsoa_1.Example)("https://coown.app/pools/550e8400-e29b-41d4-a716-446655440000/join"),
    __metadata("design:type", String)
], PoolDto.prototype, "invite_link", void 0);
class CreatePoolDto {
}
exports.CreatePoolDto = CreatePoolDto;
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440000"),
    __metadata("design:type", String)
], CreatePoolDto.prototype, "property_id", void 0);
__decorate([
    (0, tsoa_1.Example)("Lagos Luxury Apartment Co-Own"),
    __metadata("design:type", String)
], CreatePoolDto.prototype, "name", void 0);
__decorate([
    (0, tsoa_1.Example)(5000000),
    __metadata("design:type", Number)
], CreatePoolDto.prototype, "target_amount", void 0);
__decorate([
    (0, tsoa_1.Example)("2024-12-31"),
    __metadata("design:type", Date)
], CreatePoolDto.prototype, "deadline", void 0);
__decorate([
    (0, tsoa_1.Example)(false),
    __metadata("design:type", Boolean)
], CreatePoolDto.prototype, "is_public", void 0);
class JoinPoolDto {
}
exports.JoinPoolDto = JoinPoolDto;
__decorate([
    (0, tsoa_1.Example)(250000),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1, { message: "Investment amount must be at least 1" }),
    __metadata("design:type", Number)
], JoinPoolDto.prototype, "investment_amount", void 0);
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440000"),
    __metadata("design:type", String)
], JoinPoolDto.prototype, "user_id", void 0);
__decorate([
    (0, tsoa_1.Example)("NGN"),
    (0, class_validator_1.IsIn)(["NGN", "USD", "GBP", "EUR"], { message: "Currency must be one of: NGN, USD, GBP, EUR" }),
    __metadata("design:type", String)
], JoinPoolDto.prototype, "currency", void 0);
class PoolDashboardDto {
}
exports.PoolDashboardDto = PoolDashboardDto;
__decorate([
    (0, tsoa_1.Example)(65.5),
    __metadata("design:type", Number)
], PoolDashboardDto.prototype, "progress", void 0);
// Pool Member DTOs
class PoolMemberDto {
}
exports.PoolMemberDto = PoolMemberDto;
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440000"),
    __metadata("design:type", String)
], PoolMemberDto.prototype, "id", void 0);
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440001"),
    __metadata("design:type", String)
], PoolMemberDto.prototype, "pool_id", void 0);
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440002"),
    __metadata("design:type", String)
], PoolMemberDto.prototype, "user_id", void 0);
__decorate([
    (0, tsoa_1.Example)(100000),
    __metadata("design:type", Number)
], PoolMemberDto.prototype, "declared_amount", void 0);
__decorate([
    (0, tsoa_1.Example)(50000),
    __metadata("design:type", Number)
], PoolMemberDto.prototype, "paid_amount", void 0);
__decorate([
    (0, tsoa_1.Example)(10.0),
    __metadata("design:type", Number)
], PoolMemberDto.prototype, "ownership_pct", void 0);
__decorate([
    (0, tsoa_1.Example)(new Date("2024-01-15T10:30:00Z")),
    __metadata("design:type", Date)
], PoolMemberDto.prototype, "joined_at", void 0);
__decorate([
    (0, tsoa_1.Example)(new Date("2024-01-15T10:30:00Z")),
    __metadata("design:type", Date)
], PoolMemberDto.prototype, "updatedAt", void 0);
// Lean DTOs for Ownership Certificate Response
class CertificatePoolDto {
}
exports.CertificatePoolDto = CertificatePoolDto;
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440000"),
    __metadata("design:type", String)
], CertificatePoolDto.prototype, "id", void 0);
__decorate([
    (0, tsoa_1.Example)("Lagos Luxury Apartment Co-Own"),
    __metadata("design:type", String)
], CertificatePoolDto.prototype, "name", void 0);
__decorate([
    (0, tsoa_1.Example)(5000000),
    __metadata("design:type", Number)
], CertificatePoolDto.prototype, "target_amount", void 0);
__decorate([
    (0, tsoa_1.Example)(3250000),
    __metadata("design:type", Number)
], CertificatePoolDto.prototype, "raised_amount", void 0);
__decorate([
    (0, tsoa_1.Example)(new Date("2024-12-31")),
    __metadata("design:type", Date)
], CertificatePoolDto.prototype, "deadline", void 0);
class CertificateMemberDto {
}
exports.CertificateMemberDto = CertificateMemberDto;
__decorate([
    (0, tsoa_1.Example)("John Doe"),
    __metadata("design:type", String)
], CertificateMemberDto.prototype, "name", void 0);
__decorate([
    (0, tsoa_1.Example)("john.doe@example.com"),
    __metadata("design:type", String)
], CertificateMemberDto.prototype, "email", void 0);
__decorate([
    (0, tsoa_1.Example)(100000),
    __metadata("design:type", Number)
], CertificateMemberDto.prototype, "declared_amount", void 0);
__decorate([
    (0, tsoa_1.Example)(50000),
    __metadata("design:type", Number)
], CertificateMemberDto.prototype, "paid_amount", void 0);
__decorate([
    (0, tsoa_1.Example)(10.0),
    __metadata("design:type", Number)
], CertificateMemberDto.prototype, "ownership_pct", void 0);
class CertificateMemberSummaryDto {
}
exports.CertificateMemberSummaryDto = CertificateMemberSummaryDto;
__decorate([
    (0, tsoa_1.Example)("John Doe"),
    __metadata("design:type", String)
], CertificateMemberSummaryDto.prototype, "name", void 0);
__decorate([
    (0, tsoa_1.Example)("john.doe@example.com"),
    __metadata("design:type", String)
], CertificateMemberSummaryDto.prototype, "email", void 0);
__decorate([
    (0, tsoa_1.Example)(10.0),
    __metadata("design:type", Number)
], CertificateMemberSummaryDto.prototype, "ownership_pct", void 0);
class OwnershipCertificateDto {
}
exports.OwnershipCertificateDto = OwnershipCertificateDto;
__decorate([
    (0, tsoa_1.Example)(120),
    __metadata("design:type", Number)
], OwnershipCertificateDto.prototype, "daysRemaining", void 0);
__decorate([
    (0, tsoa_1.Example)(new Date("2024-01-15T12:00:00Z")),
    __metadata("design:type", Date)
], OwnershipCertificateDto.prototype, "generatedAt", void 0);
// Contribution DTOs
class ContributionDto {
}
exports.ContributionDto = ContributionDto;
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440000"),
    __metadata("design:type", String)
], ContributionDto.prototype, "id", void 0);
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440001"),
    __metadata("design:type", String)
], ContributionDto.prototype, "pool_id", void 0);
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440002"),
    __metadata("design:type", String)
], ContributionDto.prototype, "user_id", void 0);
__decorate([
    (0, tsoa_1.Example)(50000),
    __metadata("design:type", Number)
], ContributionDto.prototype, "amount", void 0);
__decorate([
    (0, tsoa_1.Example)("NGN"),
    __metadata("design:type", String)
], ContributionDto.prototype, "currency", void 0);
__decorate([
    (0, tsoa_1.Example)(8.5),
    __metadata("design:type", Number)
], ContributionDto.prototype, "ownership_pct", void 0);
__decorate([
    (0, tsoa_1.Example)(1.0),
    __metadata("design:type", Number)
], ContributionDto.prototype, "fx_rate", void 0);
__decorate([
    (0, tsoa_1.Example)("PAY_123456789"),
    __metadata("design:type", String)
], ContributionDto.prototype, "payment_ref", void 0);
__decorate([
    (0, tsoa_1.Example)(new Date("2024-01-15T10:30:00Z")),
    __metadata("design:type", Date)
], ContributionDto.prototype, "created_at", void 0);
__decorate([
    (0, tsoa_1.Example)(new Date("2024-01-15T10:30:00Z")),
    __metadata("design:type", Date)
], ContributionDto.prototype, "updatedAt", void 0);
// Milestone DTOs
class MilestoneDto {
}
exports.MilestoneDto = MilestoneDto;
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440000"),
    __metadata("design:type", String)
], MilestoneDto.prototype, "id", void 0);
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440001"),
    __metadata("design:type", String)
], MilestoneDto.prototype, "pool_id", void 0);
__decorate([
    (0, tsoa_1.Example)("Property Purchase Agreement"),
    __metadata("design:type", String)
], MilestoneDto.prototype, "title", void 0);
__decorate([
    (0, tsoa_1.Example)("Complete the property purchase agreement with the seller"),
    __metadata("design:type", String)
], MilestoneDto.prototype, "description", void 0);
__decorate([
    (0, tsoa_1.Example)(new Date("2024-02-15")),
    __metadata("design:type", Date)
], MilestoneDto.prototype, "target_date", void 0);
__decorate([
    (0, tsoa_1.Example)("pending"),
    __metadata("design:type", String)
], MilestoneDto.prototype, "status", void 0);
__decorate([
    (0, tsoa_1.Example)(3),
    __metadata("design:type", Number)
], MilestoneDto.prototype, "required_approvals", void 0);
__decorate([
    (0, tsoa_1.Example)(2),
    __metadata("design:type", Number)
], MilestoneDto.prototype, "current_approvals", void 0);
__decorate([
    (0, tsoa_1.Example)(new Date("2024-01-15T10:30:00Z")),
    __metadata("design:type", Date)
], MilestoneDto.prototype, "created_at", void 0);
__decorate([
    (0, tsoa_1.Example)(new Date("2024-01-15T10:30:00Z")),
    __metadata("design:type", Date)
], MilestoneDto.prototype, "updatedAt", void 0);
class CreateMilestoneDto {
}
exports.CreateMilestoneDto = CreateMilestoneDto;
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440001"),
    __metadata("design:type", String)
], CreateMilestoneDto.prototype, "pool_id", void 0);
__decorate([
    (0, tsoa_1.Example)("Property Purchase Agreement"),
    __metadata("design:type", String)
], CreateMilestoneDto.prototype, "title", void 0);
__decorate([
    (0, tsoa_1.Example)("Complete the property purchase agreement with the seller"),
    __metadata("design:type", String)
], CreateMilestoneDto.prototype, "description", void 0);
__decorate([
    (0, tsoa_1.Example)("2024-02-15"),
    __metadata("design:type", Date)
], CreateMilestoneDto.prototype, "target_date", void 0);
__decorate([
    (0, tsoa_1.Example)(3),
    __metadata("design:type", Number)
], CreateMilestoneDto.prototype, "required_approvals", void 0);
class VoteMilestoneDto {
}
exports.VoteMilestoneDto = VoteMilestoneDto;
__decorate([
    (0, tsoa_1.Example)(true),
    __metadata("design:type", Boolean)
], VoteMilestoneDto.prototype, "approve", void 0);
// Document DTOs
class DocumentDto {
}
exports.DocumentDto = DocumentDto;
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440000"),
    __metadata("design:type", String)
], DocumentDto.prototype, "id", void 0);
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440001"),
    __metadata("design:type", String)
], DocumentDto.prototype, "pool_id", void 0);
__decorate([
    (0, tsoa_1.Example)("title_deed"),
    __metadata("design:type", String)
], DocumentDto.prototype, "type", void 0);
__decorate([
    (0, tsoa_1.Example)("https://storage.example.com/documents/title-deed-123.pdf"),
    __metadata("design:type", String)
], DocumentDto.prototype, "url", void 0);
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440002"),
    __metadata("design:type", String)
], DocumentDto.prototype, "uploaded_by", void 0);
__decorate([
    (0, tsoa_1.Example)(new Date("2024-01-15T10:30:00Z")),
    __metadata("design:type", Date)
], DocumentDto.prototype, "created_at", void 0);
__decorate([
    (0, tsoa_1.Example)(new Date("2024-01-15T10:30:00Z")),
    __metadata("design:type", Date)
], DocumentDto.prototype, "updatedAt", void 0);
class CreateDocumentDto {
}
exports.CreateDocumentDto = CreateDocumentDto;
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440001"),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "pool_id", void 0);
__decorate([
    (0, tsoa_1.Example)("title_deed"),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "type", void 0);
__decorate([
    (0, tsoa_1.Example)("https://storage.example.com/documents/title-deed-123.pdf"),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "url", void 0);
// Agreement DTOs
class AgreementDto {
}
exports.AgreementDto = AgreementDto;
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440000"),
    __metadata("design:type", String)
], AgreementDto.prototype, "id", void 0);
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440001"),
    __metadata("design:type", String)
], AgreementDto.prototype, "pool_id", void 0);
__decorate([
    (0, tsoa_1.Example)("https://storage.example.com/agreements/pool-123-agreement.pdf"),
    __metadata("design:type", String)
], AgreementDto.prototype, "content_url", void 0);
__decorate([
    (0, tsoa_1.Example)(["550e8400-e29b-41d4-a716-446655440002", "550e8400-e29b-41d4-a716-446655440003"]),
    __metadata("design:type", Array)
], AgreementDto.prototype, "signed_by", void 0);
__decorate([
    (0, tsoa_1.Example)(new Date("2024-01-15T10:30:00Z")),
    __metadata("design:type", Date)
], AgreementDto.prototype, "created_at", void 0);
__decorate([
    (0, tsoa_1.Example)(new Date("2024-01-15T10:30:00Z")),
    __metadata("design:type", Date)
], AgreementDto.prototype, "updatedAt", void 0);
// User DTOs
class UserDto {
}
exports.UserDto = UserDto;
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440000"),
    __metadata("design:type", String)
], UserDto.prototype, "id", void 0);
__decorate([
    (0, tsoa_1.Example)("John"),
    __metadata("design:type", String)
], UserDto.prototype, "firstName", void 0);
__decorate([
    (0, tsoa_1.Example)("Doe"),
    __metadata("design:type", String)
], UserDto.prototype, "lastName", void 0);
__decorate([
    (0, tsoa_1.Example)("john.doe@example.com"),
    __metadata("design:type", String)
], UserDto.prototype, "email", void 0);
__decorate([
    (0, tsoa_1.Example)("+2348012345678"),
    __metadata("design:type", String)
], UserDto.prototype, "phone", void 0);
__decorate([
    (0, tsoa_1.Example)("user"),
    __metadata("design:type", String)
], UserDto.prototype, "role", void 0);
__decorate([
    (0, tsoa_1.Example)(true),
    __metadata("design:type", Boolean)
], UserDto.prototype, "verified", void 0);
__decorate([
    (0, tsoa_1.Example)(true),
    __metadata("design:type", Boolean)
], UserDto.prototype, "isActive", void 0);
__decorate([
    (0, tsoa_1.Example)(new Date("2024-01-15T10:30:00Z")),
    __metadata("design:type", Date)
], UserDto.prototype, "created_at", void 0);
__decorate([
    (0, tsoa_1.Example)(new Date("2024-01-15T10:30:00Z")),
    __metadata("design:type", Date)
], UserDto.prototype, "updatedAt", void 0);
// Payment DTO
class PaymentDto {
}
exports.PaymentDto = PaymentDto;
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440000"),
    __metadata("design:type", String)
], PaymentDto.prototype, "pool_id", void 0);
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440002"),
    __metadata("design:type", String)
], PaymentDto.prototype, "user_id", void 0);
__decorate([
    (0, tsoa_1.Example)(50000),
    __metadata("design:type", Number)
], PaymentDto.prototype, "amount", void 0);
__decorate([
    (0, tsoa_1.Example)("USD"),
    __metadata("design:type", String)
], PaymentDto.prototype, "currency", void 0);
__decorate([
    (0, tsoa_1.Example)("card"),
    __metadata("design:type", String)
], PaymentDto.prototype, "paymentMethod", void 0);
class InterswitchPaymentDto {
}
exports.InterswitchPaymentDto = InterswitchPaymentDto;
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440000"),
    __metadata("design:type", String)
], InterswitchPaymentDto.prototype, "pool_id", void 0);
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440002"),
    __metadata("design:type", String)
], InterswitchPaymentDto.prototype, "user_id", void 0);
__decorate([
    (0, tsoa_1.Example)("MX275869"),
    __metadata("design:type", String)
], InterswitchPaymentDto.prototype, "merchant_code", void 0);
__decorate([
    (0, tsoa_1.Example)(10000),
    __metadata("design:type", Number)
], InterswitchPaymentDto.prototype, "amount", void 0);
__decorate([
    (0, tsoa_1.Example)("NGN"),
    __metadata("design:type", String)
], InterswitchPaymentDto.prototype, "currency", void 0);
__decorate([
    (0, tsoa_1.Example)("FBN|WEB|MX275869|..."),
    __metadata("design:type", String)
], InterswitchPaymentDto.prototype, "payment_ref", void 0);
// Error Response DTO
class ErrorResponseDto {
}
exports.ErrorResponseDto = ErrorResponseDto;
__decorate([
    (0, tsoa_1.Example)("Invalid request parameters"),
    __metadata("design:type", String)
], ErrorResponseDto.prototype, "message", void 0);
__decorate([
    (0, tsoa_1.Example)(400),
    __metadata("design:type", Number)
], ErrorResponseDto.prototype, "statusCode", void 0);
__decorate([
    (0, tsoa_1.Example)("ValidationError"),
    __metadata("design:type", String)
], ErrorResponseDto.prototype, "name", void 0);
// BVN Verification DTOs
class VerifyBvnDto {
}
exports.VerifyBvnDto = VerifyBvnDto;
__decorate([
    (0, tsoa_1.Example)("12345678901"),
    __metadata("design:type", String)
], VerifyBvnDto.prototype, "bvn", void 0);
class BvnVerificationResponseDto {
}
exports.BvnVerificationResponseDto = BvnVerificationResponseDto;
__decorate([
    (0, tsoa_1.Example)("550e8400-e29b-41d4-a716-446655440000"),
    __metadata("design:type", String)
], BvnVerificationResponseDto.prototype, "userId", void 0);
__decorate([
    (0, tsoa_1.Example)("John"),
    __metadata("design:type", String)
], BvnVerificationResponseDto.prototype, "firstName", void 0);
__decorate([
    (0, tsoa_1.Example)("Doe"),
    __metadata("design:type", String)
], BvnVerificationResponseDto.prototype, "lastName", void 0);
__decorate([
    (0, tsoa_1.Example)("Michael"),
    __metadata("design:type", String)
], BvnVerificationResponseDto.prototype, "middleName", void 0);
__decorate([
    (0, tsoa_1.Example)("1990-01-15"),
    __metadata("design:type", String)
], BvnVerificationResponseDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, tsoa_1.Example)("+2348012345678"),
    __metadata("design:type", String)
], BvnVerificationResponseDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, tsoa_1.Example)("12345678901"),
    __metadata("design:type", String)
], BvnVerificationResponseDto.prototype, "nin", void 0);
__decorate([
    (0, tsoa_1.Example)(true),
    __metadata("design:type", Boolean)
], BvnVerificationResponseDto.prototype, "verified", void 0);
__decorate([
    (0, tsoa_1.Example)(new Date("2026-03-25T22:36:21.732Z")),
    __metadata("design:type", Date)
], BvnVerificationResponseDto.prototype, "verifiedAt", void 0);
__decorate([
    (0, tsoa_1.Example)("BVN verified successfully"),
    __metadata("design:type", String)
], BvnVerificationResponseDto.prototype, "message", void 0);
//# sourceMappingURL=index.js.map