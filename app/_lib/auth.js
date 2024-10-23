import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createGuest, getGuest } from "./data-service";

// const authConfig = {
//   providers: [
//     Google({
//       clientId: process.env.AUTH_GOOGLE_ID,
//       clientSecret: process.env.AUTH_GOOGLE_SECRET,
//     }),
//   ],
//   callbacks: {
//     authorized({ auth, request }) {
//       return !!auth?.user;
//     },
//     async signIn({ user, account, profile }) {
//       try {
//         const existingGuest = await getGuest(user.email);

//         if (!existingGuest)
//           await createGuest({ email: user.email, fullName: user.name });

//         return true;
//       } catch {
//         return false;
//       }
//     },
//     async session({ session, user }) {
//       const guest = await getGuest(session.user.email);
//       session.user.guestId = guest.id;
//       return session;
//     },
//   },
//   pages: {
//     signIn: "/login",
//   },
// };

// export const {
//   auth,
//   signIn,
//   signOut,
//   handlers: { GET, POST },
// } = NextAuth(authConfig);

const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      return !!auth?.user;
    },
    async signIn({ user, account, profile }) {
      try {
        const existingGuest = await getGuest(user.email);

        if (!existingGuest) {
          await createGuest({ email: user.email, fullName: user.name });
        }

        return true;
      } catch (error) {
        console.error("Error during sign-in:", error);
        return false;
      }
    },
    async session({ session, user }) {
      try {
        const guest = await getGuest(session.user.email);

        if (guest) {
          session.user.guestId = guest.id; // Only assign if guest exists
        } else {
          console.error(`Guest not found for email: ${session.user.email}`);
        }

        return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        return session; // Return the session even if an error occurs
      }
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);
