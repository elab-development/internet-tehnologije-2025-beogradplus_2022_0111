import path from "path";
import swaggerJSDoc from "swagger-jsdoc";

const apiRoutesGlob = path
  .join(process.cwd(), "src/app/api/**/route.ts")
  .replace(/\\/g, "/");

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BeogradPlus API",
      version: "1.0.0",
      description: "Official API documentation for BeogradPlus.",
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        description: "App server",
      },
    ],
    tags: [
      { name: "Auth", description: "Authentication and authorization endpoints" },
      { name: "Stations", description: "Station CRUD operations" },
      { name: "Lines", description: "Line CRUD operations and relations with stations" },
      { name: "Favorites", description: "User favorite stations and lines" },
      { name: "Admin", description: "Admin-only endpoints" },
      { name: "Docs", description: "OpenAPI documentation endpoints" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string", example: "Something went wrong" },
          },
          required: ["error"],
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
          },
          required: ["success"],
        },
        Station: {
          type: "object",
          properties: {
            stanica_id: { type: "integer", example: 123 },
            naziv: { type: "string", example: "Studentski trg" },
            lat: { type: "number", example: 44.8178 },
            lng: { type: "number", example: 20.4571 },
            aktivna: { type: "boolean", example: true },
          },
          required: ["naziv", "lat", "lng", "aktivna"],
        },
        Line: {
          type: "object",
          properties: {
            linija_id: { type: "integer", example: 24 },
            broj: { type: "string", example: "95" },
            tip: { type: "integer", example: 1, description: "1 bus, 2 tram, 3 trolleybus" },
            ime_linije: { type: "string", example: "Novi Beograd - Borca 3" },
            aktivna: { type: "boolean", example: true },
          },
          required: ["broj", "tip", "ime_linije", "aktivna"],
        },
        FavoriteStation: {
          type: "object",
          properties: {
            os_id: { type: "integer", example: 1 },
            stanica_id: { type: "integer", example: 123 },
            korisnik_id: { type: "integer", example: 10 },
          },
          required: ["stanica_id", "korisnik_id"],
        },
        FavoriteLine: {
          type: "object",
          properties: {
            ol_id: { type: "integer", example: 1 },
            linija_id: { type: "integer", example: 24 },
            korisnik_id: { type: "integer", example: 10 },
          },
          required: ["linija_id", "korisnik_id"],
        },
        AuthUser: {
          type: "object",
          properties: {
            korisnik_id: { type: "integer", example: 10 },
            uloga_id: { type: "integer", example: 1 },
          },
          required: ["korisnik_id", "uloga_id"],
        },
        LoginRequest: {
          type: "object",
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            password: { type: "string", format: "password", example: "secret123" },
            ime: { type: "string", example: "Petar Petrovic" },
            akcija: { type: "string", enum: ["log", "reg"], example: "log" },
          },
          required: ["email", "password", "akcija"],
        },
        LoginResponse: {
          type: "object",
          properties: {
            token: { type: "string", example: "eyJhbGciOi..." },
            korisnik: {
              type: "object",
              additionalProperties: true,
            },
          },
          required: ["token", "korisnik"],
        },
        PromoteRequest: {
          type: "object",
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            uloga_id: { type: "integer", example: 2, description: "1 user, 2 admin" },
          },
          required: ["email", "uloga_id"],
        },
      },
    },
  },
  apis: [apiRoutesGlob],
};

export const swaggerSpec = swaggerJSDoc(options);
