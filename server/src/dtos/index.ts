import { Example } from "tsoa";
import { IsNumber, Min, IsIn } from "class-validator";

// Property DTOs
export class PropertyDto {
    /** Unique identifier for the property */
    @Example("550e8400-e29b-41d4-a716-446655440000")
    id!: string;

    /** Property title */
    @Example("3 Bedroom Luxury Apartment in Lekki")
    title!: string;

    /** Property location */
    @Example("Lekki Phase 1, Lagos")
    location!: string;

    /** Property price in Naira */
    @Example(15000000)
    price!: number;

    /** Property type */
    @Example("apartment")
    type!: string;

    /** Array of property image URLs */
    @Example(["https://example.com/image1.jpg"])
    images?: string[];

    /** Array of property document URLs */
    @Example(["https://example.com/title-deed.pdf"])
    documents?: string[];

    /** AI-calculated property valuation */
    @Example(16500000)
    ai_valuation?: number;

    /** Property status */
    @Example("available")
    status!: string;

    /** Property creation timestamp */
    @Example(new Date("2024-01-15T10:30:00Z"))
    created_at?: Date;

    /** Property last update timestamp */
    @Example(new Date("2024-01-15T10:30:00Z"))
    updatedAt?: Date;
}

export class CreatePropertyDto {
    /** Property title */
    @Example("3 Bedroom Luxury Apartment in Lekki")
    title!: string;

    /** Property location */
    @Example("Lekki Phase 1, Lagos")
    location!: string;

    /** Property price in Naira */
    @Example(15000000)
    price!: number;

    /** Property type */
    @Example("apartment")
    type!: "apartment" | "house" | "land" | "commercial";

    /** Array of property image URLs */
    @Example(["https://example.com/image1.jpg"])
    images?: string[];

    /** Array of property document URLs */
    @Example(["https://example.com/title-deed.pdf"])
    documents?: string[];
}

// Pool DTOs
export class PoolDto {
    /** Unique identifier for the pool */
    @Example("550e8400-e29b-41d4-a716-446655440000")
    id!: string;

    /** Property details */
    property!: PropertyDto;

    /** Pool creator details */
    creator!: UserDto;

    /** Pool name */
    @Example("Lagos Luxury Apartment Co-Own")
    name!: string;

    /** Target amount to raise */
    @Example(5000000)
    target_amount!: number;

    /** Amount raised so far */
    @Example(3250000)
    raised_amount!: number;

    /** Fundraising deadline */
    @Example(new Date("2024-12-31"))
    deadline?: Date;

    /** Pool status */
    @Example("active")
    status!: string;

    /** Whether the pool is publicly visible */
    @Example(false)
    is_public!: boolean;

    /** Pool creation timestamp */
    @Example(new Date("2024-01-15T10:30:00Z"))
    created_at?: Date;

    /** Pool last update timestamp */
    @Example(new Date("2024-01-15T10:30:00Z"))
    updatedAt?: Date;

    /** Invite link for pool membership */
    @Example("https://coown.app/pools/550e8400-e29b-41d4-a716-446655440000/join")
    invite_link?: string;
}

export class CreatePoolDto {
    /** ID of the property to create pool for */
    @Example("550e8400-e29b-41d4-a716-446655440000")
    property_id!: string;

    /** Name of the co-ownership pool */
    @Example("Lagos Luxury Apartment Co-Own")
    name!: string;

    /** Target amount to raise for the property */
    @Example(5000000)
    target_amount!: number;

    /** Deadline for raising funds (optional) */
    @Example("2024-12-31")
    deadline?: Date;

    /** Whether the pool is publicly visible */
    @Example(false)
    is_public?: boolean;
}

export class JoinPoolDto {
    /** The amount the user wants to invest/contribute to the pool */
    @Example(250000)
    @IsNumber()
    @Min(1, { message: "Investment amount must be at least 1" })
    investment_amount!: number;

    @Example("550e8400-e29b-41d4-a716-446655440000")
    user_id!: string;

    /** The currency for the investment */
    @Example("NGN")
    @IsIn(["NGN", "USD", "GBP", "EUR"], { message: "Currency must be one of: NGN, USD, GBP, EUR" })
    currency!: "NGN" | "USD" | "GBP" | "EUR";
}

