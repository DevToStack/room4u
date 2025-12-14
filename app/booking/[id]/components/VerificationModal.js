'use client';
import { useEffect, useState, useRef } from "react";
import { Loader2, ShieldCheck, Upload, X, FileText, Image, ChevronDown } from "lucide-react";

export default function VerificationModal({ isOpen, onClose, onConfirm, loading }) {
    const DOCUMENTS = {
        "Aadhaar Card": { front: true, back: true },
        "PAN Card": { front: true, back: false },
        "Driving License": { front: true, back: true },
        "Passport": { front: true, back: false },
        "Voter ID": { front: true, back: true },
    };

    // States
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [frontFile, setFrontFile] = useState(null);
    const [backFile, setBackFile] = useState(null);
    const [frontPreview, setFrontPreview] = useState(null);
    const [backPreview, setBackPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    // ------------------------------
    // FILE SELECTION
    // ------------------------------
    function handleFileSelect(file, side) {
        setUploadError("");

        // Validation
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setUploadError("File size must be less than 5MB");
            return;
        }
        const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowed.includes(file.type)) {
            setUploadError("Please upload JPG, PNG, or PDF only.");
            return;
        }

        // Store file and create preview
        if (side === "front") {
            setFrontFile(file);
            if (file.type.startsWith('image/')) {
                const previewUrl = URL.createObjectURL(file);
                setFrontPreview(previewUrl);
            }
        } else {
            setBackFile(file);
            if (file.type.startsWith('image/')) {
                const previewUrl = URL.createObjectURL(file);
                setBackPreview(previewUrl);
            }
        }
    }

    // ------------------------------
    // DELETE FILE HANDLER
    // ------------------------------
    function handleDelete(side) {
        if (side === "front") {
            if (frontPreview) URL.revokeObjectURL(frontPreview);
            setFrontFile(null);
            setFrontPreview(null);
        } else {
            if (backPreview) URL.revokeObjectURL(backPreview);
            setBackFile(null);
            setBackPreview(null);
        }
        setUploadError("");
    }

    // ------------------------------
    // UPLOAD ALL FILES VIA API (BATCH UPLOAD)
    // ------------------------------
    async function uploadAllFiles() {
        if (!selectedDoc || !frontFile) return;

        setUploading(true);
        setUploadError("");

        try {
            // Prepare FormData
            const formData = new FormData();

            // Add files and their sides
            const files = [];
            const sides = [];

            if (frontFile) {
                formData.append("files[]", frontFile);
                formData.append("sides[]", "front");
                files.push(frontFile);
                sides.push("front");
            }

            if (DOCUMENTS[selectedDoc].back && backFile) {
                formData.append("files[]", backFile);
                formData.append("sides[]", "back");
                files.push(backFile);
                sides.push("back");
            }

            // Add document type
            formData.append("document_type", selectedDoc);

            // Get token
            const token = localStorage.getItem('token') || getCookie('token');

            // Upload all files at once
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
                credentials:"include",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Upload failed: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || "Upload failed");
            }

            // Call parent callback with results
            onConfirm({
                documentType: selectedDoc,
                front: result.data.front,
                back: result.data.back
            });

            // Reset state
            resetState();

        } catch (error) {
            console.error("Upload process failed:", error);
            setUploadError(error.message || "Upload failed. Please try again.");
            setUploading(false);
        }
    }

    // ------------------------------
    // CANCEL HANDLER
    // ------------------------------
    function handleCancel() {
        resetState();
        onClose();
    }

    // ------------------------------
    // RESET STATE
    // ------------------------------
    function resetState() {
        if (frontPreview) URL.revokeObjectURL(frontPreview);
        if (backPreview) URL.revokeObjectURL(backPreview);

        setSelectedDoc(null);
        setDropdownOpen(false);
        setFrontFile(null);
        setBackFile(null);
        setFrontPreview(null);
        setBackPreview(null);
        setUploadError("");
        setUploading(false);
    }

    // ------------------------------
    // CONTINUE BUTTON
    // ------------------------------
    async function handleConfirm() {
        if (!selectedDoc || !frontFile) return;
        await uploadAllFiles();
    }

    // Helper function to get cookies
    function getCookie(name) {
        if (typeof document === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (frontPreview) URL.revokeObjectURL(frontPreview);
            if (backPreview) URL.revokeObjectURL(backPreview);
        };
    }, [frontPreview, backPreview]);

    // UI helpers
    function getFileIcon(file) {
        if (!file) return <FileText className="w-5 h-5" />;
        if (file.type.startsWith("image/")) return <Image className="w-5 h-5" />;
        if (file.type === "application/pdf") return <FileText className="w-5 h-5" />;
        return <FileText className="w-5 h-5" />;
    }

    function formatSize(bytes) {
        if (!bytes) return "";
        const kb = bytes / 1024;
        if (kb < 1024) return kb.toFixed(1) + " KB";
        return (kb / 1024).toFixed(1) + " MB";
    }

    if (!isOpen) return null;

    const canContinue = selectedDoc && frontFile && (!DOCUMENTS[selectedDoc].back || backFile);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
            <div className="bg-neutral-900 rounded-2xl p-6 max-w-md w-full border border-white/10 max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-teal-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Upload ID Documents</h3>
                    <p className="text-gray-300 text-sm">
                        {uploading ? "Uploading all files..." : "Files will be uploaded when you click Continue"}
                    </p>
                </div>

                {/* Document Selection */}
                <div className="mb-5">
                    <p className="text-white mb-2 text-sm font-medium">Select Document Type</p>
                    <div
                        className="relative bg-neutral-800 border border-neutral-700 p-3 rounded-lg cursor-pointer flex justify-between items-center"
                        onClick={() => !uploading && setDropdownOpen(v => !v)}
                    >
                        <span className="text-white">
                            {selectedDoc || "Choose Document"}
                        </span>
                        <ChevronDown className={`w-5 h-5 text-white transition ${dropdownOpen ? "rotate-180" : ""}`} />
                    </div>

                    {dropdownOpen && (
                        <div className="mt-1 bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden">
                            {Object.keys(DOCUMENTS).map(doc => (
                                <div
                                    key={doc}
                                    className="p-3 text-white hover:bg-neutral-700 cursor-pointer"
                                    onClick={() => {
                                        setSelectedDoc(doc);
                                        setDropdownOpen(false);
                                        setFrontFile(null);
                                        setBackFile(null);
                                        setFrontPreview(null);
                                        setBackPreview(null);
                                        setUploadError("");
                                    }}
                                >
                                    {doc}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Front Side Upload */}
                {selectedDoc && DOCUMENTS[selectedDoc].front && (
                    <div className="mb-4">
                        <p className="text-white mb-2 text-sm font-medium">Upload Front Side</p>
                        {!frontFile ? (
                            <UploadBox
                                onSelect={(file) => handleFileSelect(file, "front")}
                                disabled={uploading}
                            />
                        ) : (
                            <UploadedFileCard
                                file={frontFile}
                                preview={frontPreview}
                                onDelete={() => !uploading && handleDelete("front")}
                                getFileIcon={getFileIcon}
                                formatSize={formatSize}
                                uploading={uploading}
                            />
                        )}
                    </div>
                )}

                {/* Back Side Upload */}
                {selectedDoc && DOCUMENTS[selectedDoc].back && (
                    <div className="mb-4">
                        <p className="text-white mb-2 text-sm font-medium">Upload Back Side</p>
                        {!backFile ? (
                            <UploadBox
                                onSelect={(file) => handleFileSelect(file, "back")}
                                disabled={uploading}
                            />
                        ) : (
                            <UploadedFileCard
                                file={backFile}
                                preview={backPreview}
                                onDelete={() => !uploading && handleDelete("back")}
                                getFileIcon={getFileIcon}
                                formatSize={formatSize}
                                uploading={uploading}
                            />
                        )}
                    </div>
                )}

                {/* Upload Status */}
                {uploading && (
                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                            <p className="text-blue-400 text-sm">Uploading all files to Cloudinary...</p>
                        </div>
                        <p className="text-blue-400/70 text-xs mt-1">
                            Please wait while we upload your documents
                        </p>
                    </div>
                )}

                {/* Error Message */}
                {uploadError && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                        <p className="text-red-400 text-sm">{uploadError}</p>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleCancel}
                        disabled={uploading}
                        className="flex-1 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg disabled:opacity-50 transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleConfirm}
                        disabled={!canContinue || uploading}
                        className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg disabled:opacity-50 flex justify-center items-center transition-colors"
                    >
                        {uploading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Uploading...</span>
                            </div>
                        ) : (
                            "Continue"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Sub-components
function UploadBox({ onSelect, disabled }) {
    return (
        <div className="relative border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center hover:border-teal-500/50 transition-colors">
            <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                    if (e.target.files.length > 0) onSelect(e.target.files[0]);
                    e.target.value = "";
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={disabled}
            />
            <div className="w-12 h-12 bg-teal-500/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Upload className="w-6 h-6 text-teal-400" />
            </div>
            <p className="text-neutral-300 text-sm">Click to select file</p>
            <p className="text-neutral-500 text-xs">JPG, PNG, PDF — Max 5MB</p>
            {disabled && (
                <p className="text-amber-400 text-xs mt-2">Upload in progress...</p>
            )}
        </div>
    );
}

function UploadedFileCard({ file, preview, onDelete, getFileIcon, formatSize, uploading }) {
    return (
        <div className={`flex items-center gap-3 p-3 border rounded-lg ${uploading
            ? 'bg-blue-500/10 border-blue-500/30'
            : 'bg-green-500/10 border-green-500/30'
            }`}>
            {preview ? (
                <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${uploading ? 'bg-blue-500/20' : 'bg-green-500/20'
                    }`}>
                    {getFileIcon(file)}
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${uploading ? 'text-blue-400' : 'text-green-400'
                    }`}>
                    {file.name}
                </p>
                <div className="flex items-center justify-between">
                    <p className={`text-xs ${uploading ? 'text-blue-400/70' : 'text-green-400/70'
                        }`}>
                        {formatSize(file.size)}
                        {uploading ? ' • Uploading...' : ' • Ready to upload'}
                    </p>
                </div>
            </div>
            {!uploading && (
                <button
                    onClick={onDelete}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg flex-shrink-0 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}