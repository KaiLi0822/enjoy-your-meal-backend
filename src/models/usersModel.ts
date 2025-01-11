import dynamoDB from "../utils/dynamoClient";
import { User } from "../types/users";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { config } from "../utils/config";

// Function to fetch a user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  const params = {
    TableName: config.usersTable,
    Key: { userId },
  };

  const command = new GetCommand(params);
  const result = await dynamoDB.send(command);
  return result.Item as User || null;
};

// Function to add a user
export const addUserToDB = async (user: User): Promise<void> => {
  const params = {
    TableName: config.usersTable,
    Item: user,
  };

  const command = new PutCommand(params);
  await dynamoDB.send(command);
};



/**
 * Fetches a user by email from the database.
 * @param email - The email of the user to fetch.
 * @returns A `User` object if found, otherwise `null`.
 */
export const getUserByEmail = async (email: string): Promise<User> => {
    const params = {
      TableName: config.usersTable, // Table name from config
      Key: { email }, // DynamoDB uses `email` as the primary key
    };
  
    try {
      const result = await dynamoDB.send(new GetCommand(params));
      return result.Item as User || null;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw new Error("Error fetching user by email");
    }
  };