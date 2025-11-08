"use client";

import { useSpeech } from "react-text-to-speech";
import { useEffect } from "react";

export default function Speakable({ children }: { children: string }) {
	const { Text, start, stop } = useSpeech({ text: children });

	useEffect(() => {
		// Small delay to ensure tooltip is visible and browser allows audio
		const timer = setTimeout(() => {
			start();
		}, 100);

		return () => {
			clearTimeout(timer);
			stop();
		};
	}, [start, stop]);

	return <Text />;
}
