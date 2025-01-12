import { v4 as uuidv4 } from 'uuid';
import dynamoDB from '../utils/dynamoClient';
import { Menu } from '../types/menus';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { logger } from '../utils/logger';
import { config } from "../utils/config";

// Fetch all menus for a user
export const getMenusByUser = async (userEmail: string): Promise<Menu[]> => {
    logger.info(userEmail)
  const params = {
    TableName: config.menusTable,
    KeyConditionExpression: 'userEmail = :userEmail',
    ExpressionAttributeValues: { ':userEmail': userEmail },
  };

  const command = new QueryCommand(params);
  const result = await dynamoDB.send(command);

  return (result.Items as Menu[]) || [];
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
