"use client";

import { MapPin, Star, ExternalLink } from "lucide-react";

interface Restaurant {
	name: string;
	location: string;
	rating: number;
	Link: string;
	img: string;
}

interface RestaurantCardProps {
	restaurant: Restaurant;
	onClick: () => void;
}

export default function RestaurantCard({
	restaurant,
	onClick,
}: RestaurantCardProps) {
	return (
		<button
			onClick={onClick}
			className="w-full h-full p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-sm hover:shadow-md hover:border-green-500 transition-all duration-200 text-left flex flex-col gap-3"
		>
			<div className="flex items-start justify-between gap-2">
				<h3 className="text-lg font-semibold text-gray-800 line-clamp-2 flex-1">
					{restaurant.name}
				</h3>
				<ExternalLink size={16} className="text-green-600 flex-shrink-0 mt-1" />
			</div>

			<div className="flex items-center gap-2 text-sm text-gray-600">
				<Star size={16} className="text-yellow-500 fill-yellow-500" />
				<span className="font-medium">{restaurant.rating}</span>
			</div>

			<div className="flex-1">
				<div className="flex items-start gap-1 text-xs text-gray-500">
					<MapPin size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
					<p className="line-clamp-2">{restaurant.location}</p>
				</div>
			</div>

			<div className="text-xs text-green-600 font-medium">
				View Details →
			</div>
		</button>
	);
}

