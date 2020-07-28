import { Connection } from "typeorm";
import faker from "faker";
import testConnection from "../../../testing/TestConnect";
import graphqlRequest from "../../../testing/request";
import RegisterInput from "../input/RegisterInput";
import User from "../../../entity/User";

let dbConnection: Connection;

// Connects to Test Database Before Test
beforeAll(async () => {
  dbConnection = await testConnection();
});

// Closes Test Databse Connection After Test
afterAll(async () => {
  await dbConnection.close();
});

// Register Test Query
const registerTest: string = `
mutation Register($data: RegisterInput!) {
    register(data: $data) {
        id
        username
        email
        imageURL
    }
}
`;

// Register Test User
const registerUser: RegisterInput = {
  username: (faker.name.firstName() + faker.name.lastName()).toLowerCase(),
  email: faker.internet.email(),
  password: faker.internet.password()
};

// Register Test Variables
const registerVariables: { [k: string]: RegisterInput } = {
  data: registerUser
};

// Register Test
describe("Register", () => {
  it("Create User", async () => {
    // Completes GraphQL Request
    const response: any = await graphqlRequest({
      source: registerTest,
      variableValues: registerVariables
    });

    console.log(response);

    // Verifies if Username and Email match
    expect(response).toMatchObject({
      data: {
        register: {
          username: registerUser.username,
          email: registerUser.email
        }
      }
    });

    // Verifies if Database Entry Worked
    const dbUser = await User.findOne({ where: { email: registerUser.email } });
    expect(dbUser).toBeDefined();
    expect(dbUser!.confirmed).toBeFalsy();
    expect(dbUser!.username).toBe(registerUser.username);
  });
});
