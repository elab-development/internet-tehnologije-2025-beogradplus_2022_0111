import fs from "fs";
import path from "path";
import swaggerJSDoc from "swagger-jsdoc";

function collectApiRouteFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectApiRouteFiles(fullPath));
      continue;
    }

    if (entry.isFile() && (entry.name === "route.ts" || entry.name === "route.js")) {
      files.push(fullPath.replace(/\\/g, "/"));
    }
  }

  return files;
}

function resolveProjectRoot(): string {
  const candidates = [
    process.cwd(),
    process.env.INIT_CWD,
    path.resolve(process.cwd(), ".."),
    path.resolve(process.cwd(), "..", ".."),
    path.resolve(process.cwd(), "..", "..", ".."),
    path.resolve(process.cwd(), "..", "..", "..", ".."),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "src", "app", "api"))) {
      return candidate;
    }
  }

  return process.cwd();
}

const apiRoutesGlobs = [
  "src/app/api/**/route.ts",
  "./src/app/api/**/route.ts",
  "src/app/api/**/route.js",
  "./src/app/api/**/route.js",
];

const projectRoot = resolveProjectRoot();
const apiRouteFiles = collectApiRouteFiles(path.join(projectRoot, "src", "app", "api"));
const fallbackGlobs = apiRoutesGlobs.map((glob) => path.join(projectRoot, glob).replace(/\\/g, "/"));

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BeogradPlus API",
      version: "1.0.0",
      description: "Zvanicna API dokumentacija za BeogradPlus.",
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        description: "Aplikacioni server",
      },
    ],
    tags: [
      { name: "Auth", description: "Endpointi za autentikaciju i autorizaciju" },
      { name: "Stations", description: "CRUD operacije za stanice" },
      { name: "Lines", description: "CRUD operacije za linije i veze sa stanicama" },
      { name: "Favorites", description: "Omiljene stanice i linije korisnika" },
      { name: "Admin", description: "Endpointi dostupni samo administratoru" },
      { name: "Docs", description: "Endpointi za OpenAPI dokumentaciju" },
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
            tip: { type: "integer", example: 1, description: "1 autobus, 2 tramvaj, 3 trolejbus" },
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
            uloga_id: { type: "integer", example: 2, description: "1 korisnik, 2 admin" },
          },
          required: ["email", "uloga_id"],
        },
      },
    },
  },
  apis: apiRouteFiles.length > 0 ? apiRouteFiles : fallbackGlobs,
};

export const swaggerSpec = swaggerJSDoc(options);
