import faker from "faker";
import graphqlRequest from "../../../testing/request";
import User from "../../../entities/User";
import runTest from "../../../testing/TestFramework";

// User Test Query
const userQuery: string = `
{
    getOwnUser {
        id
        username
        email
        imageURL
    }
}
`;

// User Test Code
const userTest = (action: string) => {
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
        source: action,
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
        source: action
      })
  
      // Verifies if Data is Null
      expect(response).toMatchObject({
        data: {
          getOwnUser: null
        }
      });
    })
  });
}

runTest(() => userTest(userQuery))