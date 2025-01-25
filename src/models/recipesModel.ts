import { ScanCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDB from "../utils/dynamoClient";
import { Recipe } from "../types/recipes";
import { config } from "../utils/config"; // Import the config object
import { enrichRecipesWithS3Urls } from "./s3Model";


/**
 * Fetch all recipes from the DynamoDB table.
 */
export const fetchAllRecipes = async (): Promise<Recipe[]> => {
  try {
    console.log("fetchAllRecipes")
    const params = {
      TableName: config.table,
      IndexName: "GSI1PK-GSI1SK-index",
      KeyConditionExpression: "GSI1PK = :recipe",
      ExpressionAttributeValues: {
        ":recipe": "recipe",
      },
    };

    const command = new QueryCommand(params);
    const result = await dynamoDB.send(command);
    // Convert raw DynamoDB items to Recipe[] type
    const recipes = (result.Items as Recipe[]) || [];
    return await enrichRecipesWithS3Urls(recipes);
  } catch (error) {
    console.error("Error fetching recipes from DynamoDB:", error);
    throw new Error("Failed to fetch recipes");
  }
};


