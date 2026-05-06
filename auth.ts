import NextAuth from 'next-auth';
import type { UserRole } from '@prisma/client';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';

import { getAuthEnv } from '@/lib/env';
import { loginSchema, verifyPassword } from '@/lib/auth/password';
import { prisma } from '@/lib/prisma';

const authEnv = getAuthEnv();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }

      return token;
    },
    session({ session, token, user }) {
      if (session.user) {
        session.user.id = user?.id ?? token.sub ?? '';
        session.user.role = ((user as { role?: UserRole } | undefined)?.role ??
          token.role ??
          'CUSTOMER') as UserRole;
      }

      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          include: {
            passwordCredential: true,
          },
          where: {
            email: parsedCredentials.data.email,
          },
        });

        if (!user?.passwordCredential) {
          return null;
        }

        const passwordMatches = await verifyPassword(
          user.passwordCredential.passwordHash,
          parsedCredentials.data.password
        );

        if (!passwordMatches) {
          return null;
        }

        return {
          email: user.email,
          id: user.id,
          image: user.image,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  secret: authEnv.authSecret,
  session: {
    strategy: 'jwt',
  },
  trustHost: authEnv.authTrustHost,
  useSecureCookies: authEnv.secureCookies,
});
