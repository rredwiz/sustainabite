import { useState } from "react";

interface DetectedIngredient {
	success: boolean;
	ingredients: string[];
	count: number;
}

const MAX_INGREDIENTS = 15;

export function useImageUpload(
	onSuccess: (count: number) => void,
	onError: () => void
) {
	const [selectedImages, setSelectedImages] = useState<File[]>([]);
	const [previewUrls, setPreviewUrls] = useState<string[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [detectedIngredients, setDetectedIngredients] = useState<string[]>(
		[]
	);
	const [isDragging, setIsDragging] = useState(false);

	const handleFileSelect = (files: FileList | null) => {
		if (!files) return;

		const imageFiles = Array.from(files).filter((file) =>
			file.type.startsWith("image/")
		);
		setSelectedImages((prev) => [...prev, ...imageFiles]);

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
			setDetectedIngredients((prev) => {
				const combined = [...prev, ...data.ingredients];
				const unique = Array.from(new Set(combined));
				return unique.slice(0, MAX_INGREDIENTS);
			});
			onSuccess(data.count);
		} catch (error) {
			console.error("Error uploading images:", error);
			onError();
		} finally {
			setIsUploading(false);
		}
	};

	const addIngredient = (ingredient: string) => {
		const trimmed = ingredient.trim();
		if (
			trimmed &&
			!detectedIngredients.includes(trimmed) &&
			detectedIngredients.length < MAX_INGREDIENTS
		) {
			setDetectedIngredients((prev) => [...prev, trimmed]);
		}
	};

	const removeIngredient = (index: number) => {
		setDetectedIngredients((prev) => prev.filter((_, i) => i !== index));
	};

	const resetUpload = () => {
		previewUrls.forEach((url) => URL.revokeObjectURL(url));
		setSelectedImages([]);
		setPreviewUrls([]);
		setDetectedIngredients([]);
	};

	return {
		selectedImages,
		previewUrls,
		isUploading,
		detectedIngredients,
		isDragging,
		handleFileSelect,
		handleDragOver,
		handleDragLeave,
		handleDrop,
		removeImage,
		handleUpload,
		addIngredient,
		removeIngredient,
		resetUpload,
	};
}
