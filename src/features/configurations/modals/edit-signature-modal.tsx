import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SignatureForm } from "../forms/signature-form";
import { type SignatureFormValues } from "../schemas/config.schema";
interface EditSignatureModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	signature: { id: string; name: string; content: string; is_default: boolean } | null;
	onConfirm: (values: SignatureFormValues) => void;
}

export function EditSignatureModal({ open, onOpenChange, signature, onConfirm }: EditSignatureModalProps) {
	if (!signature) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Edit Signature</DialogTitle>
					<DialogDescription>Update the signature template</DialogDescription>
				</DialogHeader>
				<SignatureForm
					key={signature.id}
					defaultValues={{ name: signature.name, content: signature.content, isDefault: signature.is_default }}
					submitLabel="Save Changes"
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
