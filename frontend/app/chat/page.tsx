"use client";
import { ImageIcon, Leaf, MessageCircle, Send, Upload, X } from "lucide-react";
import { Tooltip } from "@heroui/tooltip";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@heroui/modal";
import { useState, useRef } from "react";
import { useSpeech } from "@/context/SpeechContext";

interface DetectedIngredient {
	success: boolean;
	ingredients: string[];
	count: number;
}

export default function Chat() {
	const [isInputVisible, setIsInputVisible] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedImages, setSelectedImages] = useState<File[]>([]);
	const [previewUrls, setPreviewUrls] = useState<string[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [detectedIngredients, setDetectedIngredients] = useState<string[]>(
		[]
	);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { handleSpeak } = useSpeech();

	const handleImage = () => {
		handleSpeak("Image");
		setIsModalOpen(true);
	};

	const toggleInput = () => {
		setIsInputVisible(!isInputVisible);
		handleSpeak("Message");
	};

	const handleFileSelect = (files: FileList | null) => {
		if (!files) return;

		const imageFiles = Array.from(files).filter((file) =>
			file.type.startsWith("image/")
		);
		setSelectedImages((prev) => [...prev, ...imageFiles]);

		// Create preview URLs
		imageFiles.forEach((file) => {
			const url = URL.createObjectURL(file);
			setPreviewUrls((prev) => [...prev, url]);
		});
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		handleFileSelect(e.dataTransfer.files);
	};

	const removeImage = (index: number) => {
		URL.revokeObjectURL(previewUrls[index]);
		setSelectedImages((prev) => prev.filter((_, i) => i !== index));
		setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
	};

	const handleUpload = async () => {
		if (selectedImages.length === 0) return;

		setIsUploading(true);
		const formData = new FormData();
		selectedImages.forEach((image) => {
			formData.append("images", image);
		});

		try {
			const response = await fetch("http://localhost:8000/api/detect", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) throw new Error("Upload failed");

			const data: DetectedIngredient = await response.json();
			setDetectedIngredients(data.ingredients);
			handleSpeak(`Detected ${data.count} ingredients`);
		} catch (error) {
			console.error("Error uploading images:", error);
			handleSpeak("Error uploading images");
		} finally {
			setIsUploading(false);
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		// Clean up preview URLs
		previewUrls.forEach((url) => URL.revokeObjectURL(url));
		setSelectedImages([]);
		setPreviewUrls([]);
		setDetectedIngredients([]);
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
				<div className="flex items-center justify-center gap-2 bg-white p-4 rounded-full shadow-sm border border-gray-300">
					<button
						onClick={handleImage}
						className="rounded-full bg-gray-200 hover:bg-blue-600 p-3 text-black hover:text-white transition-colors"
					>
						<Tooltip
							content={
								<div className="flex bg-black/50 text-white px-2 py-1 rounded-full items-center gap-2">
									Image
								</div>
							}
							showArrow={true}
							color="foreground"
						>
							<ImageIcon size={20} />
						</Tooltip>
					</button>
					<button
						onClick={toggleInput}
						className="rounded-full bg-gray-200 hover:bg-blue-600 p-3 text-black hover:text-white transition-colors"
					>
						<Tooltip
							content={
								<div className="flex bg-black/50 text-white px-2 py-1 rounded-full items-center gap-2">
									Message
								</div>
							}
							showArrow={true}
							color="foreground"
						>
							<MessageCircle size={20} />
						</Tooltip>
					</button>
					<div
						className={`overflow-hidden transition-all duration-500 ease-in-out ${
							isInputVisible
								? "max-w-md opacity-100"
								: "max-w-0 opacity-0"
						}`}
					>
						<input
							type="text"
							placeholder="Add any specifications..."
							className="text-gray-700 px-4 py-2 rounded-full border border-gray-300 focus:bg-gray-100 w-80 outline-none"
						/>
					</div>
					<button
						onClick={() => handleSpeak("Send")}
						className="rounded-full bg-green-600 hover:bg-green-700 p-3 text-white transition-colors"
					>
						<Tooltip
							content={
								<div className="flex bg-black/50 text-white px-2 py-1 rounded-full items-center gap-2">
									Send
								</div>
							}
							showArrow={true}
							color="foreground"
						>
							<Send size={20} />
						</Tooltip>
					</button>
				</div>
			</main>

			{/* Image Upload Modal */}
			<Modal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				size="3xl"
				scrollBehavior="inside"
			>
				<ModalContent>
					<ModalHeader className="flex flex-col gap-1">
						<h2 className="text-2xl font-bold">Upload Images</h2>
						<p className="text-sm text-gray-500">
							Upload images to detect ingredients
						</p>
					</ModalHeader>
					<ModalBody>
						{/* Drag & Drop Zone */}
						<div
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
							onClick={() => fileInputRef.current?.click()}
							className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
								isDragging
									? "border-blue-500 bg-blue-50"
									: "border-gray-300 hover:border-gray-400"
							}`}
						>
							<Upload
								className="mx-auto mb-4 text-gray-400"
								size={48}
							/>
							<p className="text-lg font-medium text-gray-700">
								Drop images here or click to browse
							</p>
							<p className="text-sm text-gray-500 mt-2">
								Supports: JPG, PNG, GIF, WebP
							</p>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								multiple
								onChange={(e) =>
									handleFileSelect(e.target.files)
								}
								className="hidden"
							/>
						</div>

						{/* Image Previews */}
						{previewUrls.length > 0 && (
							<div className="mt-6">
								<h3 className="text-lg font-semibold mb-3">
									Selected Images ({selectedImages.length})
								</h3>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
									{previewUrls.map((url, index) => (
										<div
											key={index}
											className="relative group"
										>
											<img
												src={url}
												alt={`Preview ${index + 1}`}
												className="w-full h-32 object-cover rounded-lg border border-gray-300"
											/>
											<button
												onClick={(e) => {
													e.stopPropagation();
													removeImage(index);
												}}
												className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
											>
												<X size={16} />
											</button>
											<div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
												{selectedImages[index].name}
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Detected Ingredients */}
						{detectedIngredients.length > 0 && (
							<div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
								<h3 className="text-lg font-semibold text-green-800 mb-3">
									Detected Ingredients (
									{detectedIngredients.length})
								</h3>
								<div className="flex flex-wrap gap-2">
									{detectedIngredients.map(
										(ingredient, index) => (
											<span
												key={index}
												className="px-3 py-1 bg-green-600 text-white rounded-full text-sm"
											>
												{ingredient}
											</span>
										)
									)}
								</div>
							</div>
						)}
					</ModalBody>
					<ModalFooter>
						<button
							onClick={handleCloseModal}
							className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={handleUpload}
							disabled={
								selectedImages.length === 0 || isUploading
							}
							className={`px-6 py-2 rounded-lg font-medium transition-colors ${
								selectedImages.length === 0 || isUploading
									? "bg-gray-300 text-gray-500 cursor-not-allowed"
									: "bg-green-600 hover:bg-green-700 text-white"
							}`}
						>
							{isUploading ? (
								<span className="flex items-center gap-2">
									<svg
										className="animate-spin h-5 w-5"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
											fill="none"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Detecting...
								</span>
							) : (
								"Detect Ingredients"
							)}
						</button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</div>
	);
}
