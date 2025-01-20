import { ScanCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDB from "../utils/dynamoClient";
import { Recipe } from "../types/recipes";
import { config } from "../utils/config"; // Import the config object

/**
 * Fetch all recipes from the DynamoDB table.
 */
export const fetchAllRecipes = async (): Promise<Recipe[]> => {
  try {
    const params = {
      TableName: config.table,
      IndexName: "GSI1PK-index",
      KeyConditionExpression: "GSI1PK = :recipe",
      ExpressionAttributeValues: {
        ":recipe": "recipe",
      },
    };

    const command = new QueryCommand(params);
    const result = await dynamoDB.send(command);
    // Convert raw DynamoDB items to Recipe[] type
    return (result.Items as Recipe[]) || [];
  } catch (error) {
    console.error("Error fetching recipes from DynamoDB:", error);
    throw new Error("Failed to fetch recipes");
  }
};

// Fetch all recipes for a user
export const getRecipesByUser = async (
  userEmail: string
): Promise<Recipe[]> => {
  const params = {
    TableName: config.table,
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :recipePrefix)",
    ExpressionAttributeValues: {
      ":pk": `user#${userEmail}`, // Partition key format
      ":recipePrefix": "recipe#", // Filter by recipes
    },
  };

  const command = new QueryCommand(params);
  const result = await dynamoDB.send(command);

  // Map the DynamoDB response to the `Recipe` type
  return result.Items as Recipe[];
};

// fetch recipes for a user's specific menu.
export const getRecipesByUserMenu = async (
    userEmail: string,
    menuId: string
  ): Promise<Recipe[]> => {
    const params = {
      TableName: config.table,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: {
        ":pk": `user#${userEmail}1${menuId}`, // Partition key
      },
    };

    const command = new QueryCommand(params);
    const result = await dynamoDB.send(command);
  
    // Map the DynamoDB response to the `Recipe` type
    return result.Items as Recipe[];
  };
