import { Context as OakContext } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { validateJwt } from "https://deno.land/x/djwt@2.8/validate.ts";

// See: https://github.com/asad-mlbd/deno-api-starter-oak/blob/master/middlewares/jwt-auth.middleware.ts

/**
 * Custom appilication context
 */
export class Context extends OakContext {
  user?: AuthUser;
}

/** User role type */
export enum UserRole {
  USER = "User",
  ADMIN = "Admin",
}

/**
 * list of user roles
 */
export const UserRoles = [
  UserRole.ADMIN,
  UserRole.USER,
];


/**
 * Authenticated user info
 * user as JWT access token payload
 */
export type AuthUser = {
  /** user id */
  id: number;
  /** user email address */
  email: string;
  /** user name */
  name: string;
  /** user roles */
  roles: string;
};

/**
 * Decode token and returns payload
 * if given token is not expired 
 * and valid with respect to given `secret`
 */
const getJwtPayload = async (token: string, secret: string): Promise<any | null> => {
  try {
    const jwtObject = await validateJwt(token, secret);
    if (jwtObject && jwtObject.payload) {
      return jwtObject.payload;
    }
  } catch (err) { }
  return null;
};


/***
 * JWTAuth middleware
 * Decode authorization bearer token
 * and attach as an user in application context
 */
const JWTAuthMiddleware = (JWTSecret: string) => {
  return async (
    ctx: Context,
    next: () => Promise<void>,
  ) => {
    try {
      const authHeader = ctx.request.headers.get("Authorization");
      if (authHeader) {
        const token = authHeader.replace(/^bearer/i, "").trim();
        const user = await getJwtPayload(token, JWTSecret);

        if (user) {
          ctx.user = user as AuthUser;
        }
      }
    } catch (err) { }

    await next();
  };

}

export { JWTAuthMiddleware };