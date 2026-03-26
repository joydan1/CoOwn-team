
API documentation at https://coown-team.onrender.com/swagger/api/

# CoOwn API (Server)

This is the CoOwn property co-ownership backend service.
It uses Node.js, TypeScript, Express + TSOA (Swagger API generation), TypeORM + PostgreSQL, and class-validator.

## Recent Updates (March 2026)

- Pool joining simplified: `GET /pools/{id}/join` for instant join, `PUT /pools/{id}/join` to update details
- Invite links: Generate via `GET /pools/{id}/invite`, but join directly via pool ID
- Removed redundant endpoints: `/pools/invite/{code}/join` and `/pools/{id}/members`
- Added comprehensive Swagger descriptions for all endpoints

## 1. Prerequisites

- Node.js 18+ (or LTS)
- npm
- PostgreSQL database
- Environment vars configured (see `.env` or local config strategy)

## 2. Install

```bash
cd c:/projectFiles/coOwn/CoOwn-team/server
npm install
```

## 3. Build & Start

### Development

```bash
npm run dev
```

This runs `nodemon --watch "src/**/*.ts" --exec "npm run build && npm run start"`.

### Production build

```bash
npm run build
npm run start
```

## 4. API docs

Swagger OpenAPI JSON is generated to `src/swagger/swagger.json` via tsoa.
All endpoints now include detailed descriptions for frontend integration.
If swagger UI is integrated in the server, view at `/swagger` (or `/docs`) depending on routing.

## 5. Controllers and endpoints

### `/auth` (AuthController)

- `POST /auth/register`
  - register new user
  - body: `RegisterUserDto` (firstName, lastName, email, password)

- `POST /auth/login`
  - login and issue JWT
  - body: `LoginUserDto` (email, password)

- `POST /auth/refresh`
  - refresh token
  - body: `refreshTokenDto` (refreshToken)

- `DELETE /auth/logout`
  - logout user by id
  - query param: `id`

- `POST /auth/verify-bvn` (if exists in current service)
  - verify user BVN
  - body: `VerifyBvnDto` (bvn, firstName, lastName, dateOfBirth)

### `/users` (UserController)

- `GET /users/:id`
  - get user by id (secured)

- additional endpoints depend on codebase (list, update, delete) in `UserService` / `user` controller.

### `/pools` (PoolController)

- `GET /pools/` - list pools (optional creatorId/isPublic filters)
- `GET /pools/public` - list public pools
- `GET /pools/{id}` - get pool by id (secured)
- `POST /pools/` - create pool (secured) - returns pool with invite_link
- `GET /pools/{id}/invite` - get invite link for pool (secured)
- `GET /pools/{id}/join` - join pool instantly with default values (secured)
- `PUT /pools/{id}/join` - update join details (investment amount/currency) (secured)
- `GET /pools/{id}/dashboard` - get pool dashboard (secured)
- `GET /pools/{id}/certificate` - generate ownership certificate for requesting member (secured)
- `GET /pools/{id}/users` - get users joined pool (secured)
- `PUT /pools/{id}/toggle-public` - toggle public status (creator only)
- `PUT /pools/{id}` - update pool details (secured)
- `DELETE /pools/{id}` - delete pool (secured)

## 6. Important files

- `src/controllers/auth.ts`, `src/controllers/user.ts`, `src/controllers/pool.ts`
- `src/services/user.ts`, `src/services/pool.ts`
- `src/repositories/user.ts`, `src/repositories/pool.ts`, `src/repositories/poolMember.ts`
- `src/models/user.ts`, `src/models/pool.ts`, `src/models/poolMember.ts`
- `src/dtos/user.ts`, `src/dtos/index.ts` (includes pool DTOs)
- `tsoa.json`
- `src/swagger/swagger.json`

## 7. WebSocket implementation

This project includes Socket.IO-based WebSocket support in `src/config/websocket.ts`. It is initialized by `src/app.ts` with the HTTP server.

- `initWebSocket(server)` starts Socket.IO with CORS allowed from all origins and methods GET/POST.
- `io.on('connection', socket => { ... })` handles client socket lifecycles.

Socket event contract (client ↔ server):

Client emits:

- `loginUser` (payload: `string` userId)
  - server validates user, calls `socket.join(userId)`, stores mapping, broadcasts `userOnline`, and sends a room-specific `notification`.

- `joinPool` (payload: `string` poolId)
  - server calls `socket.join(poolId)` and logs the join.

Server emits (to clients):

- `userOnline` (broadcast) when any user logs in through websocket.
  - payload: `string` userId.

- `notification` (to user room) on login success.
  - payload shape: `{ type: 'login', message: string, timestamp: Date }`.

- `contributionAdded` (to pool room) when a pool contribution is recorded.
  - payload shape: `{ pool_id: string, user_id: string, amount: number, currency: string, timestamp: Date }`.

- `contributionUpdated` (to pool room) when an existing contribution is updated.
  - payload shape: `ContributionDto` for the updated contribution.

- `contributionRemoved` (to pool room) when a contribution is deleted.
  - payload shape: `{ id: string, pool_id: string, user_id: string, amount: number, currency: string, timestamp: Date }`.

Listening for these on client (recommended):

- `socket.on('userOnline', userId => { ... })`
- `socket.on('notification', data => { ... })`
- `socket.on('contributionAdded', contribution => { ... })`
- `socket.on('contributionUpdated', updatedContribution => { ... })`
- `socket.on('contributionRemoved', removedInfo => { ... })`

## 8. Notes

- `tsoa` decorators used: `@Route`, `@Tags`, `@Example`, `@Response`, `@Description`, and `@Security` for JWT-protected routes.
- Update DB config in `src/config/postgres.ts` or wherever database connection is set.
- Ensure token secret and InterSwitch BVN provider credentials are in environment settings.
- Pool invite links use base URL from `POOL_INVITE_BASE_URL` env var (default: https://coown.app/pools)
- All pool endpoints now have detailed JSDoc descriptions for clear API documentation.
