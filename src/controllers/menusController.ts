import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import dynamoDB from '../utils/dynamoClient';
import { deleteMenuAndRelatedItems, getMenusByUser } from '../models/menusModel';

// Fetch menus for the user
export const getMenus = async (req: Request, res: Response) => {
    const userEmail = req.user?.email;
    if (!userEmail) {
        res.status(401).json({ message: "Unauthorized: User not authenticated" });
        return;
      }
    try {
      const menus = await getMenusByUser(userEmail);
      res.status(200).json({ menus });
    } catch (error) {
      console.error('Error fetching menus:', error);
      res.status(500).json({ message: 'Failed to fetch menus' });
    }
  };

// // Add a new menu
// export const addMenu = async (req: Request, res: Response): Promise<void> => {
//   const { name, description } = req.body;
//   const userEmail = req.user.email;

//   const newMenu = {
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

//   try {
//     await dynamoDB.put(params).promise();
//     res.status(201).json({ message: 'Menu added successfully', menu: newMenu });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to add menu' });
//   }
// };

// Delete a menu
export const deleteMenu = async (req: Request, res: Response) => {
    const { menuId } = req.params;
  
    try {
      const isDeleted = await deleteMenuAndRelatedItems(menuId);
  
      if (isDeleted) {
        res.status(200).json({ message: "Menu deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete menu" });
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
      res.status(500).json({ message: "Failed to delete menu" });
    }
  };
