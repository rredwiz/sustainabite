"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSpeech } from "@/context/SpeechContext";
import { Tooltip } from "@heroui/tooltip";

export default function SpeakableToggle() {
	const { isSpeakable, toggleSpeakable } = useSpeech();

	return (
		<div className="fixed bottom-5 right-5 z-50">
			<Tooltip
				content={
					<div className="flex bg-black/50 text-white px-2 py-1 rounded-full items-center gap-2">
						{isSpeakable ? "Disable audio" : "Enable audio"}
					</div>
				}
				showArrow={true}
				color="foreground"
				placement="left"
			>
				<button
					onClick={toggleSpeakable}
					className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110 active:scale-95 ${
						isSpeakable
							? "bg-green-600 hover:bg-green-700"
							: "bg-red-600 hover:bg-red-700"
					}`}
					aria-label={isSpeakable ? "Disable audio" : "Enable audio"}
				>
					<div className="relative w-6 h-6">
						{/* Volume2 icon with fade transition */}
						<div
							className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
								isSpeakable
									? "opacity-100 rotate-0 scale-100"
									: "opacity-0 rotate-90 scale-50"
							}`}
						>
							<Volume2 size={24} className="text-white" />
						</div>
						{/* VolumeX icon with fade transition */}
						<div
							className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
								!isSpeakable
									? "opacity-100 rotate-0 scale-100"
									: "opacity-0 -rotate-90 scale-50"
							}`}
						>
							<VolumeX size={24} className="text-white" />
						</div>
					</div>
				</button>
			</Tooltip>
		</div>
	);
}
