import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/admin/login' },
  callbacks: {
    authorized({ req, token }) {
      if (req.nextUrl.pathname.startsWith('/admin/setup')) return true;
      return !!token;
    },
  },
});

export const config = {
  matcher: ['/admin/((?!login).*)'],
};
