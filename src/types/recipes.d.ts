import { Ingredient } from "./ingredient";
export interface Recipe {
    PK: string;
    SK: string;
    name: string;
    description: string;
    ingredients: Ingredient[];
    methods: string[];
    cover: string;
  }
  