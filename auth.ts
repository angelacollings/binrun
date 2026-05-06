import NextAuth from 'next-auth';
import Nodemailer from 'next-auth/providers/nodemailer';
import type { UserRole } from '@prisma/client';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { createTransport } from 'nodemailer';

import { getAuthEnv, getEmailEnv } from '@/lib/env';
import { prisma } from '@/lib/prisma';

const authEnv = getAuthEnv();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = ((user as { role?: UserRole }).role ?? 'CUSTOMER') as UserRole;
      }

      return session;
    },
  },
  providers: [
    Nodemailer({
      from: process.env.EMAIL_FROM ?? 'admin@binrun.co.nz',
      server: {
        jsonTransport: true,
      },
      async sendVerificationRequest({ identifier, url }) {
        const emailEnv = getEmailEnv();
        const transport = createTransport({
          auth: {
            pass: emailEnv.smtpPassword,
            user: emailEnv.smtpUser,
          },
          host: emailEnv.smtpHost,
          port: emailEnv.smtpPort,
          secure: emailEnv.smtpPort === 465,
        });

        await transport.sendMail({
          from: emailEnv.emailFrom,
          html: `<p>Sign in to BinRun:</p><p><a href="${url}">Sign in</a></p>`,
          subject: 'Sign in to BinRun',
          text: `Sign in to BinRun:\n\n${url}\n\nIf you did not request this email, you can ignore it.`,
          to: identifier,
        });
      },
    }),
  ],
  pages: {
    signIn: '/login',
    verifyRequest: '/login/check-email',
  },
  secret: authEnv.authSecret,
  session: {
    strategy: 'database',
  },
  trustHost: authEnv.authTrustHost,
  useSecureCookies: authEnv.secureCookies,
});
