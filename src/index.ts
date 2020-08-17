import { ApolloServer } from "apollo-server-express";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { graphqlUploadExpress } from "graphql-upload";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { PORT } from "./constants";
import passport from "./passport";
import auth from "./routes/auth";
import { CORS_URLS } from "./secrets";
import createSchema from "./utils/CreateSchema";
import validateTokenMiddleware from "./utils/TokenMiddleware";

const device = require("express-device");

const main = async () => {
  // Connect to DB
  await createConnection();

  // GraphQL Schema
  const schema = await createSchema();

  // Initialize Apollo Server
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }: any) => ({ req, res }),
    uploads: false
  });

  // Create Express Instance
  const app = express();

  // Device Capture Code
  app.use(device.capture());

  // Applies CORS to Express App
  app.use(
    cors({
      credentials: true,
      origin: CORS_URLS
    })
  );

  // Cookie Parsing Middleware
  app.use(cookieParser());

  // Custom User Middleware
  app.use(validateTokenMiddleware);

  // Passport Middleware
  app.use(passport.initialize());

  // Redirect Root to GraphQL
  app.get("/", (_req, res) => res.redirect("/graphql"));

  // OAuth Routes
  app.use("/auth", auth);

  // Applies GraphQL Upload Middleware to App
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

  // Allows Local Images to be Accessed
  app.use(express.static("images"));

  // Applies Apollo Server Middleware to Express App
  apolloServer.applyMiddleware({ app, cors: false });

  // Create Server
  app.listen(PORT, () =>
    console.log(`Server Running on http://localhost:${PORT}/graphql...`)
  );
};

main();
