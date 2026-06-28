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
        if (
          credentials.email === process.env.ADMIN_EMAIL &&
          bcrypt.compareSync(credentials.password, process.env.ADMIN_PASSWORD_HASH!)
        ) {
          return { id: '1', email: credentials.email, name: 'Admin' };
        }
        return null;
      },
    }),
  ],
  pages: { signIn: '/admin/login' },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
};
