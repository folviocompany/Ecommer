import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

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
        const hash = process.env.ADMIN_PASSWORD_HASH;
        if (!hash) return null;
        const valid =
          credentials.email === process.env.ADMIN_EMAIL &&
          (await bcrypt.compare(credentials.password, hash));
        if (valid) return { id: '1', email: credentials.email, name: 'Admin' };
        return null;
      },
    }),
  ],
  pages: { signIn: '/admin/login' },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
};
