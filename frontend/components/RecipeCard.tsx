"use client";

import { Clock, Leaf } from "lucide-react";

interface Recipe {
	name: string;
	ingredients: string[];
	cooking_time: string;
	utensils_used: string[];
	steps: string[];
	carbon_score: number;
}

interface RecipeCardProps {
	recipe: Recipe;
	onClick: () => void;
}

export default function RecipeCard({ recipe, onClick }: RecipeCardProps) {
	return (
		<button
			onClick={onClick}
			className="w-full h-full p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-green-500 transition-all duration-200 text-left flex flex-col gap-3"
		>
			<h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
				{recipe.name}
			</h3>

			<div className="flex items-center gap-4 text-sm text-gray-600">
				<div className="flex items-center gap-1">
					<Clock size={16} className="text-gray-400" />
					<span>{recipe.cooking_time}</span>
				</div>
				<div className="flex items-center gap-1">
					<Leaf size={16} className="text-green-600" />
					<span>Carbon: {recipe.carbon_score.toFixed(2)}</span>
				</div>
			</div>

			<div className="flex-1">
				<p className="text-xs text-gray-500 mb-1">Ingredients:</p>
				<p className="text-sm text-gray-700 line-clamp-3">
					{recipe.ingredients.join(", ")}
				</p>
			</div>
		</button>
	);
}

