"use client";

import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@heroui/modal";
import { useState } from "react";

interface UtensilsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const UTENSILS = [
	["Microwave", "Pan", "Pot", "Air Fryer"],
	["Burners", "Blender", "Oven", "Toaster"],
];

export default function UtensilsModal({ isOpen, onClose }: UtensilsModalProps) {
	const [selectedUtensils, setSelectedUtensils] = useState<string[]>([]);
	const [budget, setBudget] = useState<number>(0);

	const toggleUtensil = (utensil: string) => {
		setSelectedUtensils((prev) =>
			prev.includes(utensil)
				? prev.filter((u) => u !== utensil)
				: [...prev, utensil]
		);
	};

	const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value) || 0;
		setBudget(Math.min(value, 100));
	};
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="md"
			scrollBehavior="inside"
			placement="center"
			hideCloseButton={true}
			classNames={{
				backdrop: "bg-black/50",
			}}
		>
			<ModalContent className="bg-white rounded-lg border border-gray-300 shadow-sm">
				<ModalBody className="py-6">
					<h2 className="text-md text-gray-500 mb-2">
						Available Utensils / Appliances
					</h2>
					<div className="space-y-3">
						{UTENSILS.map((row, rowIndex) => (
							<div
								key={rowIndex}
								className="grid grid-cols-4 gap-3"
							>
								{row.map((utensil) => (
									<button
										key={utensil}
										onClick={() => toggleUtensil(utensil)}
										className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
											selectedUtensils.includes(utensil)
												? "bg-black text-white"
												: "bg-white text-black border border-gray-300 hover:bg-gray-50"
										}`}
									>
										{utensil}
									</button>
								))}
							</div>
						))}
					</div>

					{/* Budget Input */}
					<div className="mt-6">
						<h2 className="text-md text-gray-500 mb-2">Budget</h2>
						<div className="flex items-center gap-2">
							<span className="text-gray-600 font-medium">$</span>
							<input
								type="number"
								value={budget === 0 ? "" : budget}
								onChange={handleBudgetChange}
								placeholder="0"
								min="0"
								max="100"
								className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-500 text-sm focus:outline-none"
							/>
						</div>
					</div>
				</ModalBody>
				<ModalFooter className="flex py-2 items-center justify-center gap-2">
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
