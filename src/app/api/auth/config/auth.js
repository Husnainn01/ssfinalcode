import CredentialsProvider from "next-auth/providers/credentials"
import mongoose from 'mongoose'
import dbConnect from "@/lib/dbConnect"
import bcrypt from "bcryptjs"

// Define User Schema to match your database
const UserSchema = new mongoose.Schema({
  name: String,
  lastName: String,
  email: String,
  password: String,
  phoneNumber: {
    number: String,
    countryCode: String
  },
  address: {
    postCode: String,
    country: String,
    port: String
  },
  status: String,
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}, { collection: 'customerusers' })

// Get the model, or create it if it doesn't exist
const User = mongoose.models.User || mongoose.model('User', UserSchema)

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          await dbConnect()
          
          const user = await User.findOne({ 
            email: credentials.email 
          })

          if (!user) {
            throw new Error('No user found with this email')
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!passwordMatch) {
            throw new Error('Incorrect password')
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            lastName: user.lastName
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub
        session.user.lastName = token.lastName
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.lastName = user.lastName
      }
      return token
    }
  }
} 