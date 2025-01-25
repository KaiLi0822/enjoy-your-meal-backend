import dynamoDB from "../utils/dynamoClient";
import { User } from "../types/users";
import {
  BatchWriteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { config } from "../utils/config";
import { Menu } from "../types/menu";
import { Recipe } from "../types/recipes";
import { enrichRecipesWithS3Urls } from "./s3Model";

// Function to add a user
export const addToDB = async (item: any): Promise<void> => {
  const params = {
    TableName: config.table,
    Item: item,
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
    TableName: config.table, // Table name from config
    Key: {
      PK: `user#${email}`,
      SK: "profile",
    },
  };

  try {
    const result = await dynamoDB.send(new GetCommand(params));
    return (result.Item as User) || null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw new Error("Error fetching user by email");
  }
};

const deleteItems = async (items: any[]): Promise<void> => {
  try {
    const chunkSize = 25; // DynamoDB's limit for batch operations
    const itemChunks = [];

    // Split items into chunks of 25
    for (let i = 0; i < items.length; i += chunkSize) {
      itemChunks.push(items.slice(i, i + chunkSize));
    }

    // Process each chunk
    for (const chunk of itemChunks) {
      const deleteRequests = chunk.map((item) => ({
        DeleteRequest: {
          Key: {
            PK: item.PK,
            SK: item.SK,
          },
        },
      }));

      const params = {
        RequestItems: {
          [config.table]: deleteRequests,
        },
      };

      const command = new BatchWriteCommand(params);
      await dynamoDB.send(command);
    }

    console.log("Items deleted successfully");
  } catch (error) {
    console.error("Error deleting items:", error);
    throw error;
  }
};

const queryUserMenusForDeletion = async (
  userEmail: string,
  menuName: string
): Promise<any[]> => {
  try {
    // Get Menu where PK = userEmail and SK = menuName
    const getParams = {
      TableName: config.table, // Table name from config
      Key: {
        PK: `user#${userEmail}`,
        SK: `menu#${menuName}`,
      },
    };
    const menu = await dynamoDB.send(new GetCommand(getParams));

    // Query Recipes in the menu
    const queryParams = {
      TableName: config.table,
      KeyConditionExpression: "PK = :userMenu",
      ExpressionAttributeValues: {
        ":userMenu": `user#${userEmail}1menu#${menuName}`,
      },
    };
    const menuRecipes = await dynamoDB.send(new QueryCommand(queryParams));

    // Ensure consistent array structure
    const menuItem = menu.Item ? [menu.Item] : [];
    const recipeItems = menuRecipes.Items || [];

    return [...menuItem, ...recipeItems];
  } catch (error) {
    console.error("Error querying items for deletion:", error);
    throw error;
  }
};

// Fetch all menus for a user
export const getMenusByUser = async (userEmail: string): Promise<Menu[]> => {
  const params = {
    TableName: config.table, // Replace with your table name from the config
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :menuPrefix)", // Query by user PK and menu SK
    ExpressionAttributeValues: {
      ":pk": `user#${userEmail}`, // Partition key format
      ":menuPrefix": "menu#", // Filter by menus
    },
  };

  const command = new QueryCommand(params);
  const result = await dynamoDB.send(command);

  // Map the DynamoDB response to the `Menu` type
  return result.Items as Menu[];
};

// Delete a menu by ID
export const deleteMenuAndRelatedItems = async (
  userEmail: string,
  menuName: string
): Promise<boolean> => {
  try {
    // Step 1: Query all items with PK or SK equal to the menu ID
    const itemsToDelete = await queryUserMenusForDeletion(userEmail, menuName);

    if (itemsToDelete.length === 0) {
      console.log("No items found for deletion.");
      return false;
    }

    // Step 2: Delete the queried items
    await deleteItems(itemsToDelete);

    console.log("Menu and related items deleted successfully.");
    return true;
  } catch (error) {
    console.error("Error deleting menu and related items:", error);
    return false;
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

// Fetch all recipes for a user
export const getRecipeMenusByUser = async (
  userEmail: string
): Promise<Map<string, string[]>> => {
  const result = new Map<string, string[]>();

  // Get all recipes created by the userEmail
  const paramsRecipe = {
    TableName: config.table,
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :recipePrefix)",
    ExpressionAttributeValues: {
      ":pk": `user#${userEmail}`, // Partition key format
      ":recipePrefix": "recipe#", // Filter by recipes
    },
  };

  const commandRecipe = new QueryCommand(paramsRecipe);
  const resultRecipe = await dynamoDB.send(commandRecipe);

  const recipes = resultRecipe.Items as Recipe[];

  // For each recipe, get the menus including the recipe
  for (const recipe of recipes) {
    const recipeId = recipe.SK;
    // Get menus including the recipe
    const paramsMenu = {
      TableName: config.table,
      IndexName: "GSI1PK-GSI1SK-index",
      KeyConditionExpression: "GSI1PK = :recipe AND begins_with(GSI1SK, :userPrefix)",
      ExpressionAttributeValues: {
        ":recipe": recipeId,
        ":userPrefix": `user#${userEmail}1menu#`,
      },
    };

    const commandMenu = new QueryCommand(paramsMenu);
    const resultMenu = await dynamoDB.send(commandMenu);
    const menuRecipes = resultMenu.Items as Recipe[];

    for (const menuRecipe of menuRecipes) {
      const menuName = menuRecipe.PK.replace(`user#${userEmail}1menu#`, "");
      // Update the Map safely
      if (!result.has(recipeId)) {
        result.set(recipeId, [menuName]);
      } else {
        result.get(recipeId)?.push(menuName);
      }
    }
  }
  return result;
};


// Fetch a recipe for a user
export const getRecipeByUser = async (
  userEmail: string,
  recipeId: string
): Promise<any> => {
  const params = {
    TableName: config.table, // Table name from config
    Key: {
      PK: `user#${userEmail}`,
      SK: recipeId,
    },
  };

  const command = new GetCommand(params);
  const result = await dynamoDB.send(command);
  return result.Item || null;;
};

// Fetch all recipes for a user
export const deleteRecipeMenuItems = async (
  userEmail: string,
  recipeId: string
): Promise<boolean> => {
  try {
    // Step 1: Query all items with PK or SK equal to the menu ID
    const item = await getRecipeByUser(userEmail, recipeId);

    const itemsToDelete = [item]

    if (itemsToDelete.length === 0) {
      console.log("No items found for deletion.");
      return false;
    }

    // Step 2: Delete the queried items
    await deleteItems(itemsToDelete);

    console.log("Menu and related items deleted successfully.");
    return true;
  } catch (error) {
    console.error("Error deleting menu and related items:", error);
    return false;
  }
  
};