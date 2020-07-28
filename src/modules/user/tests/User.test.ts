import { Connection } from "typeorm";
import faker from "faker";
import testConnection from "../../../testing/TestConnect";
import graphqlRequest from "../../../testing/request";
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

// User Test Query
const userTest: string = `
{
    getOwnUser {
        id
        username
        email
        imageURL
    }
}
`;

// User Test
describe("User Details", () => {
  it("Get User", async () => {
    // Test User
    const user = await User.create({
      username: (faker.name.firstName() + faker.name.lastName()).toLowerCase(),
      email: faker.internet.email(),
      password: faker.internet.password()
    }).save();

    // Completes GraphQL Request
    const response: any = await graphqlRequest({
      source: userTest,
      userId: user.id
    });

    // Verifies if ID, Username, and Email match
    expect(response).toMatchObject({
      data: {
        getOwnUser: {
          id: `${user.id}`,
          username: user.username,
          email: user.email
        }
      }
    });
  });

  it("Return Null", async () => {
    // Completes GraphQL Request
    const response = await graphqlRequest({
      source: userTest
    })

    // Verifies if Data is Null
    expect(response).toMatchObject({
      data: {
        getOwnUser: null
      }
    });
  })
});
