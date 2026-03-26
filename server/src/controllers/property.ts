import Container, { Service } from "typedi";
import PropertyService, { CreatePropertyDto } from "../services/property";
import { PropertyRepository } from "../repositories/property";
import {
    Controller,
    Route,
    Get,
    Post,
    Put,
    Delete,
    Path,
    Body,
    Query,
    Security,
    Tags,
    Response,
    Example
} from "tsoa";
import Property from "../models/property";
import { PropertyDto, CreatePropertyDto as CreatePropertyDtoType, ErrorResponseDto } from "../dtos";

@Service()
@Route("properties")
@Tags("Properties")
export class PropertyController extends Controller {
    private propertyService: PropertyService;
    private propertyRepository: PropertyRepository;

    constructor() {
        super();
        this.propertyService = Container.get(PropertyService);
        this.propertyRepository = Container.get(PropertyRepository);
    }

/**
     * Retrieve a list of properties, with optional filtering by location, type, and status.
     */
    @Get("/")
    @Example<PropertyDto[]>([
        {
            id: "550e8400-e29b-41d4-a716-446655440000",
            title: "3 Bedroom Luxury Apartment in Lekki",
            location: "Lekki Phase 1, Lagos",
            price: 15000000,
            type: "apartment",
            images: ["https://example.com/image1.jpg"],
            documents: ["https://example.com/title-deed.pdf"],
            ai_valuation: 16500000,
            status: "available",
            created_at: new Date("2024-01-15T10:30:00Z"),
            updatedAt: new Date("2024-01-15T10:30:00Z")
        }
    ])
    @Response<ErrorResponseDto>(400, "Bad Request", {
        message: "Invalid filter parameters",
        statusCode: 400,
        name: "ValidationError"
    })
    public async getProperties(
        @Query() location?: string,
        @Query() type?: "apartment" | "house" | "land" | "commercial",
        @Query() status?: "available" | "under_contract" | "sold"
    ): Promise<PropertyDto[]> {
        const filter: Record<string, unknown> = {};
        if (location) filter["location"] = location;
        if (type) filter["type"] = type;
        if (status) filter["status"] = status;

        const query: any = {};
        if (Object.keys(filter).length > 0) query.where = filter;

        return this.propertyRepository.listAll(query) as unknown as PropertyDto[];
    }

/**
     * Get the list of property listings that are currently active for investment search.
     */
    @Get("/listings")
    public async getPropertyListings(): Promise<PropertyDto[]> {
        return this.propertyService.getPropertyListings() as unknown as PropertyDto[];
    }

    /**
     * Get details for a specific property by ID.
     */
    @Security("jwt")
    @Get("/{id}")
    @Example<PropertyDto>({
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "3 Bedroom Luxury Apartment in Lekki",
        location: "Lekki Phase 1, Lagos",
        price: 15000000,
        type: "apartment",
        images: ["https://example.com/image1.jpg"],
        documents: ["https://example.com/title-deed.pdf"],
        ai_valuation: 16500000,
        status: "available",
        created_at: new Date("2024-01-15T10:30:00Z"),
        updatedAt: new Date("2024-01-15T10:30:00Z")
    })
    @Response<ErrorResponseDto>(404, "Property Not Found", {
        message: "Property not found",
        statusCode: 404,
        name: "NotFoundError"
    })
    public async getPropertyById(@Path() id: string): Promise<PropertyDto | null> {
        return this.propertyRepository.findById(id) as unknown as PropertyDto | null;
    }

    @Security("jwt")
    @Get("/{id}/valuation")
    @Example<{ estimatedValue: number; confidence: string }>({
        estimatedValue: 16500000,
        confidence: "High"
    })
    @Response<ErrorResponseDto>(404, "Property Not Found", {
        message: "Property not found",
        statusCode: 404,
        name: "NotFoundError"
    })
    public async getPropertyValuation(@Path() id: string): Promise<{ estimatedValue: number; confidence: string }> {
        return this.propertyService.getPropertyValuation(id);
    }

    @Security("jwt")
    @Post("/")
    @Example<CreatePropertyDtoType>({
        title: "3 Bedroom Luxury Apartment in Lekki",
        location: "Lekki Phase 1, Lagos",
        price: 15000000,
        type: "apartment",
        images: ["https://example.com/image1.jpg"],
        documents: ["https://example.com/title-deed.pdf"]
    })
    @Response<PropertyDto>(201, "Property created successfully")
    @Response<ErrorResponseDto>(400, "Bad Request", {
        message: "Invalid property data",
        statusCode: 400,
        name: "ValidationError"
    })
    public async createProperty(@Body() property: CreatePropertyDtoType): Promise<PropertyDto> {
        return this.propertyService.createProperty(property) as unknown as PropertyDto;
    }

    @Security("jwt")
    @Put("/{id}")
    @Response<PropertyDto>(200, "Property updated successfully")
    @Response<ErrorResponseDto>(404, "Property Not Found", {
        message: "Property not found",
        statusCode: 404,
        name: "NotFoundError"
    })
    public async updateProperty(
        @Path() id: string,
        @Body() updates: Partial<PropertyDto>
    ): Promise<PropertyDto | null> {
        return this.propertyService.updateProperty(id, updates as Partial<Property>) as unknown as PropertyDto | null;
    }

    @Security("jwt")
    @Delete("/{id}")
    @Response<boolean>(200, "Property deleted successfully")
    @Response<ErrorResponseDto>(400, "Bad Request", {
        message: "Cannot delete property with active pools",
        statusCode: 400,
        name: "ValidationError"
    })
    @Response<ErrorResponseDto>(404, "Property Not Found", {
        message: "Property not found",
        statusCode: 404,
        name: "NotFoundError"
    })
    public async deleteProperty(@Path() id: string): Promise<boolean> {
        return this.propertyService.deleteProperty(id);
    }

}
