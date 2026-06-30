import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'Senha nova deve ter pelo menos 8 caracteres.' }, { status: 400 });
    }

    const [admin] = await sql`
      SELECT id, password_hash FROM admins WHERE email = ${session.user?.email} LIMIT 1
    `;

    if (!admin) {
      return NextResponse.json({ error: 'Admin não encontrado.' }, { status: 404 });
    }

    const valid = await bcrypt.compare(currentPassword, admin.password_hash as string);
    if (!valid) {
      return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 400 });
    }

    const hash = await bcrypt.hash(newPassword, 12);

    await sql`UPDATE admins SET password_hash = ${hash} WHERE id = ${admin.id}`;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
