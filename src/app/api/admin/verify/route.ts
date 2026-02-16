import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * @openapi
 * /api/admin/verify:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Proveri JWT token i vrati korisnicke claim-ove
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token je validan.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 korisnik:
 *                   $ref: '#/components/schemas/AuthUser'
 *       401:
 *         description: Token nedostaje ili nije validan.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export async function GET(request: NextRequest) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return NextResponse.json({ error: 'No token' }, { status: 401 });
    }
    
    try {
        const podaci = jwt.verify(token, JWT_SECRET) as any;
        
        return NextResponse.json({ korisnik: podaci }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}

