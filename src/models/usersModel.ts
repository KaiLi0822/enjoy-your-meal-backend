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
import { Menu } from "../types/menus";
import { Recipe } from "../types/recipes";

// Function to add a user
export const addUserToDB = async (user: User): Promise<void> => {
  const params = {
    TableName: config.table,
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

const queryItemsForDeletion = async (
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
    const itemsToDelete = await queryItemsForDeletion(userEmail, menuName);

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

export const addMenuToDB = async (menu: Menu): Promise<void> => {
  const params = {
    TableName: config.table,
    Item: menu,
  };

  const command = new PutCommand(params);
  await dynamoDB.send(command);
};

export const addRecipeToDB = async (recipe: Recipe): Promise<void> => {
  const params = {
    TableName: config.table,
    Item: recipe,
  };

  const command = new PutCommand(params);
  await dynamoDB.send(command);
};