export class PoolDashboardDto {
    /** Pool details */
    pool!: PoolDto;

    /** List of pool members */
    members!: PoolMemberDto[];

    /** List of contributions */
    contributions!: ContributionDto[];

    /** Progress percentage (0-100) */
    @Example(65.5)
    progress!: number;
}

// Pool Member DTOs
export class PoolMemberDto {
    /** Unique identifier for the pool member */
    @Example("550e8400-e29b-41d4-a716-446655440000")
    id!: string;

    /** Pool ID */
    @Example("550e8400-e29b-41d4-a716-446655440001")
    pool_id!: string;

    /** User ID */
    @Example("550e8400-e29b-41d4-a716-446655440002")
    user_id!: string;

    /** Amount declared to contribute */
    @Example(100000)
    declared_amount!: number;

    /** Amount actually paid */
    @Example(50000)
    paid_amount!: number;

    /** Ownership percentage */
    @Example(10.0)
    ownership_pct!: number;

    /** Member join timestamp */
    @Example(new Date("2024-01-15T10:30:00Z"))
    joined_at?: Date;

    /** Last update timestamp */
    @Example(new Date("2024-01-15T10:30:00Z"))
    updatedAt?: Date;
}

// Contribution DTOs
export class ContributionDto {
    /** Unique identifier for the contribution */
    @Example("550e8400-e29b-41d4-a716-446655440000")
    id!: string;

    /** Pool ID */
    @Example("550e8400-e29b-41d4-a716-446655440001")
    pool_id!: string;

    /** User ID */
    @Example("550e8400-e29b-41d4-a716-446655440002")
    user_id!: string;

    /** Contribution amount */
    @Example(50000)
    amount!: number;

    /** Currency */
    @Example("NGN")
    currency!: string;

    /** Foreign exchange rate */
    @Example(1.0)
    fx_rate?: number;

    /** Payment reference */
    @Example("PAY_123456789")
    payment_ref?: string;

    /** Contribution timestamp */
    @Example(new Date("2024-01-15T10:30:00Z"))
    created_at?: Date;

    /** Last update timestamp */
    @Example(new Date("2024-01-15T10:30:00Z"))
    updatedAt?: Date;
}

// Milestone DTOs
export class MilestoneDto {
    /** Unique identifier for the milestone */
    @Example("550e8400-e29b-41d4-a716-446655440000")
    id!: string;

    /** Pool ID */
    @Example("550e8400-e29b-41d4-a716-446655440001")
    pool_id!: string;

    /** Milestone title */
    @Example("Property Purchase Agreement")
    title!: string;

    /** Milestone description */
    @Example("Complete the property purchase agreement with the seller")
    description!: string;

    /** Target completion date */
    @Example(new Date("2024-02-15"))
    target_date!: Date;

    /** Milestone status */
    @Example("pending")
    status!: string;

    /** Required approvals */
    @Example(3)
    required_approvals!: number;

    /** Current approvals */
    @Example(2)
    current_approvals!: number;

    /** Milestone creation timestamp */
    @Example(new Date("2024-01-15T10:30:00Z"))
    created_at?: Date;

    /** Last update timestamp */
    @Example(new Date("2024-01-15T10:30:00Z"))
    updatedAt?: Date;
}

export class CreateMilestoneDto {
    /** Pool ID */
    @Example("550e8400-e29b-41d4-a716-446655440001")
    pool_id!: string;

    /** Milestone title */
    @Example("Property Purchase Agreement")
    title!: string;

    /** Milestone description */
    @Example("Complete the property purchase agreement with the seller")
    description!: string;

    /** Target completion date */
    @Example("2024-02-15")
    target_date!: Date;

    /** Required approvals */
    @Example(3)
    required_approvals!: number;
}

export class VoteMilestoneDto {
    /** Vote decision */
    @Example(true)
    approve!: boolean;
}

// Document DTOs
export class DocumentDto {
    /** Unique identifier for the document */
    @Example("550e8400-e29b-41d4-a716-446655440000")
    id!: string;

    /** Pool ID */
    @Example("550e8400-e29b-41d4-a716-446655440001")
    pool_id!: string;

    /** Document type */
    @Example("title_deed")
    type!: string;

