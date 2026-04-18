import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: "intellino",
      project: "intellinosentry",
    }),
  ],

  server: {
    proxy: {
      "/api": "http://localhost:8000",
    },
  },

  build: {
    sourcemap: true,
  },
});

// SENTRY_AUTH_TOKEN =
//   sntrys_eyJpYXQiOjE3NzY0Mjc1OTUuODgzMDUzLCJ1cmwiOiJodHRwczovL3NlbnRyeS5pbyIsInJlZ2lvbl91cmwiOiJodHRwczovL2RlLnNlbnRyeS5pbyIsIm9yZyI6ImludGVsbGlubyJ9_CYDJRHGxK4URPk6ylCl2iO /
//     XUo3BGFTF +
//   Rsdh8pqYWg;

//  Test and validate your setup locally with the following Steps:

//    1. Build your application in production mode.
//       → For example, run npm run build.
//       → You should see source map upload logs in your console.
//    2. Run your application and throw a test error.
//       → The error should appear in Sentry:
//       → https://intellino.sentry.io/issues/?project=4511230466392144
//    3. Open the error in Sentry and verify that it's source-mapped.
//       → The stack trace should show your original source code.

//    If you encounter any issues, please refer to the Troubleshooting Guide:
//    https://docs.sentry.io/platforms/javascript/sourcemaps/troubleshooting_js

//    If the guide doesn't help or you encounter a bug, please let us know:
//    https://github.com/getsentry/sentry-javascript/issues
