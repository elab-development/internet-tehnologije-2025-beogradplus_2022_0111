import { NextResponse } from "next/server";
import { swaggerSpec } from "@/lib/swagger";

/**
 * @openapi
 * /api/docs:
 *   get:
 *     tags:
 *       - Docs
 *     summary: Preuzmi OpenAPI JSON dokument
 *     description: Vraca generisanu OpenAPI specifikaciju koju koristi Swagger UI.
 *     responses:
 *       200:
 *         description: OpenAPI dokument
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 */

export async function GET() {
  return NextResponse.json(swaggerSpec);
}
