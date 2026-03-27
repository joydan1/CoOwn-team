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
import { initWebSocket } from "./config/websocket";
import http from "http";
import cors from "cors";


const port = variables.port || 5000;
 
const app = express();


app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());
app.use(passport.initialize());
app.use("/api/auth", googleAuthRoutes);
app.use('/swagger/api', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.static('public'));

app.use((req, res, next) => {
    // Disable CSP for development/testing
    if (req.path.includes('interswitch-test')) {
        res.setHeader("Content-Security-Policy", "");
    } else {
        res.setHeader(
            "Content-Security-Policy",
            "default-src 'self' https://newwebpay.qa.interswitchng.com https://www.clarity.ms https://h.online-metrix.net; " +
            "script-src 'self' 'unsafe-inline' https://newwebpay.qa.interswitchng.com https://www.clarity.ms https://h.online-metrix.net; " +
            "connect-src 'self' https://newwebpay.qa.interswitchng.com https://www.clarity.ms https://h.online-metrix.net http://localhost:4000 http://localhost:3000; " +
            "frame-src 'self' https://newwebpay.qa.interswitchng.com; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' https://newwebpay.qa.interswitchng.com data:;"
        );
    }
    next();
});

app.use(requestLogger)
RegisterRoutes(app);
app.use(errorHandler)

const server = http.createServer(app);
initWebSocket(server);

server.listen(port, async () => {
    console.log(`${variables.app.appName} running on port ${port}`);
    await postgresLoader();
    console.log(`See swagger documentation here http://localhost:${port}/swagger/api`)
} )