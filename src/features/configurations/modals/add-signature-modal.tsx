import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SignatureForm } from "../forms/signature-form";
import { type SignatureFormValues } from "../schemas/config.schema";

interface AddSignatureModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (values: SignatureFormValues) => void;
}

export function AddSignatureModal({ open, onOpenChange, onConfirm }: AddSignatureModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Add Signature</DialogTitle>
					<DialogDescription>Create a signature template with variables</DialogDescription>
				</DialogHeader>
				<SignatureForm
					submitLabel="Create Signature"
					onSubmit={(values) => {
						onConfirm(values);
						onOpenChange(false);
					}}
					onCancel={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}
