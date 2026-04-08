"use server";

import { generateText } from "ai";
import { ollama } from "ollama-ai-provider";

export interface Recipe {
  title: string;
  prepTime: string;
  steps: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export async function generateRecipe(ingredients: string): Promise<Recipe> {
  const { text } = await generateText({
    model: ollama("llama3.2"),
    prompt: `Eres un chef profesional. Genera una receta en JSON con esta estructura exacta (solo JSON, sin texto adicional):
{
  "title": "Nombre de la receta",
  "prepTime": "tiempo en formato como '25 min' o '1 hora'",
  "steps": ["paso 1", "paso 2", ...],
  "nutrition": {
    "calories": número,
    "protein": "g",
    "carbs": "g",
    "fat": "g"
  }
}
Ingredientes disponibles: ${ingredients}
Responde solo con JSON válido.`,
  });

  return JSON.parse(text) as Recipe;
}
