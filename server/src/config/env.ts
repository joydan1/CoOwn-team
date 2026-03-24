import dotenv from "dotenv";
import * as pkg from "../../package.json";
dotenv.config();

export const variables = {
    app: {
        appName: pkg.name,
        version: pkg.version,
        description: pkg.description,
        author: pkg.author
    },
    port: process.env.PORT,
    db: {
        pg: {
            host: process.env.HOST,
            port: Number(process.env.PG_PORT ?? 5432),
            username: process.env.PG_USERNAME,
            password: process.env.PG_PASSWORD,
            database: process.env.PG_DATABASE,
            synchronize: false,
            migrations: [__dirname + '../migration/**/*{.js,.ts}'],
            migrationsTableName: "migrations"
        }
    },
    jwt: {
        jwtSecret: process.env.JWT_SECRET,
        issuer: process.env.JWT_ISSUER
    },
    passport: {
        google_client_id: process.env.GOOGLE_CLIENT_ID,
        google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.callbackURL
    },
    interswitch: {
        clientId: process.env.IT_CLIENT_ID as string, 
        clientSecret: process.env.IT_SECRET_KEY as string,
        authUrl: process.env.IT_AUTH_URL as string,
        baseUrl: process.env.IT_BASE_URL as string
    },
    ai:{
        gemini: {
            apiKey: process.env.GEMINI_API_KEY as string
        }
    },
    pool: process.env.POOL_INVITE_BASE_URL
}

