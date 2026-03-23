// import Container, { Service } from "typedi";
// import PropertyService, { CreatePropertyDto } from "../services/property";
// import { PropertyRepository } from "../repositories/property";
// import {
//     Controller,
//     Route,
//     Get,
//     Post,
//     Put,
//     Delete,
//     Path,
//     Body,
//     Query,
//     Security,
//     Tags,
//     Response,
//     Example
// } from "tsoa";
// import Property from "../models/property";
// import { PropertyDto, CreatePropertyDto as CreatePropertyDtoType, ErrorResponseDto } from "../dtos";

// @Service()
// @Route("properties")
// @Tags("Properties")
// export class PropertyController extends Controller {
//     private propertyService: PropertyService;
//     private propertyRepository: PropertyRepository;

//     constructor(){
//         super();
//         this.propertyService = Container.get(PropertyService);
//         this.propertyRepository = Container.get(PropertyRepository);
//     }

//     @Get("/")
//     @Summary("Get properties with optional filters")
//     @Description("Retrieve a list of properties available for co-ownership. Can filter by location, type, and status.")
//     @Example<PropertyDto[]>([
//         {
//             id: "550e8400-e29b-41d4-a716-446655440000",
//             title: "3 Bedroom Luxury Apartment in Lekki",
//             location: "Lekki Phase 1, Lagos",
//             price: 15000000,
//             type: "apartment",
//             images: ["https://example.com/image1.jpg"],
//             documents: ["https://example.com/title-deed.pdf"],
//             ai_valuation: 16500000,
//             status: "available",
//             created_at: "2024-01-15T10:30:00Z",
//             updatedAt: "2024-01-15T10:30:00Z"
//         }
//     ])
//     @Response<ErrorResponseDto>(400, "Bad Request", {
//         message: "Invalid filter parameters",
//         statusCode: 400,
//         name: "ValidationError"
//     })
//     public async getProperties(
//         @Query() @Description("Filter by location") location?: string,
//         @Query() @Description("Filter by property type") type?: "apartment" | "house" | "land" | "commercial",
//         @Query() @Description("Filter by status") status?: "available" | "under_contract" | "sold"
//     ): Promise<PropertyDto[]> {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const filter: any = {};
//         if (location) {
//             filter.where = { location };
//         }
//         if (type) {
//             if (!filter.where) filter.where = {};
//             filter.where.type = type;
//         }
//         if (status) {
//             if (!filter.where) filter.where = {};
//             filter.where.status = status;
//         }
//         return this.propertyRepository.listAll(filter);
//     }

//     @Security("jwt")
//     @Get("/{id}")
//     @Summary("Get property by ID")
//     @Description("Retrieve detailed information about a specific property.")
//     @Example<PropertyDto>({
//         id: "550e8400-e29b-41d4-a716-446655440000",
//         title: "3 Bedroom Luxury Apartment in Lekki",
//         location: "Lekki Phase 1, Lagos",
//         price: 15000000,
//         type: "apartment",
//         images: ["https://example.com/image1.jpg"],
//         documents: ["https://example.com/title-deed.pdf"],
//         ai_valuation: 16500000,
//         status: "available",
//         created_at: "2024-01-15T10:30:00Z",
//         updatedAt: "2024-01-15T10:30:00Z"
//     })
//     @Response<ErrorResponseDto>(404, "Property Not Found", {
//         message: "Property not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async getPropertyById(@Path() @Description("Property ID") id: string): Promise<PropertyDto | null> {
//         return this.propertyRepository.findById(id);
//     }

//     @Security("jwt")
//     @Get("/{id}/valuation")
//     @Summary("Get AI property valuation")
//     @Description("Get AI-powered property valuation with confidence score. Valuation considers location, property type, and market data.")
//     @Example<{ estimatedValue: number; confidence: string }>({
//         estimatedValue: 16500000,
//         confidence: "High"
//     })
//     @Response<ErrorResponseDto>(404, "Property Not Found", {
//         message: "Property not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async getPropertyValuation(@Path() @Description("Property ID") id: string): Promise<{ estimatedValue: number; confidence: string }> {
//         return this.propertyService.getPropertyValuation(id);
//     }

//     @Security("jwt")
//     @Post("/")
//     @Summary("Create a new property")
//     @Description("Create a new property listing for co-ownership. AI valuation is automatically calculated upon creation.")
//     @Example<CreatePropertyDtoType>({
//         title: "3 Bedroom Luxury Apartment in Lekki",
//         location: "Lekki Phase 1, Lagos",
//         price: 15000000,
//         type: "apartment",
//         images: ["https://example.com/image1.jpg"],
//         documents: ["https://example.com/title-deed.pdf"]
//     })
//     @Response<PropertyDto>(201, "Property created successfully")
//     @Response<ErrorResponseDto>(400, "Bad Request", {
//         message: "Invalid property data",
//         statusCode: 400,
//         name: "ValidationError"
//     })
//     public async createProperty(@Body() @Description("Property creation data") property: CreatePropertyDtoType): Promise<PropertyDto> {
//         return this.propertyService.createProperty(property);
//     }

//     @Security("jwt")
//     @Put("/{id}")
//     @Summary("Update property")
//     @Description("Update property details. Some fields may be restricted based on property status.")
//     @Response<PropertyDto>(200, "Property updated successfully")
//     @Response<ErrorResponseDto>(404, "Property Not Found", {
//         message: "Property not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async updateProperty(
//         @Path() @Description("Property ID") id: string,
//         @Body() @Description("Updated property data") updates: Partial<PropertyDto>
//     ): Promise<PropertyDto | null> {
//         return this.propertyRepository.updateById(id, updates);
//     }

//     @Security("jwt")
//     @Delete("/{id}")
//     @Summary("Delete property")
//     @Description("Delete a property listing. Properties with active pools cannot be deleted.")
//     @Response<boolean>(200, "Property deleted successfully")
//     @Response<ErrorResponseDto>(400, "Bad Request", {
//         message: "Cannot delete property with active pools",
//         statusCode: 400,
//         name: "ValidationError"
//     })
//     @Response<ErrorResponseDto>(404, "Property Not Found", {
//         message: "Property not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async deleteProperty(@Path() @Description("Property ID") id: string): Promise<boolean> {
//         return this.propertyRepository.deleteById(id);
//     }

// }