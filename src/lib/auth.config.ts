import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: { signIn: "/studio/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isStudio = pathname.startsWith("/studio");
      const isLoginPage = pathname === "/studio/login";

      if (isLoginPage) {
        if (isLoggedIn) return Response.redirect(new URL("/studio", request.nextUrl));
        return true;
      }
      if (isStudio) return isLoggedIn;
      return true;
    },
  },
} satisfies NextAuthConfig;
