import { NextResponse } from "next/server";
import { swaggerSpec } from "@/lib/swagger";

/**
 * @swagger
 * /api/docs:
 *   get:
 *     tags:
 *       - Docs
 *     summary: Get OpenAPI JSON document
 *     description: Returns the generated OpenAPI specification used by Swagger UI.
 *     responses:
 *       200:
 *         description: OpenAPI document
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 */

export async function GET() {
  return NextResponse.json(swaggerSpec);
}
