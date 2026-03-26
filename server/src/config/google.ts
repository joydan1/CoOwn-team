import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import { variables } from "./env";
import UserService from "../services/user"
import Container from "typedi";

const userService = Container.get(UserService)
 
passport.use(new Strategy(
    {
    clientID: variables.passport.google_client_id as string,
    clientSecret: variables.passport.google_client_secret as string,
    callbackURL: variables.passport.callbackURL as string
},

    async function(accessToken, refreshToken, profile, done){
        try{
            const result = await userService.googleLogin(profile);
            return done(null, result);
    } catch (error){
        return done(error as Error);
    }
} 
));