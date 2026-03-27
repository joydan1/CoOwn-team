import * as bcrypt from 'bcrypt';
import User from "../models/user";
import {variables} from "../config/env";
import * as jwt from "jsonwebtoken";


export async function hashString(input: string): Promise<string>{
        if(!input) return "";
        const saltRounds = 10;

        const salt = bcrypt.genSaltSync(saltRounds);
        const hash =  bcrypt.hashSync(input, salt);

        return hash;
}

export async function compareHash(input: string, hash: string): Promise<boolean>{
    const status = bcrypt.compareSync(input, hash);
    return status;
}

export async function generateAccessToken(email: string, id: string){
    const payload = {
        email, id
    }

   return jwt.sign(
    payload
   , variables.jwt.jwtSecret as string, { expiresIn: '1h', issuer: variables.jwt.issuer as string })

}


export async function generateRefreshToken(email: string, id: string){
    const payload = {
        email, id
    }

   return jwt.sign(
    payload
   , variables.jwt.jwtSecret as string, { expiresIn: '7d', issuer: variables.jwt.issuer as string })

}

export async function verifyToken(token: string){
    return jwt.verify(token, variables.jwt.jwtSecret as string, {
        issuer: variables.jwt.issuer
    });
}

// export function cleanedUser(input: Partial<User>){
//     delete input.password;
//     delete input.token;
//     return input;
// }

export function cleanedUser(input: Partial<User>): Partial<User> {
    const { password, token, ...rest } = input;
    return rest;
}


