"use client";

import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@heroui/modal";

interface UtensilsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function UtensilsModal({ isOpen, onClose }: UtensilsModalProps) {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="md"
			scrollBehavior="inside"
			placement="center"
			hideCloseButton={true}
			classNames={{
				backdrop: "bg-black/50",
			}}
		>
			<ModalContent className="bg-white rounded-lg border border-gray-300 shadow-sm">
				<ModalBody></ModalBody>
				<ModalFooter className="flex py-2 items-center justify-center gap-2">
					<button
						onClick={onClose}
						className="px-6 py-2 bg-white hover:bg-red-50 text-red-500 rounded-lg transition-colors"
					>
						Close
					</button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
