"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("./swagger/swagger.json"));
const env_1 = require("./config/env");
const postgres_1 = require("./config/postgres");
const routes_1 = require("./swagger/routes/routes");
const errorHandler_1 = require("./middlewares/errorHandler");
const passport_1 = __importDefault(require("passport"));
const googleAuth_1 = __importDefault(require("./routes/googleAuth"));
const requestLogger_1 = require("./middlewares/requestLogger");
require("./config/google");
const websocket_1 = require("./config/websocket");
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const port = env_1.variables.port || 4000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express_1.default.json());
app.use(passport_1.default.initialize());
app.use("/auth", googleAuth_1.default);
app.use('/swagger/api', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
app.use(express_1.default.static('public'));
app.use((req, res, next) => {
    // Disable CSP for development/testing
    if (req.path.includes('interswitch-test')) {
        res.setHeader("Content-Security-Policy", "");
    }
    else {
        res.setHeader("Content-Security-Policy", "default-src 'self' https://newwebpay.qa.interswitchng.com https://www.clarity.ms https://h.online-metrix.net; " +
            "script-src 'self' 'unsafe-inline' https://newwebpay.qa.interswitchng.com https://www.clarity.ms https://h.online-metrix.net; " +
            "connect-src 'self' https://newwebpay.qa.interswitchng.com https://www.clarity.ms https://h.online-metrix.net http://localhost:5000; " +
            "frame-src 'self' https://newwebpay.qa.interswitchng.com; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' https://newwebpay.qa.interswitchng.com data:;");
    }
    next();
});
app.use(requestLogger_1.requestLogger);
(0, routes_1.RegisterRoutes)(app);
app.use(errorHandler_1.errorHandler);
const server = http_1.default.createServer(app);
(0, websocket_1.initWebSocket)(server);
server.listen(port, async () => {
    console.log(`${env_1.variables.app.appName} running on port ${port}`);
    await (0, postgres_1.postgresLoader)();
    console.log(`See swagger documentation here http://localhost:${port}/swagger/api`);
});
//# sourceMappingURL=app.js.map