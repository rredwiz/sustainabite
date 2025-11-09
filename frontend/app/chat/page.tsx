"use client";
import { useState, useEffect, useRef } from "react";
import { useSpeech } from "@/context/SpeechContext";
import ImageUploadModal from "@/components/ImageUploadModal";
import UtensilsModal from "@/components/UtensilsModal";
import ChatActionBar from "@/components/ChatActionBar";
import RecipeCard from "@/components/RecipeCard";
import RecipeModal from "@/components/RecipeModal";
import { useImageUpload } from "@/lib/useImageUpload";

interface Recipe {
	name: string;
	ingredients: string[];
	cooking_time: string;
	utensils_used: string[];
	steps: string[];
	carbon_score: number;
}

interface ChatMessage {
	id: string;
	text: string;
	isBot: boolean;
	timestamp: Date;
	recipes?: Recipe[];
}

export default function Chat() {
	const [isInputVisible, setIsInputVisible] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isUtensilsModalOpen, setIsUtensilsModalOpen] = useState(false);
	const [selectedUtensils, setSelectedUtensils] = useState<string[]>([]);
	const [budget, setBudget] = useState<number>(5.0);
	const [message, setMessage] = useState<string>("");
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [isLoadingWelcome, setIsLoadingWelcome] = useState(true);
	const [isLoadingApi, setIsLoadingApi] = useState(false);
	const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
	const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
	const chatEndRef = useRef<HTMLDivElement>(null);
	const { handleSpeak } = useSpeech();

	const imageUpload = useImageUpload(
		(count) => handleSpeak(`Detected ${count} ingredients`),
		() => handleSpeak("Error uploading images")
	);

	// Welcome message on mount
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoadingWelcome(false);
			setChatMessages([
				{
					id: "welcome-1",
					text: "Welcome to Sustainabite! Enter ingredients and preferences to get started.",
					isBot: true,
					timestamp: new Date(),
				},
			]);
		}, 1500); // Show loading animation for 1.5 seconds

		return () => clearTimeout(timer);
	}, []);

	// Auto-scroll to bottom when new messages are added
	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [chatMessages]);

	const handleImageClick = () => {
		handleSpeak("Ingredients");
		setIsModalOpen(true);
	};

	const handleUtensilClick = () => {
		handleSpeak("Options");
		setIsUtensilsModalOpen(true);
	};

	const handleMessageClick = () => {
		setIsInputVisible(!isInputVisible);
		handleSpeak("Message");
	};

	const handleSendClick = async () => {
		handleSpeak("Send");

		// Get the user's message before clearing
		const userMessageText = message || "Find recipes with my ingredients";

		// Add user message to chat
		setChatMessages((prev) => [
			...prev,
			{
				id: `user-${Date.now()}`,
				text: userMessageText,
				isBot: false,
				timestamp: new Date(),
			},
		]);

		// Clear message input
		setMessage("");

		// Set loading state and add loading message
		setIsLoadingApi(true);
		const loadingMessageId = `loading-${Date.now()}`;
		setChatMessages((prev) => [
			...prev,
			{
				id: loadingMessageId,
				text: "", // Empty text, will show loading animation
				isBot: true,
				timestamp: new Date(),
			},
		]);

		// Prepare request data
		const requestData = {
			available_ingredients: imageUpload.detectedIngredients,
			available_utensils: selectedUtensils,
			preference: userMessageText,
			budget: budget || 5.0,
		};

		console.log("=== Sending Recipe Request ===");
		console.log("Request Data:", JSON.stringify(requestData, null, 2));

		try {
			const response = await fetch("http://localhost:8000/api/recipes", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestData),
			});

			console.log("Response Status:", response.status);
			console.log("Response OK:", response.ok);

			if (!response.ok) {
				const errorData = await response.json();
				console.error("Error Response:", errorData);
				throw new Error(
					errorData.detail || `HTTP error! status: ${response.status}`
				);
			}

			const data = await response.json();
			console.log("=== Recipe Response Received ===");
			console.log("Full Response:", JSON.stringify(data, null, 2));
			console.log("Title:", data.Title);
			console.log("Number of Recipes:", data.recipes?.length || 0);
			if (data.recipes) {
				data.recipes.forEach((recipe: any, index: number) => {
					console.log(`Recipe ${index + 1}:`, recipe.name);
					console.log(`  - Ingredients:`, recipe.ingredients);
					console.log(`  - Cooking Time:`, recipe.cooking_time);
					console.log(`  - Carbon Score:`, recipe.carbon_score);
				});
			}

			// Remove loading message and add recipe response to chat
			setChatMessages((prev) => {
				const filtered = prev.filter(
					(msg) => msg.id !== loadingMessageId
				);
				if (data.Title && data.recipes) {
					return [
						...filtered,
						{
							id: `recipe-${Date.now()}`,
							text: data.Title,
							isBot: true,
							timestamp: new Date(),
							recipes: data.recipes,
						},
					];
				}
				return filtered;
			});
		} catch (error) {
			console.error("=== Error Making API Call ===");
			console.error("Error:", error);
			handleSpeak("Error sending request");

			// Remove loading message and add error message
			setChatMessages((prev) => {
				const filtered = prev.filter(
					(msg) => msg.id !== loadingMessageId
				);
				return [
					...filtered,
					{
						id: `error-${Date.now()}`,
						text: "Sorry, I encountered an error while fetching recipes. Please try again.",
						isBot: true,
						timestamp: new Date(),
					},
				];
			});
		} finally {
			setIsLoadingApi(false);
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		imageUpload.resetUpload();
	};
	return (
		<div className="flex h-screen items-center justify-center font-sans bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50">
			<main className="flex h-screen w-full max-w-7xl flex-col items-center justify-between py-10 px-6 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50">
				<div className="flex flex-col h-[75vh] w-full p-4 rounded-lg shadow-sm border border-gray-300 bg-white overflow-y-auto">
					<div className="flex flex-col gap-4 w-full pt-2">
						{isLoadingWelcome ? (
							<div className="flex items-start gap-2 animate-slide-in-left w-full">
								<div className="bg-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] min-w-0 shadow-sm">
									<div className="flex items-center gap-1 pr-1">
										<div
											className="w-2 h-2 bg-gray-400 rounded-full animate-bounce flex-shrink-0"
											style={{ animationDelay: "0ms" }}
										></div>
										<div
											className="w-2 h-2 bg-gray-400 rounded-full animate-bounce flex-shrink-0"
											style={{ animationDelay: "150ms" }}
										></div>
										<div
											className="w-2 h-2 bg-gray-400 rounded-full animate-bounce flex-shrink-0"
											style={{ animationDelay: "300ms" }}
										></div>
									</div>
								</div>
							</div>
						) : (
							chatMessages.map((msg) => {
								// Show loading animation for empty bot messages (loading state)
								const isLoadingMessage =
									msg.isBot && msg.text === "";

								// Check if message has recipes
								const hasRecipes =
									msg.recipes && msg.recipes.length > 0;

								return (
									<div
										key={msg.id}
										className={`flex flex-col gap-3 animate-slide-in-left ${
											msg.isBot
												? "items-start"
												: "items-end"
										}`}
									>
										{/* Message text bubble */}
										<div
											className={`flex items-start gap-2 w-full ${
												msg.isBot
													? "justify-start"
													: "justify-end"
											}`}
										>
											<div
												className={`rounded-2xl px-4 py-3 max-w-[80%] min-w-0 shadow-sm ${
													msg.isBot
														? "bg-gray-200 rounded-tl-sm text-gray-800"
														: "bg-green-600 rounded-tr-sm text-white"
												}`}
											>
												{isLoadingMessage ? (
													<div className="flex items-center gap-1 pr-1">
														<div
															className="w-2 h-2 bg-gray-400 rounded-full animate-bounce flex-shrink-0"
															style={{
																animationDelay:
																	"0ms",
															}}
														></div>
														<div
															className="w-2 h-2 bg-gray-400 rounded-full animate-bounce flex-shrink-0"
															style={{
																animationDelay:
																	"150ms",
															}}
														></div>
														<div
															className="w-2 h-2 bg-gray-400 rounded-full animate-bounce flex-shrink-0"
															style={{
																animationDelay:
																	"300ms",
															}}
														></div>
													</div>
												) : (
													<p
														className="whitespace-pre-wrap text-sm leading-relaxed break-words"
														style={{
															wordBreak:
																"break-word",
															overflowWrap:
																"anywhere",
														}}
													>
														{msg.text}
													</p>
												)}
											</div>
										</div>

										{/* Recipe cards in 2x2 grid */}
										{hasRecipes && (
											<div className="w-full max-w-[80%]">
												<div className="grid grid-cols-2 gap-4">
													{msg.recipes!.map(
														(recipe, index) => (
															<RecipeCard
																key={index}
																recipe={recipe}
																onClick={() => {
																	setSelectedRecipe(
																		recipe
																	);
																	setIsRecipeModalOpen(
																		true
																	);
																}}
															/>
														)
													)}
													{/* Empty placeholder for 4th card if only 3 recipes */}
													{msg.recipes!.length ===
														3 && (
														<div className="w-full h-full p-4 bg-gray-50 border border-gray-100 rounded-lg opacity-0 pointer-events-none">
															{/* Empty placeholder */}
														</div>
													)}
												</div>
											</div>
										)}
									</div>
								);
							})
						)}
						<div ref={chatEndRef} />
					</div>
				</div>

				<ChatActionBar
					onImageClick={handleImageClick}
					onUtensilClick={handleUtensilClick}
					onMessageClick={handleMessageClick}
					onSendClick={handleSendClick}
					isInputVisible={isInputVisible}
					message={message}
					onMessageChange={setMessage}
					isDisabled={isLoadingApi}
				/>
			</main>

			<ImageUploadModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				selectedImages={imageUpload.selectedImages}
				previewUrls={imageUpload.previewUrls}
				isUploading={imageUpload.isUploading}
				detectedIngredients={imageUpload.detectedIngredients}
				isDragging={imageUpload.isDragging}
				onFileSelect={imageUpload.handleFileSelect}
				onDragOver={imageUpload.handleDragOver}
				onDragLeave={imageUpload.handleDragLeave}
				onDrop={imageUpload.handleDrop}
				onRemoveImage={imageUpload.removeImage}
				onRemoveIngredient={imageUpload.removeIngredient}
				onAddIngredient={imageUpload.addIngredient}
				onUpload={imageUpload.handleUpload}
			/>

			<UtensilsModal
				isOpen={isUtensilsModalOpen}
				onClose={() => setIsUtensilsModalOpen(false)}
				selectedUtensils={selectedUtensils}
				onUtensilsChange={setSelectedUtensils}
				budget={budget}
				onBudgetChange={setBudget}
			/>

			<RecipeModal
				isOpen={isRecipeModalOpen}
				onClose={() => {
					setIsRecipeModalOpen(false);
					setSelectedRecipe(null);
				}}
				recipe={selectedRecipe}
			/>
		</div>
	);
}
