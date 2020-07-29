import { Connection } from "typeorm";
import testConnection from "../../testing/TestConnect";

const runTest = (test: () => void) => {
  let dbConnection: Connection;

  // Connects to Test Database Before Test
  beforeAll(async () => {
    dbConnection = await testConnection();
  });

  // Closes Test Databse Connection After Test
  afterAll(async () => {
    await dbConnection.close();
  });

  // Runs Test
  test();
};

export default runTest;
