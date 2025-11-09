"use client";
import { useState, useEffect, useRef } from "react";
import { useSpeech } from "@/context/SpeechContext";
import ImageUploadModal from "@/components/ImageUploadModal";
import UtensilsModal from "@/components/UtensilsModal";
import ChatActionBar from "@/components/ChatActionBar";
import { useImageUpload } from "@/lib/useImageUpload";

interface ChatMessage {
	id: string;
	text: string;
	isBot: boolean;
	timestamp: Date;
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

		// Prepare request data
		const requestData = {
			available_ingredients: imageUpload.detectedIngredients,
			available_utensils: selectedUtensils,
			preference: message || "any",
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

			// Add recipe response to chat
			if (data.Title && data.recipes) {
				const recipeText = `${data.Title}\n\n${data.recipes
					.map(
						(recipe: any, index: number) =>
							`${index + 1}. ${recipe.name}\n   ⏱️ ${
								recipe.cooking_time
							} | 🌱 Carbon Score: ${recipe.carbon_score.toFixed(
								2
							)}\n   Ingredients: ${recipe.ingredients.join(
								", "
							)}`
					)
					.join("\n\n")}`;

				setChatMessages((prev) => [
					...prev,
					{
						id: `recipe-${Date.now()}`,
						text: recipeText,
						isBot: true,
						timestamp: new Date(),
					},
				]);
			}
		} catch (error) {
			console.error("=== Error Making API Call ===");
			console.error("Error:", error);
			handleSpeak("Error sending request");
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		imageUpload.resetUpload();
	};
	return (
		<div className="flex h-screen items-center justify-center font-sans bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50">
			<main className="flex h-screen w-full max-w-7xl flex-col items-center justify-between py-10 px-6 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50">
				<div className="flex flex-col min-h-[75vh] w-full p-4 rounded-lg shadow-sm border border-gray-300 bg-white overflow-y-auto">
					<div className="flex flex-col gap-4 w-full pt-2">
						{isLoadingWelcome ? (
							<div className="flex items-start gap-2 animate-slide-in-left">
								<div className="bg-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] shadow-sm">
									<div className="flex gap-1">
										<div
											className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
											style={{ animationDelay: "0ms" }}
										></div>
										<div
											className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
											style={{ animationDelay: "150ms" }}
										></div>
										<div
											className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
											style={{ animationDelay: "300ms" }}
										></div>
									</div>
								</div>
							</div>
						) : (
							chatMessages.map((msg) => (
								<div
									key={msg.id}
									className={`flex items-start gap-2 animate-slide-in-left ${
										msg.isBot
											? "justify-start"
											: "justify-end"
									}`}
								>
									<div
										className={`rounded-2xl px-4 py-3 max-w-[80%] shadow-sm ${
											msg.isBot
												? "bg-gray-200 rounded-tl-sm text-gray-800"
												: "bg-green-600 rounded-tr-sm text-white"
										}`}
									>
										<p className="whitespace-pre-wrap text-sm leading-relaxed">
											{msg.text}
										</p>
									</div>
								</div>
							))
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
		</div>
	);
}
