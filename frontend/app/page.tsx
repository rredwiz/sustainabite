import { Leaf } from "lucide-react";

export default function Home() {
	return (
		// off-white green background color with gradient no teal
		// less green, more off-white
		<div className="flex min-h-screen items-center justify-center font-sans bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50">
			<main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-10 px-6 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 sm:items-start">
				<div className="flex flex-col items-center justify-center bg-white p-4 w-full rounded-lg shadow-sm border border-gray-300">
					<h1 className="text-2xl font-bold text-black flex items-center gap-2">
						<Leaf className="text-green-600" size={24} />
						Sustainabite
					</h1>
					<p className="text-md text-gray-600">
						Reduce food waste, save money, eat well
					</p>
				</div>
			</main>
		</div>
	);
}
