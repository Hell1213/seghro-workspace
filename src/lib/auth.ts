import NextAuth, { type NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: string
      orgId: string | null
    } & DefaultSession['user']
  }
  interface User {
    role?: string
    orgId?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    orgId: string | null
  }
}

const providers: any[] = []

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  )
}

providers.push(
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Email and password are required')
      }

      const user = await db.user.findUnique({
        where: { email: credentials.email },
      })

      if (!user) {
        throw new Error('No account found with that email')
      }

      if (user.password) {
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) {
          throw new Error('Invalid password')
        }
      } else {
        throw new Error('This account uses OAuth. Please sign in with Google or GitHub.')
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        orgId: user.orgId,
      }
    },
  })
)

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!
        token.role = user.role || 'viewer'
        token.orgId = user.orgId || null
      }
      if (trigger === 'update' && session) {
        const updatedUser = await db.user.findUnique({ where: { id: token.id } })
        if (updatedUser) {
          token.role = updatedUser.role
          token.orgId = updatedUser.orgId
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.orgId = token.orgId
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
