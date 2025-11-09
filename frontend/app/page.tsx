"use client";

import { Leaf, Carrot, DollarSign, Heart, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
	const router = useRouter();

	return (
		<div className="flex h-screen items-center justify-center font-sans bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50">
			<main className="flex h-full w-full max-w-6xl flex-col items-center justify-center py-10 px-6">
				<div className="flex flex-col items-center justify-center text-center mb-12">
					<div className="flex items-center gap-2 mb-2">
						<Leaf className="text-green-600" size={40} />
						<h1 className="text-5xl font-bold text-black">
							Sustainabite
						</h1>
					</div>
					<p className="text-xl text-gray-700 mb-5 max-w-2xl">
						Reduce food waste, save money, eat well
					</p>
					<p className="text-base text-gray-600 mb-10 max-w-xl">
						Turn your ingredients into delicious meals with
						AI-powered recipe suggestions tailored to your kitchen
					</p>
					<button
						onClick={() => router.push("/chat")}
						className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-base font-semibold rounded-full transition-colors shadow-lg hover:shadow-xl"
					>
						Get Started
						<ArrowRight size={20} />
					</button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
					<div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-sm border border-gray-300">
						<div className="p-3 bg-green-100 rounded-full mb-3">
							<Carrot className="text-green-600" size={28} />
						</div>
						<h3 className="text-lg font-semibold text-black mb-1.5">
							Smart Ingredient Detection
						</h3>
						<p className="text-sm text-gray-600">
							Upload photos of your ingredients and let AI
							identify what you have in your kitchen
						</p>
					</div>

					<div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-sm border border-gray-300">
						<div className="p-3 bg-blue-100 rounded-full mb-3">
							<DollarSign className="text-blue-600" size={28} />
						</div>
						<h3 className="text-lg font-semibold text-black mb-1.5">
							Budget-Friendly Recipes
						</h3>
						<p className="text-sm text-gray-600">
							Set your budget and get meal suggestions that help
							you save money while eating well
						</p>
					</div>

					<div className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-sm border border-gray-300">
						<div className="p-3 bg-red-100 rounded-full mb-3">
							<Heart className="text-red-600" size={28} />
						</div>
						<h3 className="text-lg font-semibold text-black mb-1.5">
							Personalized Cooking
						</h3>
						<p className="text-sm text-gray-600">
							Tell us what kitchen tools you have, and we'll adapt
							recipes to your available equipment
						</p>
					</div>
				</div>

				<div className="mt-10 text-center">
					<p className="text-gray-500 text-xs">
						Make the most of what you have. Waste less, enjoy more.
					</p>
				</div>
			</main>
		</div>
	);
}
