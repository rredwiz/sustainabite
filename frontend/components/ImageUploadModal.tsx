"use client";

import { Upload, X, Plus } from "lucide-react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@heroui/modal";
import { useRef, useState } from "react";

interface DetectedIngredient {
	success: boolean;
	ingredients: string[];
	count: number;
}

interface ImageUploadModalProps {
	isOpen: boolean;
	onClose: () => void;
	selectedImages: File[];
	previewUrls: string[];
	isUploading: boolean;
	detectedIngredients: string[];
	isDragging: boolean;
	onFileSelect: (files: FileList | null) => void;
	onDragOver: (e: React.DragEvent) => void;
	onDragLeave: (e: React.DragEvent) => void;
	onDrop: (e: React.DragEvent) => void;
	onRemoveImage: (index: number) => void;
	onRemoveIngredient: (index: number) => void;
	onAddIngredient: (ingredient: string) => void;
	onUpload: () => void;
}

export default function ImageUploadModal({
	isOpen,
	onClose,
	selectedImages,
	previewUrls,
	isUploading,
	detectedIngredients,
	isDragging,
	onFileSelect,
	onDragOver,
	onDragLeave,
	onDrop,
	onRemoveImage,
	onRemoveIngredient,
	onAddIngredient,
	onUpload,
}: ImageUploadModalProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [newIngredient, setNewIngredient] = useState("");

	const handleAddIngredient = () => {
		if (newIngredient.trim()) {
			onAddIngredient(newIngredient);
			setNewIngredient("");
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleAddIngredient();
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="2xl"
			scrollBehavior="inside"
			placement="center"
			hideCloseButton={true}
			classNames={{
				base: "p-4",
				backdrop: "bg-black/50",
			}}
		>
			<ModalContent className="bg-white rounded-lg border border-gray-300 shadow-sm">
				<ModalHeader className="flex flex-col gap-1">
					<p className="text-sm text-gray-500 font-medium">
						Upload images to detect ingredients, or add ingredients
						manually
					</p>
				</ModalHeader>
				<ModalBody>
					{/* Drag & Drop Zone */}
					{previewUrls.length === 0 && (
						<div
							onDragOver={onDragOver}
							onDragLeave={onDragLeave}
							onDrop={onDrop}
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
						</div>
					)}

					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						multiple
						onChange={(e) => {
							onFileSelect(e.target.files);
							// reset the input value to allow for multiple uploads
							e.target.value = "";
						}}
						className="hidden"
					/>

					{/* Image Previews */}
					{previewUrls.length > 0 && (
						<div className="mt-6">
							<div className="flex items-center gap-2 mb-3">
								<h3 className="text-md text-gray-500 font-medium">
									Selected Images ({selectedImages.length})
								</h3>
								<button
									onClick={() =>
										fileInputRef.current?.click()
									}
									className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
								>
									<Plus size={16} />
								</button>
							</div>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
								{previewUrls.map((url, index) => (
									<div
										key={index}
										className="relative group w-full"
									>
										<img
											src={url}
											alt={`Preview ${index + 1}`}
											className="w-full relative h-16 object-cover rounded-lg border border-gray-300"
										/>
										<button
											onClick={(e) => {
												e.stopPropagation();
												onRemoveImage(index);
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
					<div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
						<h3 className="text-lg font-semibold text-green-800 mb-3">
							Ingredients ({detectedIngredients.length}/15)
						</h3>
						{detectedIngredients.length > 0 ? (
							<div className="flex flex-wrap gap-2">
								{detectedIngredients.map(
									(ingredient, index) => (
										<span
											key={index}
											className="group px-3 py-1 bg-green-600 text-white rounded-full text-sm flex items-center gap-1"
										>
											{ingredient}
											<button
												onClick={() =>
													onRemoveIngredient(index)
												}
												className="ml-1 hover:bg-green-700 rounded-full p-0.5 transition-colors"
											>
												<X size={14} />
											</button>
										</span>
									)
								)}
							</div>
						) : (
							<p className="text-sm text-gray-600">
								No ingredients yet. Upload images or add
								manually below.
							</p>
						)}
					</div>
				</ModalBody>
				<ModalFooter className="flex items-center justify-between gap-2">
					<div className="flex gap-2 flex-1">
						<input
							type="text"
							value={newIngredient}
							onChange={(e) => setNewIngredient(e.target.value)}
							onKeyPress={handleKeyPress}
							placeholder="Add ingredient..."
							disabled={detectedIngredients.length >= 15}
							className="flex-1 px-3 py-2 border border-gray-300 text-gray-500 rounded-lg text-sm focus:outline-none disabled:bg-gray-100"
						/>
						<button
							onClick={handleAddIngredient}
							disabled={detectedIngredients.length >= 15}
							className="px-3 py-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm flex items-center gap-1 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
						>
							<Plus size={16} />
						</button>
					</div>
					<button
						onClick={onUpload}
						disabled={selectedImages.length === 0 || isUploading}
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
							"Detect"
						)}
					</button>
					<button
						onClick={onClose}
						className="px-6 py-2 bg-white hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"
					>
						Save
					</button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
