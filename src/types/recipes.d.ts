import { Ingredient } from "./ingredient";
export interface Recipe {
    PK: string;
    SK: string;
    GSI1PK: string;
    name: string;
    description: string;
    ingredients: Ingredient[];
    methods: string[];
    cover: string;
  }
  