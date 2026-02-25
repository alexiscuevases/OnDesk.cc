import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface LogoUploadProps {
	label?: string;
	initials: string;
	currentUrl?: string | null;
	onUpload: (url: string) => void;
	folder?: string;
	className?: string;
}

export function LogoUpload({ label = "Logo", initials, currentUrl, onUpload, folder = "logos", className }: LogoUploadProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);
	const [preview, setPreview] = useState<string | null>(currentUrl ?? null);

	async function handleFile(file: File) {
		setUploading(true);
		const objectUrl = URL.createObjectURL(file);
		setPreview(objectUrl);

		try {
			const res = await fetch(`/api/upload?folder=${encodeURIComponent(folder)}`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": file.type, "X-File-Name": encodeURIComponent(file.name) },
				body: file,
			});
			if (!res.ok) {
				const err = (await res.json()) as { error: string };
				throw new Error(err.error ?? "Upload failed");
			}
			const data = (await res.json()) as { url: string };
			onUpload(data.url);
		} catch (e) {
			setPreview(currentUrl ?? null);
			console.error(e);
		} finally {
			setUploading(false);
		}
	}

	return (
		<div className={cn("flex items-center gap-4", className)}>
			<div className="relative group">
				<Avatar className="size-16 rounded-xl cursor-pointer" onClick={() => inputRef.current?.click()}>
					<AvatarImage src={preview ?? undefined} />
					<AvatarFallback className="rounded-xl bg-primary text-primary-foreground text-lg font-bold">
						{initials}
					</AvatarFallback>
				</Avatar>
				{uploading && (
					<div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
						<div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
					</div>
				)}
			</div>
			<div className="flex flex-col gap-1.5">
				<Label className="text-xs font-medium">{label}</Label>
				<div className="flex gap-2">
					<Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs rounded-lg" onClick={() => inputRef.current?.click()} disabled={uploading}>
						<Upload className="size-3" />
						Upload
					</Button>
					{preview && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="h-8 gap-1.5 text-xs rounded-lg text-muted-foreground"
							onClick={() => { setPreview(null); onUpload(""); }}
							disabled={uploading}>
							<X className="size-3" />
							Remove
						</Button>
					)}
				</div>
				<p className="text-[10px] text-muted-foreground">PNG, JPG, WebP or SVG · Max 2 MB</p>
			</div>
			<input
				ref={inputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
				className="hidden"
				onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
			/>
		</div>
	);
}
