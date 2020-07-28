import { buildSchema } from "type-graphql";

// Builds GraphQL Schema
const createSchema = () =>
  buildSchema({
    resolvers: [__dirname + "/../modules/**/*.resolver.ts"]
  });

export default createSchema;
