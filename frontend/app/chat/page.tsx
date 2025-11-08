"use client";
import { useState } from "react";
import { useSpeech } from "@/context/SpeechContext";
import ImageUploadModal from "@/components/ImageUploadModal";
import ChatActionBar from "@/components/ChatActionBar";
import { useImageUpload } from "@/lib/useImageUpload";

export default function Chat() {
	const [isInputVisible, setIsInputVisible] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { handleSpeak } = useSpeech();

	const imageUpload = useImageUpload(
		(count) => handleSpeak(`Detected ${count} ingredients`),
		() => handleSpeak("Error uploading images")
	);

	const handleImageClick = () => {
		handleSpeak("Image");
		setIsModalOpen(true);
	};

	const handleMessageClick = () => {
		setIsInputVisible(!isInputVisible);
		handleSpeak("Message");
	};

	const handleSendClick = () => {
		handleSpeak("Send");
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		imageUpload.resetUpload();
	};
	return (
		// off-white green background color with gradient no teal
		// less green, more off-white
		<div className="flex h-screen items-center justify-center font-sans bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50">
			<main className="flex h-screen w-full max-w-7xl flex-col items-center justify-between py-10 px-6 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50">
				<div className="flex flex-col min-h-[75vh] w-full items-center justify-center p-4 rounded-lg shadow-sm border border-gray-300">
					<h1 className="text-2xl font-bold text-black flex items-center gap-2">
						chat goes here
					</h1>
				</div>

				<ChatActionBar
					onImageClick={handleImageClick}
					onMessageClick={handleMessageClick}
					onSendClick={handleSendClick}
					isInputVisible={isInputVisible}
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
		</div>
	);
}
