import "reflect-metadata";
import { DataSource } from "typeorm";
import { variables }  from "./env";

const { db } = variables;
const { pg } = db;

const AppDataSource = new DataSource({
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
})

export const postgresLoader = async ()=> {
    await AppDataSource.initialize()
    .then(() => console.log("✅ Connected to Postgres Database") )
    .catch((err) => console.log(`❌ Unable to connect ${err}`));
}

export default AppDataSource;