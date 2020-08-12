import { FRONTEND_URL } from "./secrets";
import { PORT } from "./constants";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import { createConnection } from "typeorm";
import cors from "cors";
import "reflect-metadata";
import { graphqlUploadExpress } from "graphql-upload";
import passport from "./passport";
import auth from "./routes/auth";
import createSchema from "./utils/CreateSchema";

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

  // Passport Middleware
  app.use(passport.initialize());

  // Redirect Root to GraphQL
  app.get("/", (_req, res) => res.redirect("/graphql"));

  // OAuth Routes
  app.use("/auth", auth);

  // Applies GraphQL Upload Middleware to App
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

  // Applies CORS to Express App
  app.use(
    cors({
      credentials: true,
      origin: FRONTEND_URL
    })
  );

  // Allows Local Images to be Accessed
  app.use(express.static("images"));

  // Applies Apollo Server Middleware to Express App
  apolloServer.applyMiddleware({ app });

  // Create Server
  app.listen(PORT, () =>
    console.log(`Server Running on http://localhost:${PORT}/graphql...`)
  );
};

main();
