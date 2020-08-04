import faker from "faker";
import graphqlRequest from "../../../testing/request";
import RegisterInput from "../input/RegisterInput";
import User from "../../../entities/User";
import runTest from "../../../testing/TestFramework";

// Register Test Mutation
const registerMutation: string = `
mutation Register($data: RegisterInput!) {
    registerConfirmed(data: $data) {
        id
        username
        email
        imageURL
    }
}
`;

// Login With Email Test Mutation
const loginEmailMutation: string = `
mutation LoginEmail($email: String!, $password: String!) {
    loginEmail(email: $email, password: $password) {
        id
        username
        email
        imageURL
    }
}
`;

// Login With Username Test Mutation
const loginUsernameMutation: string = `
mutation LoginUsername($username: String!, $password: String!) {
    loginUsername(username: $username, password: $password) {
        id
        username
        email
        imageURL
    }
}
`;

// Register Test
const registerTest = (
  register: string,
  loginEmail: string,
  loginUsername: string
) => {
  // Creates User
  const username: string = (faker.name.firstName() + faker.name.lastName())
    .toLowerCase()
    .substring(0, 30);

  // Register Test User
  const registerUser: RegisterInput = {
    username,
    email: `${username}@gmail.com`,
    password: faker.internet.password()
  };

  describe("Register", () => {
    it("Create User", async () => {
      // Register Test Variables
      const registerVariables: { [k: string]: RegisterInput } = {
        data: registerUser
      };

      // Completes GraphQL Request
      const response: any = await graphqlRequest({
        source: register,
        variableValues: registerVariables
      });

      // Verifies if Username and Email match
      expect(response).toMatchObject({
        data: {
          registerConfirmed: {
            username: registerUser.username,
            email: registerUser.email
          }
        }
      });

      // Verifies if Database Entry Worked
      const dbUser = await User.findOne({
        where: { email: registerUser.email }
      });
      expect(dbUser).toBeDefined();
      // expect(dbUser!.confirmed).toBeFalsy();
      expect(dbUser!.username).toBe(registerUser.username);
    });

    it("Login User with Email", async () => {
      // Email Test Variables
      const emailVariables: { [k: string]: string } = {
        email: registerUser.email,
        password: registerUser.password
      };

      // Completes GraphQL Request
      const response: any = await graphqlRequest({
        source: loginEmail,
        variableValues: emailVariables
      });

      // Verifies if Username and Email match
      expect(response).toMatchObject({
        data: {
          loginEmail: {
            username: registerUser.username,
            email: registerUser.email
          }
        }
      });
    });

    it("Login User with Username", async () => {
      // Username Test Variables
      const usernameVariables: { [k: string]: string } = {
        username: registerUser.username,
        password: registerUser.password
      };

      // Completes GraphQL Request
      const response: any = await graphqlRequest({
        source: loginUsername,
        variableValues: usernameVariables
      });

      // Verifies if Username and Email match
      expect(response).toMatchObject({
        data: {
          loginUsername: {
            username: registerUser.username,
            email: registerUser.email
          }
        }
      });
    });
  });
};

runTest(() =>
  registerTest(registerMutation, loginEmailMutation, loginUsernameMutation)
);
