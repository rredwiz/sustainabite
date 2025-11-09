"use client";

import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@heroui/modal";
import { MapPin, Star, ExternalLink } from "lucide-react";

interface Restaurant {
	name: string;
	location: string;
	rating: number;
	Link: string;
	img: string;
}

interface RestaurantModalProps {
	isOpen: boolean;
	onClose: () => void;
	restaurant: Restaurant | null;
}

export default function RestaurantModal({
	isOpen,
	onClose,
	restaurant,
}: RestaurantModalProps) {
	if (!restaurant) return null;

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
				<ModalHeader className="flex flex-col gap-2 pb-2">
					<h2 className="text-2xl font-bold text-gray-800">{restaurant.name}</h2>
					<div className="flex items-center gap-4 text-sm text-gray-600">
						<div className="flex items-center gap-1">
							<Star size={18} className="text-yellow-500 fill-yellow-500" />
							<span className="font-semibold">{restaurant.rating}</span>
						</div>
						<div className="flex items-center gap-1">
							<MapPin size={16} className="text-gray-400" />
							<span>{restaurant.location}</span>
						</div>
					</div>
				</ModalHeader>

				<ModalBody className="py-4">
					<div className="space-y-4">
						{/* Restaurant Image */}
						<div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
							<img
								src={restaurant.img}
								alt={restaurant.name}
								className="w-full h-full object-cover"
								onError={(e) => {
									// Fallback if image fails to load
									e.currentTarget.style.display = "none";
								}}
							/>
						</div>

						{/* Location Details */}
						<div className="bg-gray-50 p-4 rounded-lg">
							<h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
								<MapPin size={20} className="text-green-600" />
								Location
							</h3>
							<p className="text-gray-700">{restaurant.location}</p>
						</div>
					</div>
				</ModalBody>

				<ModalFooter className="flex py-3 items-center justify-between gap-2">
					<button
						onClick={onClose}
						className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
					>
						Close
					</button>
					<a
						href={restaurant.Link}
						target="_blank"
						rel="noopener noreferrer"
						className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
					>
						Visit Website
						<ExternalLink size={16} />
					</a>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

