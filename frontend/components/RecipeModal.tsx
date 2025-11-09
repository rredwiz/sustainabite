"use client";

import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@heroui/modal";
import { Clock, Leaf, ChefHat } from "lucide-react";

interface Recipe {
	name: string;
	ingredients: string[];
	cooking_time: string;
	utensils_used: string[];
	steps: string[];
	carbon_score: number;
}

interface RecipeModalProps {
	isOpen: boolean;
	onClose: () => void;
	recipe: Recipe | null;
}

export default function RecipeModal({
	isOpen,
	onClose,
	recipe,
}: RecipeModalProps) {
	if (!recipe) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="2xl"
			scrollBehavior="inside"
			placement="center"
			hideCloseButton={true}
			classNames={{
				backdrop: "bg-black/50",
			}}
		>
			<ModalContent className="bg-white rounded-lg border border-gray-300 shadow-sm">
				<ModalHeader className="flex flex-col gap-1 pb-2">
					<h2 className="text-2xl font-bold text-gray-800">{recipe.name}</h2>
					<div className="flex items-center gap-4 text-sm text-gray-600">
						<div className="flex items-center gap-1">
							<Clock size={16} className="text-gray-400" />
							<span>{recipe.cooking_time}</span>
						</div>
						<div className="flex items-center gap-1">
							<Leaf size={16} className="text-green-600" />
							<span>Carbon Score: {recipe.carbon_score.toFixed(2)}</span>
						</div>
					</div>
				</ModalHeader>

				<ModalBody className="py-4">
					<div className="space-y-6">
						{/* Ingredients */}
						<div>
							<h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
								<ChefHat size={20} className="text-green-600" />
								Ingredients
							</h3>
							<div className="flex flex-wrap gap-2">
								{recipe.ingredients.map((ingredient, index) => (
									<span
										key={index}
										className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
									>
										{ingredient}
									</span>
								))}
							</div>
						</div>

						{/* Utensils */}
						{recipe.utensils_used && recipe.utensils_used.length > 0 && (
							<div>
								<h3 className="text-lg font-semibold text-gray-800 mb-2">
									Utensils Needed
								</h3>
								<div className="flex flex-wrap gap-2">
									{recipe.utensils_used.map((utensil, index) => (
										<span
											key={index}
											className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
										>
											{utensil}
										</span>
									))}
								</div>
							</div>
						)}

						{/* Steps */}
						<div>
							<h3 className="text-lg font-semibold text-gray-800 mb-3">
								Instructions
							</h3>
							<ol className="space-y-3">
								{recipe.steps.map((step, index) => (
									<li key={index} className="flex gap-3">
										<span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
											{index + 1}
										</span>
										<p className="text-gray-700 leading-relaxed">{step}</p>
									</li>
								))}
							</ol>
						</div>
					</div>
				</ModalBody>

				<ModalFooter className="flex py-3 items-center justify-end gap-2">
					<button
						onClick={onClose}
						className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
					>
						Close
					</button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

