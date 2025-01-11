import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDB from "../utils/dynamoClient";
import { Recipe } from "../types/recipes";
import { config } from "../utils/config"; // Import the config object

/**
 * Fetch all recipes from the DynamoDB table.
 */
export const fetchAllRecipes = async (): Promise<Recipe[]> => {
  try {
    const params = { TableName: config.recipesTable }; // Use the table name from config
    const command = new ScanCommand(params);
    const data = await dynamoDB.send(command);

    // Convert raw DynamoDB items to Recipe[] type
    return (data.Items as Recipe[]) || [];
  } catch (error) {
    console.error("Error fetching recipes from DynamoDB:", error);
    throw new Error("Failed to fetch recipes");
  }
};
