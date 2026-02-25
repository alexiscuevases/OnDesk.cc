import { FormModal } from "@/shared/components";
import { SignatureForm } from "../forms/signature-form";
import { type SignatureFormValues } from "../schemas/config.schema";

interface AddSignatureModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (values: SignatureFormValues) => void;
}

export function AddSignatureModal({ open, onOpenChange, onConfirm }: AddSignatureModalProps) {
	return (
		<FormModal
			open={open}
			onOpenChange={onOpenChange}
			title="Add Signature"
			description="Create a signature template with variables"
			maxWidth="sm:max-w-lg">
			<SignatureForm
				submitLabel="Create Signature"
				onSubmit={(values) => {
					onConfirm(values);
					onOpenChange(false);
				}}
				onCancel={() => onOpenChange(false)}
			/>
		</FormModal>
	);
}
