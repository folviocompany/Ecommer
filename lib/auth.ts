import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const [admin] = await sql`
          SELECT id, name, email, password_hash
          FROM admins
          WHERE email = ${credentials.email}
          LIMIT 1
        `;

        if (!admin) return null;

        const valid = await bcrypt.compare(credentials.password, admin.password_hash as string);
        if (!valid) return null;

        return {
          id: String(admin.id),
          email: admin.email as string,
          name: admin.name as string,
        };
      },
    }),
  ],
  pages: { signIn: '/admin/login' },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
};
