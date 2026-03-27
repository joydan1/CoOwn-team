import { Service } from "typedi";
import {
    Controller,
    Route,
    Get,
    Tags,
    Response
} from "tsoa";
import { variables } from "../config/env";

interface PaymentConfigDto {
    merchantCode: string;
    payItemId: string;
    currencyCode: number;
    environment: string;
}

@Service()
@Route("config")
@Tags("Configuration")
export class ConfigController extends Controller {
    
    /**
     * Get payment configuration for Interswitch payment gateway
     */
    @Get("/payment")
    @Response<PaymentConfigDto>(200, "Payment configuration retrieved successfully")
    public async getPaymentConfig(): Promise<PaymentConfigDto> {
        return {
            merchantCode: variables.interswitch.merchantCode || "MX275869",
            payItemId: `Default_Payable_${variables.interswitch.merchantCode || "MX275869"}`,
            currencyCode: 566, // NGN
            environment: process.env.NODE_ENV || "development"
        };
    }
}
