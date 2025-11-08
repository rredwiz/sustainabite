"use client";

import { ImageIcon, MessageCircle, Send } from "lucide-react";
import { Tooltip } from "@heroui/tooltip";

interface ChatActionBarProps {
	onImageClick: () => void;
	onMessageClick: () => void;
	onSendClick: () => void;
	isInputVisible: boolean;
}

export default function ChatActionBar({
	onImageClick,
	onMessageClick,
	onSendClick,
	isInputVisible,
}: ChatActionBarProps) {
	return (
		<div className="flex items-center justify-center gap-2 bg-white p-4 rounded-full shadow-sm border border-gray-300">
			<button
				onClick={onImageClick}
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
				onClick={onMessageClick}
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
				onClick={onSendClick}
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
	);
}
