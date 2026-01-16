import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Facebook, Linkedin, Twitter, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareNomineeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    nomineeName: string;
    nomineeId: string;
    categoryId: string; // We need categoryId to construct the URL
}

const ShareNomineeDialog = ({
    isOpen,
    onClose,
    nomineeName,
    nomineeId,
    categoryId,
}: ShareNomineeDialogProps) => {
    const [copied, setCopied] = useState(false);

    // Construct the share URL
    // Assuming the vote page structure is /vote/:categoryId?nominee=:nomineeId or similar
    // Based on the user's existing routes: <Route path="/vote/:categoryId" element={<VotePage />} />
    const shareUrl = `${window.location.origin}/vote/${categoryId}?nominee=${nomineeId}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy link");
        }
    };

    const shareText = `Vote for ${nomineeName} at addisgamesweek!`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-card/90 backdrop-blur-xl border-primary/20">
                <DialogHeader>
                    <DialogTitle className="text-xl font-display tracking-wide flex items-center gap-2">
                        Share <span className="text-primary">{nomineeName}</span>
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Help this nominee win by sharing their profile with your friends and community!
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="link" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Direct Link
                        </Label>
                        <div className="flex items-center space-x-2">
                            <div className="relative flex-1">
                                <Input
                                    id="link"
                                    value={shareUrl}
                                    readOnly
                                    className="pr-10 bg-muted/50 border-white/10 focus-visible:ring-primary/50"
                                />
                            </div>
                            <Button
                                type="button"
                                size="icon"
                                onClick={copyToClipboard}
                                className={copied ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:bg-primary/90"}
                            >
                                {copied ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Share via Social Media
                        </Label>
                        <div className="flex gap-3 justify-center pt-2 flex-wrap">
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors"
                                aria-label="Share on Facebook"
                            >
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a
                                href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors"
                                aria-label="Share on Twitter"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a
                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 transition-colors"
                                aria-label="Share on LinkedIn"
                            >
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a
                                href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                                aria-label="Share on WhatsApp"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-message-circle"
                                >
                                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                                </svg>
                            </a>
                            <a
                                href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-full bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20 transition-colors"
                                aria-label="Share on Telegram"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-8.609 3.33c-2.068.8-4.133 1.598-5.724 2.21a405.15 405.15 0 0 1-2.849 1.09c-.42.147-.99.332-1.473.901-.728.968.193 1.798.919 2.286 1.61.516 3.275 1.009 4.654 1.472.509 1.793.997 3.592 1.48 5.388.16.36.506.494.864.498l-.002.018s.281.028.555-.038a2.1 2.1 0 0 0 .933-.517c.345-.324 1.28-1.244 1.811-1.764l3.999 2.952.032.018s.442.311 1.09.355c.324.037.75-.048 1.118-.308.585-.48.904-1.558.977-1.794L24 2.5l-2.802-.067z" />
                                    <path d="m14.28 8.84-5.32 4.96-.54 3.73 2.1-7.23 3.76-1.46z" />
                                </svg>
                            </a>
                            <button
                                onClick={() => {
                                    copyToClipboard();
                                    toast.success("Link copied! Open TikTok to create your video.");
                                }}
                                className="p-3 rounded-full bg-[#000000]/10 text-[#000000] dark:text-white dark:bg-white/10 hover:bg-[#000000]/20 dark:hover:bg-white/20 transition-colors"
                                aria-label="Share on TikTok"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ShareNomineeDialog;
