"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterRoutes = RegisterRoutes;
const runtime_1 = require("@tsoa/runtime");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const user_1 = require("./../../controllers/user");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const property_1 = require("./../../controllers/property");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const pool_1 = require("./../../controllers/pool");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const auth_1 = require("./../../controllers/auth");
const authentication_1 = require("./../../middlewares/authentication");
const expressAuthenticationRecasted = authentication_1.expressAuthentication;
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const models = {
    "Partial_User-or-null_": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "id": { "dataType": "string" }, "firstName": { "dataType": "string" }, "lastName": { "dataType": "string" }, "email": { "dataType": "string" }, "password": { "dataType": "string" }, "token": { "dataType": "string" }, "phone": { "dataType": "string" }, "bvn_hash": { "dataType": "string" }, "verified": { "dataType": "boolean" }, "role": { "dataType": "string" }, "isActive": { "dataType": "boolean" }, "created_at": { "dataType": "datetime" }, "updatedAt": { "dataType": "datetime" } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_User_": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "id": { "dataType": "string" }, "firstName": { "dataType": "string" }, "lastName": { "dataType": "string" }, "email": { "dataType": "string" }, "password": { "dataType": "string" }, "token": { "dataType": "string" }, "phone": { "dataType": "string" }, "bvn_hash": { "dataType": "string" }, "verified": { "dataType": "boolean" }, "role": { "dataType": "string" }, "isActive": { "dataType": "boolean" }, "created_at": { "dataType": "datetime" }, "updatedAt": { "dataType": "datetime" } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateUserDto": {
        "dataType": "refObject",
        "properties": {
            "firstName": { "dataType": "string" },
            "lastName": { "dataType": "string" },
            "phone": { "dataType": "string" },
            "role": { "dataType": "string" },
            "isActive": { "dataType": "boolean" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PropertyDto": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "string", "required": true },
            "title": { "dataType": "string", "required": true },
            "location": { "dataType": "string", "required": true },
            "price": { "dataType": "double", "required": true },
            "type": { "dataType": "string", "required": true },
            "images": { "dataType": "array", "array": { "dataType": "string" } },
            "documents": { "dataType": "array", "array": { "dataType": "string" } },
            "ai_valuation": { "dataType": "double" },
            "status": { "dataType": "string", "required": true },
            "created_at": { "dataType": "datetime" },
            "updatedAt": { "dataType": "datetime" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ErrorResponseDto": {
        "dataType": "refObject",
        "properties": {
            "message": { "dataType": "string", "required": true },
            "statusCode": { "dataType": "double", "required": true },
            "name": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreatePropertyDtoType": {
        "dataType": "refObject",
        "properties": {
            "title": { "dataType": "string", "required": true },
            "location": { "dataType": "string", "required": true },
            "price": { "dataType": "double", "required": true },
            "type": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["apartment"] }, { "dataType": "enum", "enums": ["house"] }, { "dataType": "enum", "enums": ["land"] }, { "dataType": "enum", "enums": ["commercial"] }], "required": true },
            "images": { "dataType": "array", "array": { "dataType": "string" } },
            "documents": { "dataType": "array", "array": { "dataType": "string" } },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_PropertyDto_": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "id": { "dataType": "string" }, "title": { "dataType": "string" }, "location": { "dataType": "string" }, "price": { "dataType": "double" }, "type": { "dataType": "string" }, "images": { "dataType": "array", "array": { "dataType": "string" } }, "documents": { "dataType": "array", "array": { "dataType": "string" } }, "ai_valuation": { "dataType": "double" }, "status": { "dataType": "string" }, "created_at": { "dataType": "datetime" }, "updatedAt": { "dataType": "datetime" } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserDto": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "string", "required": true },
            "firstName": { "dataType": "string" },
            "lastName": { "dataType": "string" },
            "email": { "dataType": "string", "required": true },
            "phone": { "dataType": "string" },
            "role": { "dataType": "string", "required": true },
            "verified": { "dataType": "boolean", "required": true },
            "isActive": { "dataType": "boolean", "required": true },
            "created_at": { "dataType": "datetime" },
            "updatedAt": { "dataType": "datetime" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PoolDto": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "string", "required": true },
            "property": { "ref": "PropertyDto", "required": true },
            "creator": { "ref": "UserDto", "required": true },
            "name": { "dataType": "string", "required": true },
            "target_amount": { "dataType": "double", "required": true },
            "raised_amount": { "dataType": "double", "required": true },
            "deadline": { "dataType": "datetime" },
            "status": { "dataType": "string", "required": true },
            "is_public": { "dataType": "boolean", "required": true },
            "created_at": { "dataType": "datetime" },
            "updatedAt": { "dataType": "datetime" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Property": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "string", "required": true },
            "title": { "dataType": "string", "required": true },
            "location": { "dataType": "string", "required": true },
            "price": { "dataType": "double", "required": true },
            "type": { "dataType": "string", "required": true },
            "images": { "dataType": "array", "array": { "dataType": "string" } },
            "documents": { "dataType": "array", "array": { "dataType": "string" } },
            "ai_valuation": { "dataType": "double" },
            "status": { "dataType": "string", "required": true },
            "created_at": { "dataType": "datetime" },
            "updatedAt": { "dataType": "datetime" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "User": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "string", "required": true },
            "firstName": { "dataType": "string" },
            "lastName": { "dataType": "string" },
            "email": { "dataType": "string", "required": true },
            "password": { "dataType": "string" },
            "token": { "dataType": "string" },
            "phone": { "dataType": "string" },
            "bvn_hash": { "dataType": "string" },
            "verified": { "dataType": "boolean" },
            "role": { "dataType": "string" },
            "isActive": { "dataType": "boolean" },
            "created_at": { "dataType": "datetime" },
            "updatedAt": { "dataType": "datetime" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pool": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "string", "required": true },
            "property": { "ref": "Property", "required": true },
            "property_id": { "dataType": "string", "required": true },
            "creator": { "ref": "User", "required": true },
            "creator_id": { "dataType": "string", "required": true },
            "name": { "dataType": "string", "required": true },
            "target_amount": { "dataType": "double", "required": true },
            "raised_amount": { "dataType": "double", "required": true },
            "deadline": { "dataType": "datetime" },
            "status": { "dataType": "string", "required": true },
            "is_public": { "dataType": "boolean", "required": true },
            "created_at": { "dataType": "datetime" },
            "updatedAt": { "dataType": "datetime" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreatePoolDto": {
        "dataType": "refObject",
        "properties": {
            "property_id": { "dataType": "string", "required": true },
            "name": { "dataType": "string", "required": true },
            "target_amount": { "dataType": "double", "required": true },
            "deadline": { "dataType": "datetime" },
            "is_public": { "dataType": "boolean" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PoolMemberDto": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "string", "required": true },
            "pool_id": { "dataType": "string", "required": true },
            "user_id": { "dataType": "string", "required": true },
            "declared_amount": { "dataType": "double", "required": true },
            "paid_amount": { "dataType": "double", "required": true },
            "ownership_pct": { "dataType": "double", "required": true },
            "joined_at": { "dataType": "datetime" },
            "updatedAt": { "dataType": "datetime" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "JoinPoolDto": {
        "dataType": "refObject",
        "properties": {
            "investment_amount": { "dataType": "double", "required": true },
            "user_id": { "dataType": "string", "required": true },
            "currency": { "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["NGN"] }, { "dataType": "enum", "enums": ["USD"] }, { "dataType": "enum", "enums": ["GBP"] }, { "dataType": "enum", "enums": ["EUR"] }], "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ContributionDto": {
        "dataType": "refObject",
        "properties": {
            "id": { "dataType": "string", "required": true },
            "pool_id": { "dataType": "string", "required": true },
            "user_id": { "dataType": "string", "required": true },
            "amount": { "dataType": "double", "required": true },
            "currency": { "dataType": "string", "required": true },
            "fx_rate": { "dataType": "double" },
            "payment_ref": { "dataType": "string" },
            "created_at": { "dataType": "datetime" },
            "updatedAt": { "dataType": "datetime" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PoolDashboardDto": {
        "dataType": "refObject",
        "properties": {
            "pool": { "ref": "PoolDto", "required": true },
            "members": { "dataType": "array", "array": { "dataType": "refObject", "ref": "PoolMemberDto" }, "required": true },
            "contributions": { "dataType": "array", "array": { "dataType": "refObject", "ref": "ContributionDto" }, "required": true },
            "progress": { "dataType": "double", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_Pool_": {
        "dataType": "refAlias",
        "type": { "dataType": "nestedObjectLiteral", "nestedProperties": { "id": { "dataType": "string" }, "property": { "ref": "Property" }, "property_id": { "dataType": "string" }, "creator": { "ref": "User" }, "creator_id": { "dataType": "string" }, "name": { "dataType": "string" }, "target_amount": { "dataType": "double" }, "raised_amount": { "dataType": "double" }, "deadline": { "dataType": "datetime" }, "status": { "dataType": "string" }, "is_public": { "dataType": "boolean" }, "created_at": { "dataType": "datetime" }, "updatedAt": { "dataType": "datetime" } }, "validators": {} },
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RegisterUserDto": {
        "dataType": "refObject",
        "properties": {
            "firstName": { "dataType": "string" },
            "lastName": { "dataType": "string" },
            "email": { "dataType": "string", "required": true },
            "password": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "tokenDto": {
        "dataType": "refObject",
        "properties": {
            "accessToken": { "dataType": "string" },
            "refreshToken": { "dataType": "string" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginUserResponseDto": {
        "dataType": "refObject",
        "properties": {
            "message": { "dataType": "string" },
            "token": { "ref": "tokenDto" },
            "user": { "ref": "Partial_User_" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginUserDto": {
        "dataType": "refObject",
        "properties": {
            "email": { "dataType": "string", "required": true },
            "password": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "refreshTokenDto": {
        "dataType": "refObject",
        "properties": {
            "refreshToken": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new runtime_1.ExpressTemplateService(models, { "noImplicitAdditionalProperties": "silently-remove-extras", "bodyCoercion": true });
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
function RegisterRoutes(app) {
    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################
    const argsAuthController_getUserById = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
    };
    app.get('/users/:id', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(user_1.AuthController)), ...((0, runtime_1.fetchMiddlewares)(user_1.AuthController.prototype.getUserById)), async function AuthController_getUserById(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_getUserById, request, response });
            const controller = new user_1.AuthController();
            await templateService.apiHandler({
                methodName: 'getUserById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsAuthController_listAll = {
        role: { "in": "query", "name": "role", "dataType": "string" },
        isActive: { "in": "query", "name": "isActive", "dataType": "boolean" },
    };
    app.get('/users', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(user_1.AuthController)), ...((0, runtime_1.fetchMiddlewares)(user_1.AuthController.prototype.listAll)), async function AuthController_listAll(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_listAll, request, response });
            const controller = new user_1.AuthController();
            await templateService.apiHandler({
                methodName: 'listAll',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsAuthController_updateUser = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
        updates: { "in": "body", "name": "updates", "required": true, "ref": "UpdateUserDto" },
    };
    app.put('/users/:id', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(user_1.AuthController)), ...((0, runtime_1.fetchMiddlewares)(user_1.AuthController.prototype.updateUser)), async function AuthController_updateUser(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_updateUser, request, response });
            const controller = new user_1.AuthController();
            await templateService.apiHandler({
                methodName: 'updateUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsAuthController_deleteUser = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
    };
    app.delete('/users/:id', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(user_1.AuthController)), ...((0, runtime_1.fetchMiddlewares)(user_1.AuthController.prototype.deleteUser)), async function AuthController_deleteUser(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_deleteUser, request, response });
            const controller = new user_1.AuthController();
            await templateService.apiHandler({
                methodName: 'deleteUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPropertyController_getProperties = {
        location: { "in": "query", "name": "location", "dataType": "string" },
        type: { "in": "query", "name": "type", "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["apartment"] }, { "dataType": "enum", "enums": ["house"] }, { "dataType": "enum", "enums": ["land"] }, { "dataType": "enum", "enums": ["commercial"] }] },
        status: { "in": "query", "name": "status", "dataType": "union", "subSchemas": [{ "dataType": "enum", "enums": ["available"] }, { "dataType": "enum", "enums": ["under_contract"] }, { "dataType": "enum", "enums": ["sold"] }] },
    };
    app.get('/properties', ...((0, runtime_1.fetchMiddlewares)(property_1.PropertyController)), ...((0, runtime_1.fetchMiddlewares)(property_1.PropertyController.prototype.getProperties)), async function PropertyController_getProperties(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPropertyController_getProperties, request, response });
            const controller = new property_1.PropertyController();
            await templateService.apiHandler({
                methodName: 'getProperties',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPropertyController_getPropertyListings = {};
    app.get('/properties/listings', ...((0, runtime_1.fetchMiddlewares)(property_1.PropertyController)), ...((0, runtime_1.fetchMiddlewares)(property_1.PropertyController.prototype.getPropertyListings)), async function PropertyController_getPropertyListings(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPropertyController_getPropertyListings, request, response });
            const controller = new property_1.PropertyController();
            await templateService.apiHandler({
                methodName: 'getPropertyListings',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPropertyController_getPropertyById = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
    };
    app.get('/properties/:id', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(property_1.PropertyController)), ...((0, runtime_1.fetchMiddlewares)(property_1.PropertyController.prototype.getPropertyById)), async function PropertyController_getPropertyById(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPropertyController_getPropertyById, request, response });
            const controller = new property_1.PropertyController();
            await templateService.apiHandler({
                methodName: 'getPropertyById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPropertyController_getPropertyValuation = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
    };
    app.get('/properties/:id/valuation', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(property_1.PropertyController)), ...((0, runtime_1.fetchMiddlewares)(property_1.PropertyController.prototype.getPropertyValuation)), async function PropertyController_getPropertyValuation(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPropertyController_getPropertyValuation, request, response });
            const controller = new property_1.PropertyController();
            await templateService.apiHandler({
                methodName: 'getPropertyValuation',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPropertyController_createProperty = {
        property: { "in": "body", "name": "property", "required": true, "ref": "CreatePropertyDtoType" },
    };
    app.post('/properties', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(property_1.PropertyController)), ...((0, runtime_1.fetchMiddlewares)(property_1.PropertyController.prototype.createProperty)), async function PropertyController_createProperty(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPropertyController_createProperty, request, response });
            const controller = new property_1.PropertyController();
            await templateService.apiHandler({
                methodName: 'createProperty',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPropertyController_updateProperty = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
        updates: { "in": "body", "name": "updates", "required": true, "ref": "Partial_PropertyDto_" },
    };
    app.put('/properties/:id', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(property_1.PropertyController)), ...((0, runtime_1.fetchMiddlewares)(property_1.PropertyController.prototype.updateProperty)), async function PropertyController_updateProperty(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPropertyController_updateProperty, request, response });
            const controller = new property_1.PropertyController();
            await templateService.apiHandler({
                methodName: 'updateProperty',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPropertyController_deleteProperty = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
    };
    app.delete('/properties/:id', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(property_1.PropertyController)), ...((0, runtime_1.fetchMiddlewares)(property_1.PropertyController.prototype.deleteProperty)), async function PropertyController_deleteProperty(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPropertyController_deleteProperty, request, response });
            const controller = new property_1.PropertyController();
            await templateService.apiHandler({
                methodName: 'deleteProperty',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPoolController_getPools = {
        creatorId: { "in": "query", "name": "creatorId", "dataType": "string" },
        isPublic: { "in": "query", "name": "isPublic", "dataType": "boolean" },
    };
    app.get('/pools', ...((0, runtime_1.fetchMiddlewares)(pool_1.PoolController)), ...((0, runtime_1.fetchMiddlewares)(pool_1.PoolController.prototype.getPools)), async function PoolController_getPools(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPoolController_getPools, request, response });
            const controller = new pool_1.PoolController();
            await templateService.apiHandler({
                methodName: 'getPools',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPoolController_getPublicPools = {};
    app.get('/pools/public', ...((0, runtime_1.fetchMiddlewares)(pool_1.PoolController)), ...((0, runtime_1.fetchMiddlewares)(pool_1.PoolController.prototype.getPublicPools)), async function PoolController_getPublicPools(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPoolController_getPublicPools, request, response });
            const controller = new pool_1.PoolController();
            await templateService.apiHandler({
                methodName: 'getPublicPools',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPoolController_getPoolById = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
    };
    app.get('/pools/:id', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(pool_1.PoolController)), ...((0, runtime_1.fetchMiddlewares)(pool_1.PoolController.prototype.getPoolById)), async function PoolController_getPoolById(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPoolController_getPoolById, request, response });
            const controller = new pool_1.PoolController();
            await templateService.apiHandler({
                methodName: 'getPoolById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPoolController_createPool = {
        pool: { "in": "body", "name": "pool", "required": true, "ref": "CreatePoolDto" },
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
    };
    app.post('/pools', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(pool_1.PoolController)), ...((0, runtime_1.fetchMiddlewares)(pool_1.PoolController.prototype.createPool)), async function PoolController_createPool(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPoolController_createPool, request, response });
            const controller = new pool_1.PoolController();
            await templateService.apiHandler({
                methodName: 'createPool',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPoolController_joinPool = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
        joinData: { "in": "body", "name": "joinData", "required": true, "ref": "JoinPoolDto" },
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
    };
    app.post('/pools/:id/join', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(pool_1.PoolController)), ...((0, runtime_1.fetchMiddlewares)(pool_1.PoolController.prototype.joinPool)), async function PoolController_joinPool(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPoolController_joinPool, request, response });
            const controller = new pool_1.PoolController();
            await templateService.apiHandler({
                methodName: 'joinPool',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPoolController_getPoolDashboard = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
    };
    app.get('/pools/:id/dashboard', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(pool_1.PoolController)), ...((0, runtime_1.fetchMiddlewares)(pool_1.PoolController.prototype.getPoolDashboard)), async function PoolController_getPoolDashboard(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPoolController_getPoolDashboard, request, response });
            const controller = new pool_1.PoolController();
            await templateService.apiHandler({
                methodName: 'getPoolDashboard',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPoolController_getPoolMembers = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
    };
    app.get('/pools/:id/members', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(pool_1.PoolController)), ...((0, runtime_1.fetchMiddlewares)(pool_1.PoolController.prototype.getPoolMembers)), async function PoolController_getPoolMembers(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPoolController_getPoolMembers, request, response });
            const controller = new pool_1.PoolController();
            await templateService.apiHandler({
                methodName: 'getPoolMembers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPoolController_getPoolUsers = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
    };
    app.get('/pools/:id/users', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(pool_1.PoolController)), ...((0, runtime_1.fetchMiddlewares)(pool_1.PoolController.prototype.getPoolUsers)), async function PoolController_getPoolUsers(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPoolController_getPoolUsers, request, response });
            const controller = new pool_1.PoolController();
            await templateService.apiHandler({
                methodName: 'getPoolUsers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPoolController_togglePublic = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
        data: { "in": "body", "name": "data", "required": true, "dataType": "nestedObjectLiteral", "nestedProperties": { "is_public": { "dataType": "boolean", "required": true } } },
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
    };
    app.put('/pools/:id/toggle-public', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(pool_1.PoolController)), ...((0, runtime_1.fetchMiddlewares)(pool_1.PoolController.prototype.togglePublic)), async function PoolController_togglePublic(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPoolController_togglePublic, request, response });
            const controller = new pool_1.PoolController();
            await templateService.apiHandler({
                methodName: 'togglePublic',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPoolController_updatePool = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
        updates: { "in": "body", "name": "updates", "required": true, "ref": "Partial_Pool_" },
    };
    app.put('/pools/:id', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(pool_1.PoolController)), ...((0, runtime_1.fetchMiddlewares)(pool_1.PoolController.prototype.updatePool)), async function PoolController_updatePool(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPoolController_updatePool, request, response });
            const controller = new pool_1.PoolController();
            await templateService.apiHandler({
                methodName: 'updatePool',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsPoolController_deletePool = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
    };
    app.delete('/pools/:id', authenticateMiddleware([{ "jwt": [] }]), ...((0, runtime_1.fetchMiddlewares)(pool_1.PoolController)), ...((0, runtime_1.fetchMiddlewares)(pool_1.PoolController.prototype.deletePool)), async function PoolController_deletePool(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsPoolController_deletePool, request, response });
            const controller = new pool_1.PoolController();
            await templateService.apiHandler({
                methodName: 'deletePool',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsUserController_register = {
        req: { "in": "body", "name": "req", "required": true, "ref": "RegisterUserDto" },
    };
    app.post('/auth/register', ...((0, runtime_1.fetchMiddlewares)(auth_1.UserController)), ...((0, runtime_1.fetchMiddlewares)(auth_1.UserController.prototype.register)), async function UserController_register(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsUserController_register, request, response });
            const controller = new auth_1.UserController();
            await templateService.apiHandler({
                methodName: 'register',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsUserController_login = {
        req: { "in": "body", "name": "req", "required": true, "ref": "LoginUserDto" },
    };
    app.post('/auth/login', ...((0, runtime_1.fetchMiddlewares)(auth_1.UserController)), ...((0, runtime_1.fetchMiddlewares)(auth_1.UserController.prototype.login)), async function UserController_login(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsUserController_login, request, response });
            const controller = new auth_1.UserController();
            await templateService.apiHandler({
                methodName: 'login',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsUserController_refresh = {
        req: { "in": "body", "name": "req", "required": true, "ref": "refreshTokenDto" },
    };
    app.post('/auth/refresh', ...((0, runtime_1.fetchMiddlewares)(auth_1.UserController)), ...((0, runtime_1.fetchMiddlewares)(auth_1.UserController.prototype.refresh)), async function UserController_refresh(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsUserController_refresh, request, response });
            const controller = new auth_1.UserController();
            await templateService.apiHandler({
                methodName: 'refresh',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsUserController_logout = {
        id: { "in": "query", "name": "id", "required": true, "dataType": "string" },
    };
    app.delete('/auth/logout', ...((0, runtime_1.fetchMiddlewares)(auth_1.UserController)), ...((0, runtime_1.fetchMiddlewares)(auth_1.UserController.prototype.logout)), async function UserController_logout(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsUserController_logout, request, response });
            const controller = new auth_1.UserController();
            await templateService.apiHandler({
                methodName: 'logout',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    function authenticateMiddleware(security = []) {
        return async function runAuthenticationMiddleware(request, response, next) {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            // keep track of failed auth attempts so we can hand back the most
            // recent one.  This behavior was previously existing so preserving it
            // here
            const failedAttempts = [];
            const pushAndRethrow = (error) => {
                failedAttempts.push(error);
                throw error;
            };
            const secMethodOrPromises = [];
            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    const secMethodAndPromises = [];
                    for (const name in secMethod) {
                        secMethodAndPromises.push(expressAuthenticationRecasted(request, name, secMethod[name], response)
                            .catch(pushAndRethrow));
                    }
                    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
                    secMethodOrPromises.push(Promise.all(secMethodAndPromises)
                        .then(users => { return users[0]; }));
                }
                else {
                    for (const name in secMethod) {
                        secMethodOrPromises.push(expressAuthenticationRecasted(request, name, secMethod[name], response)
                            .catch(pushAndRethrow));
                    }
                }
            }
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            try {
                request['user'] = await Promise.any(secMethodOrPromises);
                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }
                next();
            }
            catch (err) {
                // Show most recent error as response
                const error = failedAttempts.pop();
                error.status = error.status || 401;
                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }
                next(error);
            }
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        };
    }
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
//# sourceMappingURL=routes.js.map