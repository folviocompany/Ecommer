import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';

export async function GET() {
  try {
    const setupToken = process.env.SETUP_TOKEN;
    if (!setupToken) return NextResponse.json({ available: false });

    const [existing] = await sql`SELECT id FROM admins LIMIT 1`;
    return NextResponse.json({ available: !existing });
  } catch {
    return NextResponse.json({ available: false });
  }
}

export async function POST(request: NextRequest) {
  try {
    const setupToken = process.env.SETUP_TOKEN;
    if (!setupToken) {
      return NextResponse.json({ error: 'Setup não disponível' }, { status: 403 });
    }

    const { token, name, email, password } = await request.json();

    if (token !== setupToken) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
    }

    const [existing] = await sql`SELECT id FROM admins LIMIT 1`;
    if (existing) {
      return NextResponse.json({ error: 'Setup já realizado' }, { status: 403 });
    }

    if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
      return NextResponse.json({ error: 'Preencha todos os campos. Senha mínima: 8 caracteres.' }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 12);

    await sql`
      INSERT INTO admins (name, email, password_hash)
      VALUES (${name.trim()}, ${email.trim().toLowerCase()}, ${hash})
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
