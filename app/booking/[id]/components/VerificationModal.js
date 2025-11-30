'use client';
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Upload, X, FileText, Image } from "lucide-react";

function VerificationModal({ isOpen, onClose, onConfirm, loading }) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploadError, setUploadError] = useState("");

    // Disable scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setUploadedFiles([]);
            setUploadError("");
            setProgress(0);
        }
    }, [isOpen]);

    // ---------------------------------------
    // FILE UPLOAD HANDLER
    // ---------------------------------------
    async function handleFileUpload(file) {
        setUploading(true);
        setProgress(15);
        setUploadError("");

        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError("File size must be less than 5MB");
            setUploading(false);
            return;
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setUploadError("Please upload JPG, PNG, or PDF files only");
            setUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            // Fake smooth progress until 90%
            let current = 15;
            const interval = setInterval(() => {
                current += 5;
                setProgress(current);
                if (current >= 90) clearInterval(interval);
            }, 200);

            // Upload request
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const json = await res.json();
            if (!json.success) throw new Error(json.error);

            // Jump to 100%
            setProgress(100);
            clearInterval(interval);

            // Add to uploaded files
            const newFile = {
                id: Date.now(),
                name: file.name,
                type: file.type,
                public_id: json.data.public_id,
                url: json.data.public_id,
                size: file.size
            };

            setUploadedFiles(prev => [...prev, newFile]);

            // Hide progress after a moment
            setTimeout(() => {
                setUploading(false);
                setProgress(0);
            }, 800);

        } catch (err) {
            console.error("Upload Error:", err.message);
            setUploadError("Upload failed. Please try again.");
            setUploading(false);
            setProgress(0);
        }
    }

    // ---------------------------------------
    // DELETE FILE
    // ---------------------------------------
    async function handleDeleteFile(fileId, public_id) {
        try {
            if (public_id) {
                await fetch(`/api/upload?public_id=${public_id}`, {
                    method: "DELETE",
                });
            }

            setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
        } catch (err) {
            console.error("Delete Error:", err.message);
            setUploadError("Failed to delete file");
        }
    }

    // ---------------------------------------
    // HANDLE FILE SELECT
    // ---------------------------------------
    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
        e.target.value = ""; // Reset input
    }

    // ---------------------------------------
    // HANDLE DRAG AND DROP
    // ---------------------------------------
    function handleDrop(e) {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    // ---------------------------------------
    // GET FILE ICON
    // ---------------------------------------
    function getFileIcon(type) {
        if (type.startsWith('image/')) {
            return <Image className="w-5 h-5" />;
        } else if (type === 'application/pdf') {
            return <FileText className="w-5 h-5" />;
        }
        return <FileText className="w-5 h-5" />;
    }

    // ---------------------------------------
    // FORMAT FILE SIZE
    // ---------------------------------------
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    if (!isOpen) return null;

    return (
        <div
            className="fixed left-0 top-0 w-full h-full 
                       flex items-center justify-center 
                       bg-black/70 backdrop-blur-sm 
                       z-[9999] p-4"
            style={{ position: "fixed" }}
        >
            <div
                className="bg-neutral-900 rounded-2xl p-6 max-w-md w-full 
                           border border-white/10 shadow-2xl 
                           relative z-[10000] max-h-[90vh] overflow-y-auto"
            >
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-teal-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        Confirm Your Booking
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                        We&apos;ll hold your spot for 30 minutes!
                        After you confirm, the admin will review your booking.
                        Payment unlocks only after approval.
                        If the admin takes too long, the booking auto-expires and gets deleted.
                    </p>
                </div>

                {/* Upload ID Section */}
                <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3">Upload ID Proof</h4>

                    {!uploadedFiles.length ? (
                        <div className="space-y-4">
                            <div
                                className="relative border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center transition-colors hover:border-teal-500/50 cursor-pointer"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                            >
                                <div className="mb-3">
                                    <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Upload className="w-6 h-6 text-teal-400" />
                                    </div>
                                </div>
                                <p className="text-sm text-neutral-300 mb-2">Upload ID Proof</p>
                                <p className="text-xs text-neutral-500 mb-3">Supports JPG, PNG, PDF (Max 5MB)</p>
                                <p className="text-xs text-neutral-600">Drag & drop or click to browse</p>

                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileSelect}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>

                            {/* Progress Bar */}
                            {uploading && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-400">Uploading...</span>
                                        <span className="text-teal-400">{progress}%</span>
                                    </div>
                                    <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-300 ease-out"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {uploadedFiles.map((file) => (
                                <div key={file.id} className="border border-green-500/30 rounded-lg bg-green-500/5 p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                        {getFileIcon(file.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-green-400 font-medium text-sm truncate">{file.name}</p>
                                        <p className="text-green-400/70 text-xs">{formatFileSize(file.size)}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteFile(file.id, file.public_id)}
                                        className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {uploadError && (
                        <p className="text-red-400 text-sm mt-2">{uploadError}</p>
                    )}
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        disabled={loading || uploading}
                        className="flex-1 py-3 px-4 bg-neutral-700 hover:bg-neutral-600 
                                   text-white rounded-lg transition font-medium 
                                   disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(uploadedFiles)}
                        disabled={loading || uploading || uploadedFiles.length === 0}
                        className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 
                                   text-white rounded-lg transition font-medium 
                                   disabled:opacity-50 flex items-center justify-center"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Continue"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VerificationModal;