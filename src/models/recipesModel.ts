import { ScanCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDB from "../utils/dynamoClient";
import { Recipe } from "../types/recipes";
import { config } from "../utils/config"; // Import the config object
import { generateS3ReadableUrl } from "./s3Model";

/**
 * Replace the `cover` property with a readable S3 URL for all recipes.
 */
const enrichRecipesWithS3Urls = async (recipes: Recipe[]): Promise<Recipe[]> => {
  return await Promise.all(
    recipes.map(async (recipe) => {
      if (recipe.cover) {
        try {
          recipe.cover = await generateS3ReadableUrl(recipe.cover);
        } catch (error) {
          console.error(
            `Failed to generate S3 URL for recipe ${recipe.name}:`,
            error
          );
          throw error;
        }
      }
      return recipe;
    })
  );
};

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
    const recipes = (result.Items as Recipe[]) || [];
    return await enrichRecipesWithS3Urls(recipes);
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
  const recipes = (result.Items as Recipe[]) || [];
  return await enrichRecipesWithS3Urls(recipes);
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
    const recipes = (result.Items as Recipe[]) || [];
    return await enrichRecipesWithS3Urls(recipes);
  };
