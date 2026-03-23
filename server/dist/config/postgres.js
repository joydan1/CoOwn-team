"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postgresLoader = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const env_1 = require("./env");
const { db } = env_1.variables;
const { pg } = db;
const AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: pg.host,
    port: pg.port,
    username: pg.username,
    password: pg.password,
    database: pg.database,
    ssl: {
        rejectUnauthorized: false
    },
    entities: [__dirname + "/../models/**/*.{js,ts}"],
    migrations: [__dirname + "/../migrations/**/*.{js,ts}"],
    logging: true
});
const postgresLoader = async () => {
    await AppDataSource.initialize()
        .then(() => console.log("✅ Connected to Postgres Database"))
        .catch((err) => console.log(`❌ Unable to connect ${err}`));
};
exports.postgresLoader = postgresLoader;
exports.default = AppDataSource;
//# sourceMappingURL=postgres.js.map