"use client";

import {
	createContext,
	useContext,
	useState,
	useCallback,
	ReactNode,
} from "react";

interface SpeechContextType {
	isSpeakable: boolean;
	toggleSpeakable: () => void;
	handleSpeak: (text: string) => void;
}

const SpeechContext = createContext<SpeechContextType | undefined>(undefined);

export function SpeechProvider({ children }: { children: ReactNode }) {
	const [isSpeakable, setIsSpeakable] = useState(true);

	const toggleSpeakable = useCallback(() => {
		setIsSpeakable((prev) => !prev);
	}, []);

	const handleSpeak = useCallback(
		(text: string) => {
			if (!isSpeakable) return;
			const utterance = new SpeechSynthesisUtterance(text);
			window.speechSynthesis.speak(utterance);
		},
		[isSpeakable]
	);

	return (
		<SpeechContext.Provider
			value={{ isSpeakable, toggleSpeakable, handleSpeak }}
		>
			{children}
		</SpeechContext.Provider>
	);
}

export function useSpeech() {
	const context = useContext(SpeechContext);
	if (context === undefined) {
		throw new Error("useSpeech must be used within a SpeechProvider");
	}
	return context;
}