    /** Document URL */
    @Example("https://storage.example.com/documents/title-deed-123.pdf")
    url!: string;

    /** User ID who uploaded the document */
    @Example("550e8400-e29b-41d4-a716-446655440002")
    uploaded_by!: string;

    /** Document creation timestamp */
    @Example(new Date("2024-01-15T10:30:00Z"))
    created_at?: Date;

    /** Last update timestamp */
    @Example(new Date("2024-01-15T10:30:00Z"))
    updatedAt?: Date;
}

export class CreateDocumentDto {
    /** Pool ID */
    @Example("550e8400-e29b-41d4-a716-446655440001")
    pool_id!: string;

    /** Document type */
    @Example("title_deed")
    type!: "title_deed" | "agreement" | "receipt" | "other";

    /** Document URL */
    @Example("https://storage.example.com/documents/title-deed-123.pdf")
    url!: string;
}

// Agreement DTOs
export class AgreementDto {
    /** Unique identifier for the agreement */
    @Example("550e8400-e29b-41d4-a716-446655440000")
    id!: string;

    /** Pool ID */
    @Example("550e8400-e29b-41d4-a716-446655440001")
    pool_id!: string;

    /** Agreement content URL */
    @Example("https://storage.example.com/agreements/pool-123-agreement.pdf")
    content_url!: string;

    /** List of user IDs who have signed the agreement */
    @Example(["550e8400-e29b-41d4-a716-446655440002", "550e8400-e29b-41d4-a716-446655440003"])
    signed_by?: string[];

    /** Agreement creation timestamp */
    @Example(new Date("2024-01-15T10:30:00Z"))
    created_at?: Date;

    /** Agreement last update timestamp */
    @Example(new Date("2024-01-15T10:30:00Z"))
    updatedAt?: Date;
}

// User DTOs
export class UserDto {
    /** Unique identifier for the user */
    @Example("550e8400-e29b-41d4-a716-446655440000")
    id!: string;

    /** User first name */
    @Example("John")
    firstName?: string;

    /** User last name */
    @Example("Doe")
    lastName?: string;

    /** User email address */
    @Example("john.doe@example.com")
    email!: string;

    /** User phone number */
    @Example("+2348012345678")
    phone?: string;

    /** User role */
    @Example("user")
    role!: string;

    /** Email verification status */
    @Example(true)
    verified!: boolean;

    /** Account active status */
    @Example(true)
    isActive!: boolean;

    /** User creation timestamp */
    @Example(new Date("2024-01-15T10:30:00Z"))
    created_at?: Date;

    /** Last update timestamp */
    @Example(new Date("2024-01-15T10:30:00Z"))
    updatedAt?: Date;
}

// Payment DTO
export class PaymentDto {
    /** Pool ID to contribute to */
    @Example("550e8400-e29b-41d4-a716-446655440000")
    pool_id!: string;

    /** User ID making the contribution */
    @Example("550e8400-e29b-41d4-a716-446655440002")
    user_id!: string;

    /** Payment amount */
    @Example(50000)
    amount!: number;

    /** Payment currency */
    @Example("USD")
    currency?: "NGN" | "USD" | "GBP" | "EUR";

    /** Payment method */
    @Example("card")
    paymentMethod?: "card" | "bank_transfer" | "cross_border";
}

export class InterswitchPaymentDto {
    /** Pool ID to contribute to */
    @Example("550e8400-e29b-41d4-a716-446655440000")
    pool_id!: string;

    /** User ID making the contribution */
    @Example("550e8400-e29b-41d4-a716-446655440002")
    user_id!: string;

    /** Interswitch merchant code */
    @Example("MX275869")
    merchant_code!: string;

    /** Payment amount in minor units (kobo) */
    @Example(10000)
    amount!: number;

    /** Payment currency */
    @Example("NGN")
    currency!: "NGN" | "USD" | "GBP" | "EUR";

    /** Interswitch payment reference */
    @Example("FBN|WEB|MX275869|...")
    payment_ref!: string;
}



// Error Response DTO
export class ErrorResponseDto {
    /** Error message */
    @Example("Invalid request parameters")
    message!: string;

    /** HTTP status code */
    @Example(400)
    statusCode!: number;

    /** Error name/type */
    @Example("ValidationError")
    name!: string;
}
