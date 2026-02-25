"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Mention from "@tiptap/extension-mention";
import { useState } from "react";
import {
	Bold,
	Italic,
	List,
	ListOrdered,
	Link2,
	Underline as UnderlineIcon,
	AlignLeft,
	AlignCenter,
	AlignRight,
	Image as ImageIcon,
	Heading1,
	Heading2,
	Heading3,
	Heading6,
	Heading5,
	Heading4,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface MentionMember {
	id: string;
	name: string;
}

interface TiptapEditorProps {
	content: string;
	onChange: (content: string) => void;
	placeholder?: string;
	className?: string;
	minHeight?: string;
	members?: MentionMember[];
}

export function TiptapEditor({ content, onChange, placeholder = "Type your message...", className, minHeight = "min-h-[120px]", members = [] }: TiptapEditorProps) {
	const [linkDialogOpen, setLinkDialogOpen] = useState(false);
	const [linkUrl, setLinkUrl] = useState("");
	const [linkText, setLinkText] = useState("");
	const [imageDialogOpen, setImageDialogOpen] = useState(false);
	const [imageUrl, setImageUrl] = useState("");
	const [imageFile, setImageFile] = useState<File | null>(null);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [1, 2, 3, 4, 5, 6],
				},
				code: false,
				codeBlock: false,
			}),
			Placeholder.configure({
				placeholder,
			}),
			Link.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: "text-primary underline cursor-pointer",
				},
			}),
			Underline,
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
			Image.configure({
				inline: false,
				allowBase64: true,
				HTMLAttributes: {
					class: "max-w-full h-auto rounded-lg my-2",
				},
			}),
			...(members.length > 0
				? [
						Mention.configure({
							HTMLAttributes: {
								class: "text-primary bg-primary/10 rounded px-1",
								"data-mention": "true",
							},
							renderHTML({ node }: { node: any }) {
								return ["span", { class: "text-primary bg-primary/10 rounded px-1", "data-mention": "true", "data-mention-id": node.attrs.id }, `@${node.attrs.label ?? node.attrs.id}`];
							},
							suggestion: {
								items: ({ query }: { query: string }) => {
									return members.filter((m) => m.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
								},
								render: () => {
									let component: HTMLDivElement;
									let popup: HTMLDivElement;

									const buildList = (items: MentionMember[], props: any) => {
										if (items.length === 0) {
											component.innerHTML = '<div class="px-2 py-1.5 text-xs text-muted-foreground">No agents found</div>';
										} else {
											component.innerHTML = items
												.map((m) => `<div class="px-2 py-1.5 text-sm rounded hover:bg-secondary cursor-pointer" data-id="${m.id}">${m.name}</div>`)
												.join("");

											component.querySelectorAll("[data-id]").forEach((el) => {
												el.addEventListener("click", () => {
													const id = (el as HTMLElement).dataset.id!;
													const member = items.find((m) => m.id === id)!;
													props.command({ id: member.id, label: member.name });
												});
											});
										}
									};

									return {
										onStart: (props: any) => {
											component = document.createElement("div");
											component.className = "bg-popover border border-border rounded-lg shadow-md p-1 max-h-60 overflow-auto";

											buildList(props.items, props);

											if (!props.clientRect) return;

											popup = document.createElement("div");
											popup.style.position = "absolute";
											popup.style.zIndex = "50";
											popup.appendChild(component);
											document.body.appendChild(popup);

											const rect = props.clientRect();
											popup.style.top = `${rect.bottom + window.scrollY}px`;
											popup.style.left = `${rect.left + window.scrollX}px`;
										},
										onUpdate: (props: any) => {
											buildList(props.items, props);

											if (!props.clientRect) return;

											const rect = props.clientRect();
											popup.style.top = `${rect.bottom + window.scrollY}px`;
											popup.style.left = `${rect.left + window.scrollX}px`;
										},
										onExit: () => {
											if (popup) popup.remove();
										},
									};
								},
							},
						}),
					]
				: []),
		],
		content,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
		editorProps: {
			attributes: {
				class: cn("prose prose-sm max-w-none focus:outline-none", minHeight, "p-3 text-sm"),
			},
		},
	});

	if (!editor) {
		return null;
	}

	const handleAddLink = () => {
		const { from, to } = editor.state.selection;
		const text = editor.state.doc.textBetween(from, to, "");

		setLinkText(text);
		setLinkUrl("");
		setLinkDialogOpen(true);
	};

	const insertLink = () => {
		if (!linkUrl) return;

		const { from, to, empty } = editor.state.selection;

		if (!empty) {
			// There's selected text - add link to it
			editor
				.chain()
				.focus()
				.setLink({ href: linkUrl })
				.setTextSelection(to) // Move cursor to end of link
				.insertContent(" ") // Add space after link
				.run();
		} else if (linkText) {
			// No selection, but we have link text - insert new link
			editor
				.chain()
				.focus()
				.insertContent([
					{
						type: "text",
						marks: [{ type: "link", attrs: { href: linkUrl } }],
						text: linkText,
					},
					{
						type: "text",
						text: " ",
					},
				])
				.run();
		} else {
			// No selection, no text - just insert the URL as text with link
			editor
				.chain()
				.focus()
				.insertContent([
					{
						type: "text",
						marks: [{ type: "link", attrs: { href: linkUrl } }],
						text: linkUrl,
					},
					{
						type: "text",
						text: " ",
					},
				])
				.run();
		}

		setLinkDialogOpen(false);
		setLinkUrl("");
		setLinkText("");
	};

	const handleAddImage = () => {
		setImageUrl("");
		setImageFile(null);
		setImageDialogOpen(true);
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file);
			// Convert to base64 for preview and insertion
			const reader = new FileReader();
			reader.onload = (event) => {
				const result = event.target?.result as string;
				setImageUrl(result);
			};
			reader.readAsDataURL(file);
		}
	};

	const insertImage = () => {
		if (imageUrl) {
			editor
				.chain()
				.focus()
				.setImage({
					src: imageUrl,
					alt: imageFile?.name || "Image",
				})
				.createParagraphNear()
				.run();
		}
		setImageDialogOpen(false);
		setImageUrl("");
		setImageFile(null);
	};

	return (
		<>
			<div className={cn("rounded-lg border border-input bg-background", className)}>
				<div className="flex items-center gap-1 border-b border-border p-2 flex-wrap">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs font-medium">
								{editor.isActive("heading", { level: 1 })
									? "H1"
									: editor.isActive("heading", { level: 2 })
										? "H2"
										: editor.isActive("heading", { level: 3 })
											? "H3"
											: editor.isActive("heading", { level: 4 })
												? "H4"
												: editor.isActive("heading", { level: 5 })
													? "H5"
													: editor.isActive("heading", { level: 6 })
														? "H6"
														: "Normal"}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start">
							<DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>Normal</DropdownMenuItem>
							<DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
								<Heading1 className="size-4 mr-2" />
								Heading 1
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
								<Heading2 className="size-4 mr-2" />
								Heading 2
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
								<Heading3 className="size-4 mr-2" />
								Heading 3
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>
								<Heading4 className="size-4 mr-2" />
								Heading 4
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}>
								<Heading5 className="size-4 mr-2" />
								Heading 5
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}>
								<Heading6 className="size-4 mr-2" />
								Heading 6
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<Separator orientation="vertical" className="mx-1 h-5" />

					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="size-7"
						onClick={() => editor.chain().focus().toggleBold().run()}
						disabled={!editor.can().chain().focus().toggleBold().run()}
						data-active={editor.isActive("bold")}
						aria-label="Bold">
						<Bold className="size-3.5" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="size-7"
						onClick={() => editor.chain().focus().toggleItalic().run()}
						disabled={!editor.can().chain().focus().toggleItalic().run()}
						data-active={editor.isActive("italic")}
						aria-label="Italic">
						<Italic className="size-3.5" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="size-7"
						onClick={() => editor.chain().focus().toggleUnderline().run()}
						disabled={!editor.can().chain().focus().toggleUnderline().run()}
						data-active={editor.isActive("underline")}
						aria-label="Underline">
						<UnderlineIcon className="size-3.5" />
					</Button>

					<Separator orientation="vertical" className="mx-1 h-5" />

					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="size-7"
						onClick={() => editor.chain().focus().toggleBulletList().run()}
						disabled={!editor.can().chain().focus().toggleBulletList().run()}
						data-active={editor.isActive("bulletList")}
						aria-label="Bullet List">
						<List className="size-3.5" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="size-7"
						onClick={() => editor.chain().focus().toggleOrderedList().run()}
						disabled={!editor.can().chain().focus().toggleOrderedList().run()}
						data-active={editor.isActive("orderedList")}
						aria-label="Ordered List">
						<ListOrdered className="size-3.5" />
					</Button>

					<Separator orientation="vertical" className="mx-1 h-5" />

					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="size-7"
						onClick={() => editor.chain().focus().setTextAlign("left").run()}
						data-active={editor.isActive({ textAlign: "left" })}
						aria-label="Align Left">
						<AlignLeft className="size-3.5" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="size-7"
						onClick={() => editor.chain().focus().setTextAlign("center").run()}
						data-active={editor.isActive({ textAlign: "center" })}
						aria-label="Align Center">
						<AlignCenter className="size-3.5" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="size-7"
						onClick={() => editor.chain().focus().setTextAlign("right").run()}
						data-active={editor.isActive({ textAlign: "right" })}
						aria-label="Align Right">
						<AlignRight className="size-3.5" />
					</Button>

					<Separator orientation="vertical" className="mx-1 h-5" />

					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="size-7"
						onClick={handleAddLink}
						data-active={editor.isActive("link")}
						aria-label="Add Link">
						<Link2 className="size-3.5" />
					</Button>

					<Button type="button" variant="ghost" size="icon" className="size-7" onClick={handleAddImage} aria-label="Add Image">
						<ImageIcon className="size-3.5" />
					</Button>
				</div>
				<EditorContent editor={editor} />
				<style>{`
					.ProseMirror p.is-editor-empty:first-child::before {
						color: hsl(var(--muted-foreground));
						content: attr(data-placeholder);
						float: left;
						height: 0;
						pointer-events: none;
					}

					.ProseMirror:focus {
						outline: none;
					}

					button[data-active="true"] {
						background-color: hsl(var(--secondary));
					}

					.ProseMirror ul,
					.ProseMirror ol {
						padding: 0 1rem;
						margin: 0.5rem 0;
					}

					.ProseMirror li {
						margin: 0.25rem 0;
					}

					.ProseMirror a {
						color: hsl(var(--primary));
						text-decoration: underline;
						cursor: pointer;
					}

					.ProseMirror p {
						margin: 0.5rem 0;
					}

					.ProseMirror p:first-child {
						margin-top: 0;
					}

					.ProseMirror p:last-child {
						margin-bottom: 0;
					}

					.ProseMirror h1 {
						font-size: 2em;
						font-weight: bold;
						margin: 0.75rem 0;
					}

					.ProseMirror h2 {
						font-size: 1.5em;
						font-weight: bold;
						margin: 0.65rem 0;
					}

					.ProseMirror h3 {
						font-size: 1.25em;
						font-weight: bold;
						margin: 0.5rem 0;
					}

					.ProseMirror h4 {
						font-size: 1.1em;
						font-weight: bold;
						margin: 0.4rem 0;
					}

					.ProseMirror h5 {
						font-size: 1em;
						font-weight: bold;
						margin: 0.4rem 0;
					}

					.ProseMirror h6 {
						font-size: 0.9em;
						font-weight: bold;
						margin: 0.4rem 0;
					}

					.ProseMirror img {
						display: block;
						max-width: 100%;
						height: auto;
						border-radius: 0.5rem;
						margin: 0.5rem 0;
					}

					.ProseMirror img.ProseMirror-selectednode {
						outline: 2px solid hsl(var(--primary));
						outline-offset: 2px;
					}
				`}</style>
			</div>

			{/* Link Dialog */}
			<Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-base">Add Link</DialogTitle>
						<DialogDescription className="text-xs">Enter the URL and optional display text for your link</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-2">
						<div className="grid gap-2">
							<Label htmlFor="link-url" className="text-xs font-medium">
								URL
							</Label>
							<Input
								id="link-url"
								placeholder="https://example.com"
								value={linkUrl}
								onChange={(e) => setLinkUrl(e.target.value)}
								className="h-9 rounded-lg"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="link-text" className="text-xs font-medium">
								Display Text (Optional)
							</Label>
							<Input
								id="link-text"
								placeholder="Link text"
								value={linkText}
								onChange={(e) => setLinkText(e.target.value)}
								className="h-9 rounded-lg"
							/>
						</div>
					</div>
					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={() => setLinkDialogOpen(false)} className="rounded-lg">
							Cancel
						</Button>
						<Button onClick={insertLink} disabled={!linkUrl} className="rounded-lg">
							Insert Link
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Image Dialog */}
			<Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-base">Add Image</DialogTitle>
						<DialogDescription className="text-xs">Upload an image from your computer or enter an image URL</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-2">
						<div className="grid gap-2">
							<Label htmlFor="image-file" className="text-xs font-medium">
								Upload Image
							</Label>
							<Input id="image-file" type="file" accept="image/*" onChange={handleFileChange} className="h-9 rounded-lg cursor-pointer" />
						</div>

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground">Or</span>
							</div>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="image-url" className="text-xs font-medium">
								Image URL
							</Label>
							<Input
								id="image-url"
								placeholder="https://example.com/image.jpg"
								value={imageFile ? "" : imageUrl}
								onChange={(e) => {
									setImageFile(null);
									setImageUrl(e.target.value);
								}}
								disabled={!!imageFile}
								className="h-9 rounded-lg"
							/>
						</div>
						{imageUrl && (
							<div className="rounded-lg border p-2">
								<p className="text-xs text-muted-foreground mb-2">Preview:</p>
								<img
									src={imageUrl}
									alt="Preview"
									className="max-w-full h-auto rounded"
									onError={(e) => {
										e.currentTarget.style.display = "none";
									}}
								/>
							</div>
						)}
					</div>
					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={() => setImageDialogOpen(false)} className="rounded-lg">
							Cancel
						</Button>
						<Button onClick={insertImage} disabled={!imageUrl} className="rounded-lg">
							Insert Image
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
