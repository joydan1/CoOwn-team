// import Container, { Service } from "typedi";
// import { PoolMemberRepository } from "../repositories/poolMember";
// import { Controller, Route, Get, Post, Put, Delete, Path, Body, Query, Security, Tags, Example, Response } from "tsoa";
// import PoolMember from "../models/poolMember";
// @Service()
// @Route("pool-members")
// @Tags("Pool Members")
// export class PoolMemberController extends Controller {
//     private poolMemberRepository: PoolMemberRepository;
//     constructor(){
//         super();
//         this.poolMemberRepository = Container.get(PoolMemberRepository);
//     }
//     /** @summary Get pool members with optional filters @description Retrieve pool members filtered by pool ID or user ID */
//     @Security("jwt")
//     @Get("/")
//     @Example<PoolMember[]>([
//         {
//             id: "550e8400-e29b-41d4-a716-446655440000",
//             pool_id: "550e8400-e29b-41d4-a716-446655440001",
//             user_id: "550e8400-e29b-41d4-a716-446655440002",
//             declared_amount: 100000,
//             contributed_amount: 50000,
//             status: "active",
//             joined_at: "2024-01-15T10:30:00Z",
//             created_at: "2024-01-15T10:30:00Z",
//             updatedAt: "2024-01-15T10:30:00Z"
//         }
//     ])
//     public async getPoolMembers(
//         @Query() poolId?: string,
//         @Query() userId?: string
//     ): Promise<PoolMember[]> {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const filter: any = {};
//         if (poolId) {
//             filter.where = { pool_id: poolId };
//         }
//         if (userId) {
//             if (!filter.where) filter.where = {};
//             filter.where.user_id = userId;
//         }
//         return this.poolMemberRepository.listAll(filter);
//     }
//     /** @summary Get pool member by ID @description Retrieve a specific pool member by their ID */
//     @Security("jwt")
//     @Get("/{id}")
//     @Example<PoolMember>({
//         id: "550e8400-e29b-41d4-a716-446655440000",
//         pool_id: "550e8400-e29b-41d4-a716-446655440001",
//         user_id: "550e8400-e29b-41d4-a716-446655440002",
//         declared_amount: 100000,
//         paid_amount: 50000,
//         ownership_pct: 10.0,
//         joined_at: "2024-01-15T10:30:00Z",
//         updatedAt: "2024-01-15T10:30:00Z"
//     })
//     @Response<PoolMember | null>(200, "Pool member found")
//     @Response(404, "Pool member not found")
//     public async getPoolMemberById(@Path() id: string): Promise<PoolMember | null> {
//         return this.poolMemberRepository.findById(id);
//     }
//     /** @summary Create a new pool member @description Add a new member to a co-ownership pool */
//     @Security("jwt")
//     @Post("/")
//     @Example<Partial<PoolMember>>({
//         pool_id: "550e8400-e29b-41d4-a716-446655440001",
//         user_id: "550e8400-e29b-41d4-a716-446655440002",
//         declared_amount: 100000
//     })
//     @Response<PoolMember>(201, "Pool member created successfully")
//     public async createPoolMember(@Body() poolMember: Partial<PoolMember>): Promise<PoolMember> {
//         return this.poolMemberRepository.create(poolMember);
//     }
//     /** @summary Update pool member @description Update pool member information */
//     @Security("jwt")
//     @Put("/{id}")
//     @Example<Partial<PoolMember>>({
//         declared_amount: 150000,
//         paid_amount: 75000
//     })
//     @Response<PoolMember | null>(200, "Pool member updated successfully")
//     @Response(404, "Pool member not found")
//     public async updatePoolMember(@Path() id: string, @Body() updates: Partial<PoolMember>): Promise<PoolMember | null> {
//         return this.poolMemberRepository.updateById(id, updates);
//     }
//     /** @summary Delete pool member @description Remove a member from a co-ownership pool */
//     @Security("jwt")
//     @Delete("/{id}")
//     @Response<boolean>(200, "Pool member deleted successfully", true)
//     @Response(404, "Pool member not found")
//     public async deletePoolMember(@Path() id: string): Promise<boolean> {
//         return this.poolMemberRepository.deleteById(id);
//     }
// }
//# sourceMappingURL=poolMember.js.map