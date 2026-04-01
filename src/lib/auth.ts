import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// Build providers array conditionally
const providers: any[] = [
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Invalid credentials')
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
        include: {
          store: {
            include: {
              subscription: true,
            },
          },
        },
      })

      if (!user || !user.password) {
        throw new Error('Invalid credentials')
      }

      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password
      )

      if (!isPasswordValid) {
        throw new Error('Invalid credentials')
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        storeId: user.store?.id,
        plan: user.store?.subscription?.plan as any,
      }
    },
  }),
]

// Add Google OAuth only if credentials are set
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

// Add Facebook OAuth only if credentials are set
if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  providers.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'public_profile email',
        },
      },
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email || `${profile.id}@facebook.com`,
          image: profile.picture?.data?.url,
        }
      },
    })
  )
}

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async signIn({ user, account }) {
      // Handle OAuth sign in (Google, Facebook)
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { store: true },
        })

        if (existingUser) {
          // Link OAuth account to existing user
          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
          })

          if (!existingAccount) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
            })
          }

          return true
        }

        // Create new user with OAuth
        const newUser = await prisma.user.create({
          data: {
            email: user.email!,
            name: user.name || user.email!.split('@')[0],
            image: user.image,
            password: '', // No password for OAuth users
            emailVerified: new Date(),
          },
        })

        // Create account link
        await prisma.account.create({
          data: {
            userId: newUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
          },
        })

        // Auto-create store for new OAuth users
        const storeName = user.name || user.email!.split('@')[0]
        const storeSlug = storeName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now()

        await prisma.store.create({
          data: {
            name: storeName + "'s Store",
            slug: storeSlug,
            userId: newUser.id,
            subscription: {
              create: {
                plan: 'FREE',
                status: 'ACTIVE',
              },
            },
          },
        })

        return true
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        
        // Fetch store info for OAuth users
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            store: {
              include: {
                subscription: true,
              },
            },
          },
        })

        token.storeId = dbUser?.store?.id
        token.plan = dbUser?.store?.subscription?.plan as any
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.storeId = token.storeId as string
        session.user.plan = token.plan as any
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
