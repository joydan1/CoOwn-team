
API documentation at https://coown-team.onrender.com/swagger/api/

# CoOwn API (Server)

This is the CoOwn property co-ownership backend service.
It uses Node.js, TypeScript, Express + TSOA (Swagger API generation), TypeORM + PostgreSQL, and class-validator.

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

## 6. Important files

- `src/controllers/auth.ts`
- `src/controllers/user.ts`
- `src/services/user.ts`
- `src/repositories/user.ts`
- `src/models/user.ts`
- `src/dtos/user.ts`
- `tsoa.json`
- `src/swagger/swagger.json`

## 7. Notes

- `tsoa` decorators used: `@Route`, `@Tags`, `@Example`, `@Response`, and `@Security` for JWT-protected routes.
- Update DB config in `src/config/postgres.ts` or wherever database connection is set.
- Ensure token secret and InterSwitch BVN provider credentials are in environment settings.
