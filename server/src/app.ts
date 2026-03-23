import "reflect-metadata"; 
import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from './swagger/swagger.json';
import { variables } from "./config/env";
import { postgresLoader } from "./config/postgres"; 
import { RegisterRoutes } from "./swagger/routes/routes";
import { errorHandler } from "./middlewares/errorHandler";
import passport from "passport";
import googleAuthRoutes from "./routes/googleAuth";
import {requestLogger} from "./middlewares/requestLogger";
import "./config/google";
//import { initWebSocket } from "./config/websocket";
import http from "http";
import cors from "cors";


const port = variables.port || 4000;
 
const app = express();


app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());
app.use(passport.initialize());
app.use("/auth", googleAuthRoutes);
app.use('/swagger/api', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(requestLogger)
RegisterRoutes(app);
app.use(errorHandler)

const server = http.createServer(app);
//initWebSocket(server);

server.listen(port, async () => {
    console.log(`${variables.app.appName} running on port ${port}`);
    await postgresLoader();
    console.log(`See swagger documentation here http://localhost:${port}/swagger/api`)
} )