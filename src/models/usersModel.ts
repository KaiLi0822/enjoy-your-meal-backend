import dynamoDB from "../utils/dynamoClient";
import { User } from "../types/users";
import { BatchWriteCommand, GetCommand, PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { config } from "../utils/config";
import { Menu } from "../types/menus";

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
      return result.Item as User || null;
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
  

const queryItemsForDeletion = async (menuId: string): Promise<any[]> => {
    try {
      // Query items where PK = menu#m1 or SK = menu#m1
      const queryParamsForPK = {
        TableName: config.table,
        KeyConditionExpression: "PK = :menuId",
        ExpressionAttributeValues: {
          ":menuId": menuId, // e.g., "menu#m1"
        },
      };
  
      const queryParamsForSK = {
        TableName: config.table,
        IndexName: "YourIndexName", // Use the GSI if querying SK
        KeyConditionExpression: "SK = :menuId",
        ExpressionAttributeValues: {
          ":menuId": menuId,
        },
      };
  
      // Query for PK
      const queryPKCommand = new QueryCommand(queryParamsForPK);
      const resultPK = await dynamoDB.send(queryPKCommand);
  
      // Query for SK
      const querySKCommand = new ScanCommand(queryParamsForSK); // Use scan if needed
      const resultSK = await dynamoDB.send(querySKCommand);
  
      return [...(resultPK.Items || []), ...(resultSK.Items || [])];
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
          ":menuPrefix": "menu#",     // Filter by menus
        },
      };

  const command = new QueryCommand(params);
  const result = await dynamoDB.send(command);

    // Map the DynamoDB response to the `Menu` type
    return result.Items as Menu[];
};

// Delete a menu by ID
export const deleteMenuAndRelatedItems = async (menuId: string): Promise<boolean> => {
    try {
      // Step 1: Query all items with PK or SK equal to the menu ID
      const itemsToDelete = await queryItemsForDeletion(menuId);
  
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
  
// // Add a new menu
// export const createMenu = async (userEmail: string, name: string, description: string): Promise<Menu> => {
//   const newMenu: Menu = {
//     menuId: uuidv4(),
//     userEmail,
//     name,
//     description,
//     createdAt: new Date().toISOString(),
//   };

//   const params = {
//     TableName: process.env.MENUS_TABLE!,
//     Item: newMenu,
//   };

//   await dynamoDB.put(params).promise();
//   return newMenu;
// };

// // Delete a menu by ID
// export const deleteMenuById = async (menuId: string): Promise<void> => {
//   const params = {
//     TableName: process.env.MENUS_TABLE!,
//     Key: { menuId },
//   };

//   await dynamoDB.delete(params).promise();
// };