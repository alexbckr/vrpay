// pages/api/auth/[...nextauth].ts
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextApiHandler } from "next"
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "../../../lib/prisma.js"

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, options)
export default authHandler

const options = {
   providers: [
      GoogleProvider({
         clientId: process.env.GOOGLE_ID,
         clientSecret: process.env.GOOGLE_SECRET,
      }),
   ],
   //   https://next-auth.js.org/configuration/callbacks
   adapter: PrismaAdapter(prisma),
   secret: process.env.SECRET,
   jwt: {
      encryption: true,
      secret: process.env.SECRET,
   },
   callbacks: {
      async jwt({ token, user, account, profile, isNewUser }) {
         if (account) {
            token.is_verified = account?.is_verified
            token.role = account?.role
         }
         return token
      },
      async session({ session, user, token }) {
         session.is_verified = user?.is_verified
         session.uid = user?.id
         session.role = user?.role
         session.name = user?.name
         session.is_rookie = user?.is_rookie

         //this is not ideal
         session.user_info = user

         return session
      },
   },
}
