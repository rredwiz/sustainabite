"use client";
import { ImageIcon, Leaf, MessageCircle, Send } from "lucide-react";
import { Tooltip } from "@heroui/tooltip";
import { useState } from "react";
import { useSpeech } from "@/context/SpeechContext";

export default function Chat() {
	const [isInputVisible, setIsInputVisible] = useState(false);
	const { handleSpeak } = useSpeech();

	const toggleInput = () => {
		setIsInputVisible(!isInputVisible);
		handleSpeak("Message");
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
						onClick={() => handleSpeak("Image")}
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
		</div>
	);
}
