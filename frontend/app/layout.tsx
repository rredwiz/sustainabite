import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SpeechProvider } from "@/context/SpeechContext";
import SpeakableToggle from "@/components/SpeakableToggle";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Sustainabite",
	description: "Sustainabite",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${inter.variable} antialiased`}>
				<SpeechProvider>
					{children}
					<SpeakableToggle />
				</SpeechProvider>
			</body>
		</html>
	);
}
