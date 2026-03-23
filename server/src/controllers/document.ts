// import Container, { Service } from "typedi";
// import { DocumentRepository } from "../repositories/document";
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
// import Document from "../models/document";
// import { DocumentDto, CreateDocumentDto, ErrorResponseDto } from "../dtos";

// @Service()
// @Route("documents")
// @Tags("Documents")
// export class DocumentController extends Controller {
//     private documentRepository: DocumentRepository;

//     constructor(){
//         super();
//         this.documentRepository = Container.get(DocumentRepository);
//     }

//     @Security("jwt")
//     @Get("/")
//     @Summary("Get documents with optional filters")
//     @Description("Retrieve documents filtered by pool. Documents include legal agreements, property deeds, and other pool-related files.")
//     @Example<DocumentDto[]>([
//         {
//             id: "550e8400-e29b-41d4-a716-446655440000",
//             pool_id: "550e8400-e29b-41d4-a716-446655440001",
//             type: "title_deed",
//             url: "https://storage.example.com/documents/title-deed-123.pdf",
//             uploaded_by: "550e8400-e29b-41d4-a716-446655440002",
//             created_at: "2024-01-15T10:30:00Z",
//             updatedAt: "2024-01-15T10:30:00Z"
//         }
//     ])
//     public async getDocuments(
//         @Query() @Description("Filter by pool ID") poolId?: string
//     ): Promise<DocumentDto[]> {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const filter: any = {};
//         if (poolId) filter.where = { pool_id: poolId };
//         return this.documentRepository.listAll(filter);
//     }

//     @Security("jwt")
//     @Get("/{id}")
//     @Summary("Get document by ID")
//     @Description("Retrieve detailed information about a specific document.")
//     @Example<DocumentDto>({
//         id: "550e8400-e29b-41d4-a716-446655440000",
//         pool_id: "550e8400-e29b-41d4-a716-446655440001",
//         type: "title_deed",
//         url: "https://storage.example.com/documents/title-deed-123.pdf",
//         uploaded_by: "550e8400-e29b-41d4-a716-446655440002",
//         created_at: "2024-01-15T10:30:00Z",
//         updatedAt: "2024-01-15T10:30:00Z"
//     })
//     @Response<ErrorResponseDto>(404, "Document Not Found", {
//         message: "Document not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async getDocumentById(@Path() @Description("Document ID") id: string): Promise<DocumentDto | null> {
//         return this.documentRepository.findById(id);
//     }

//     @Security("jwt")
//     @Post("/")
//     @Summary("Upload a new document")
//     @Description("Upload a new document to a pool's document vault. Documents are securely stored and accessible only to pool members.")
//     @Example<CreateDocumentDto>({
//         pool_id: "550e8400-e29b-41d4-a716-446655440000",
//         type: "title_deed",
//         url: "https://storage.example.com/documents/title-deed-123.pdf"
//     })
//     @Response<DocumentDto>(201, "Document uploaded successfully")
//     @Response<ErrorResponseDto>(400, "Bad Request", {
//         message: "Invalid document data or pool not found",
//         statusCode: 400,
//         name: "ValidationError"
//     })
//     @Response<ErrorResponseDto>(403, "Forbidden", {
//         message: "Only pool members can upload documents",
//         statusCode: 403,
//         name: "ForbiddenError"
//     })
//     public async createDocument(@Body() @Description("Document creation data") document: CreateDocumentDto): Promise<DocumentDto> {
//         return this.documentRepository.create(document);
//     }

//     @Security("jwt")
//     @Put("/{id}")
//     @Summary("Update document")
//     @Description("Update document metadata. Document files themselves cannot be modified after upload.")
//     @Response<DocumentDto>(200, "Document updated successfully")
//     @Response<ErrorResponseDto>(404, "Document Not Found", {
//         message: "Document not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async updateDocument(
//         @Path() @Description("Document ID") id: string,
//         @Body() @Description("Updated document data") updates: Partial<DocumentDto>
//     ): Promise<DocumentDto | null> {
//         return this.documentRepository.updateById(id, updates);
//     }

//     @Security("jwt")
//     @Delete("/{id}")
//     @Summary("Delete document")
//     @Description("Delete a document from the pool's document vault. This action cannot be undone.")
//     @Response<boolean>(200, "Document deleted successfully")
//     @Response<ErrorResponseDto>(404, "Document Not Found", {
//         message: "Document not found",
//         statusCode: 404,
//         name: "NotFoundError"
//     })
//     public async deleteDocument(@Path() @Description("Document ID") id: string): Promise<boolean> {
//         return this.documentRepository.deleteById(id);
//     }

// }