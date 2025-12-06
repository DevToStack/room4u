'use client';
import { useEffect, useState, useRef } from "react";
import { Loader2, ShieldCheck, Upload, X, FileText, Image, ChevronDown } from "lucide-react";

/**
 * VerificationModal (Optimized)
 * - Separate uploading/progress state per side (front/back)
 * - Cleaner upload logic with interval cleanup
 * - Same UX & API usage as your original component
 */

export default function VerificationModal({ isOpen, onClose, onConfirm, loading }) {
    const DOCUMENTS = {
        "Aadhaar Card": { front: true, back: true },
        "PAN Card": { front: true, back: false },
        "Driving License": { front: true, back: true },
        "Passport": { front: true, back: false },
        "Voter ID": { front: true, back: true },
    };

    // selected doc
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // uploaded files
    const [frontFile, setFrontFile] = useState(null);
    const [backFile, setBackFile] = useState(null);

    // per-side uploading + progress
    const [frontUploading, setFrontUploading] = useState(false);
    const [frontProgress, setFrontProgress] = useState(0);

    const [backUploading, setBackUploading] = useState(false);
    const [backProgress, setBackProgress] = useState(0);

    const [uploadError, setUploadError] = useState("");
    const [tempUploads, setTempUploads] = useState([]); // server-side temporary public_ids

    // refs to hold intervals so we can clear them reliably
    const progressIntervalRef = useRef({ front: null, back: null });

    // disable page scroll while modal open
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => (document.body.style.overflow = "");
    }, [isOpen]);

    // reset when modal closes
    useEffect(() => {
        if (!isOpen) resetModal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    function resetModal() {
        // clear any running intervals
        clearInterval(progressIntervalRef.current.front);
        clearInterval(progressIntervalRef.current.back);
        progressIntervalRef.current.front = null;
        progressIntervalRef.current.back = null;

        setSelectedDoc(null);
        setDropdownOpen(false);
        setFrontFile(null);
        setBackFile(null);
        setUploadError("");
        setFrontProgress(0);
        setBackProgress(0);
        setFrontUploading(false);
        setBackUploading(false);
        setTempUploads([]);
    }

    // Helper to choose state setters by side
    function settersFor(side) {
        if (side === "front") {
            return {
                setUploading: setFrontUploading,
                setProgress: setFrontProgress,
                setFile: setFrontFile,
                clearIntervalRefKey: "front",
            };
        }
        return {
            setUploading: setBackUploading,
            setProgress: setBackProgress,
            setFile: setBackFile,
            clearIntervalRefKey: "back",
        };
    }

    // ------------------------------
    // FILE UPLOAD
    // ------------------------------
    async function handleFileUpload(file, side) {
        setUploadError(""); // clear previous errors
        const { setUploading, setProgress, setFile, clearIntervalRefKey } = settersFor(side);

        // validation
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

        setUploading(true);
        setProgress(10);

        // start a smooth fake progress (cleared when actual upload finishes)
        let current = 10;
        if (progressIntervalRef.current[clearIntervalRefKey]) {
            clearInterval(progressIntervalRef.current[clearIntervalRefKey]);
        }
        progressIntervalRef.current[clearIntervalRefKey] = setInterval(() => {
            current += 4 + Math.floor(Math.random() * 3); // slight randomness
            if (current >= 90) {
                current = 90;
                clearInterval(progressIntervalRef.current[clearIntervalRefKey]);
                progressIntervalRef.current[clearIntervalRefKey] = null;
            }
            setProgress(Math.min(current, 90));
        }, 180);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const json = await res.json();

            if (!json.success) throw new Error(json.error || "Upload failed");

            // add to tempUploads for cleanup later
            setTempUploads(prev => [...prev, json.data.public_id]);

            const uploadedFile = {
                name: file.name,
                type: file.type,
                size: file.size,
                url: json.data.public_id,
                public_id: json.data.public_id,
            };

            // set the uploaded file into correct side
            setFile(uploadedFile);

            // finalize progress
            setProgress(100);

            // clear interval if still present
            if (progressIntervalRef.current[clearIntervalRefKey]) {
                clearInterval(progressIntervalRef.current[clearIntervalRefKey]);
                progressIntervalRef.current[clearIntervalRefKey] = null;
            }

            // small delay to let user see 100%
            setTimeout(() => {
                setUploading(false);
                setProgress(0);
            }, 600);
        } catch (err) {
            console.error("Upload error:", err);
            setUploadError("Upload failed, try again.");

            // cleanup interval and state
            if (progressIntervalRef.current[clearIntervalRefKey]) {
                clearInterval(progressIntervalRef.current[clearIntervalRefKey]);
                progressIntervalRef.current[clearIntervalRefKey] = null;
            }
            setUploading(false);
            setProgress(0);
        }
    }

    // ------------------------------
    // DELETE SINGLE FILE
    // ------------------------------
    async function handleDelete(side) {
        const file = side === "front" ? frontFile : backFile;
        const { setFile } = settersFor(side);

        if (!file) return;

        try {
            if (file?.public_id) {
                await fetch(`/api/upload?public_id=${encodeURIComponent(file.public_id)}`, { method: "DELETE" });
                setTempUploads(prev => prev.filter(id => id !== file.public_id));
            }
        } catch (err) {
            console.warn("Error deleting file on server:", err);
        }

        setFile(null);
    }

    // ------------------------------
    // CANCEL → DELETE ALL FILES
    // ------------------------------
    async function handleCancel() {
        // prevent cancel while an upload is active
        if (frontUploading || backUploading) {
            setUploadError("Please wait for uploads to finish or cancel each upload first.");
            return;
        }

        // delete all temporary images on server
        for (let id of tempUploads) {
            try {
                await fetch(`/api/upload?public_id=${encodeURIComponent(id)}`, { method: "DELETE" });
            } catch (err) {
                console.warn("Failed to delete temp upload:", id, err);
            }
        }

        resetModal();
        onClose();
    }

    // ------------------------------
    // CONFIRM
    // ------------------------------
    async function handleConfirm() {
        // basic guard (should be disabled already by button)
        if (!selectedDoc) return;

        onConfirm({
            documentType: selectedDoc,
            front: frontFile,
            back: backFile
        });

        // Clear temp list (files are now "official" on server)
        setTempUploads([]);
    }

    // UI helpers
    function getFileIcon(type) {
        if (!type) return <FileText className="w-5 h-5" />;
        if (type.startsWith("image/")) return <Image className="w-5 h-5" />;
        return <FileText className="w-5 h-5" />;
    }

    function formatSize(bytes) {
        if (!bytes) return "";
        const kb = bytes / 1024;
        if (kb < 1024) return kb.toFixed(1) + " KB";
        return (kb / 1024).toFixed(1) + " MB";
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
            <div className="bg-neutral-900 rounded-2xl p-6 max-w-md w-full border border-white/10 max-h-[90vh] overflow-y-auto">

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-teal-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Confirm Your Booking</h3>
                    <p className="text-gray-300 text-sm">
                        Upload required ID documents for verification.
                    </p>
                </div>

                {/* Document Dropdown */}
                <div className="mb-5">
                    <p className="text-white mb-2 text-sm font-medium">Select Document Type</p>

                    <div
                        className="relative bg-neutral-800 border border-neutral-700 p-3 rounded-lg cursor-pointer flex justify-between items-center"
                        onClick={() => setDropdownOpen(v => !v)}
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
                                        // reset existing files when switching doc type
                                        setFrontFile(null);
                                        setBackFile(null);
                                        setUploadError("");
                                    }}
                                >
                                    {doc}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* FRONT UPLOAD */}
                {selectedDoc && DOCUMENTS[selectedDoc].front && (
                    <div className="mb-4">
                        <p className="text-white mb-2 text-sm font-medium">Upload Front Side</p>

                        {!frontFile ? (
                            <UploadBox
                                onSelect={(file) => handleFileUpload(file, "front")}
                                uploading={frontUploading}
                                progress={frontProgress}
                            />
                        ) : (
                            <UploadedFileCard file={frontFile} onDelete={() => handleDelete("front")} getFileIcon={getFileIcon} formatSize={formatSize} />
                        )}
                    </div>
                )}

                {/* BACK UPLOAD */}
                {selectedDoc && DOCUMENTS[selectedDoc].back && (
                    <div className="mb-4">
                        <p className="text-white mb-2 text-sm font-medium">Upload Back Side</p>

                        {!backFile ? (
                            <UploadBox
                                onSelect={(file) => handleFileUpload(file, "back")}
                                uploading={backUploading}
                                progress={backProgress}
                            />
                        ) : (
                            <UploadedFileCard file={backFile} onDelete={() => handleDelete("back")} getFileIcon={getFileIcon} formatSize={formatSize} />
                        )}
                    </div>
                )}

                {uploadError && <p className="text-red-400 text-sm">{uploadError}</p>}

                {/* BUTTONS */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleCancel}
                        disabled={frontUploading || backUploading || loading}
                        className="flex-1 py-3 bg-neutral-700 text-white rounded-lg disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleConfirm}
                        disabled={
                            frontUploading ||
                            backUploading ||
                            loading ||
                            !selectedDoc ||
                            !frontFile ||
                            (DOCUMENTS[selectedDoc].back && !backFile)
                        }
                        className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg disabled:opacity-50 flex justify-center items-center"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* -------------------------
   SMALL SUB-COMPONENTS
   (kept inside file for simplicity)
-------------------------- */

function UploadBox({ onSelect, uploading, progress }) {
    return (
        <div className="relative border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center cursor-pointer hover:border-teal-500/50">
            <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                    if (e.target.files.length > 0) onSelect(e.target.files[0]);
                    e.target.value = "";
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 bg-teal-500/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Upload className="w-6 h-6 text-teal-400" />
            </div>
            <p className="text-neutral-300 text-sm">Click to Upload</p>
            <p className="text-neutral-500 text-xs">JPG, PNG, PDF — Max 5MB</p>

            {uploading && (
                <div className="mt-3">
                    <div className="flex justify-between text-sm text-neutral-400">
                        <span>Uploading…</span>
                        <span className="text-teal-400">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full mt-1 overflow-hidden">
                        <div
                            className="h-full bg-teal-600 transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function UploadedFileCard({ file, onDelete, getFileIcon, formatSize }) {
    return (
        <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                {getFileIcon(file.type)}
            </div>
            <div className="flex-1">
                <p className="text-green-400 font-medium text-sm truncate">{file.name}</p>
                <p className="text-green-400/70 text-xs">{formatSize(file.size)}</p>
            </div>
            <button onClick={onDelete} className="p-2 bg-red-600 hover:bg-red-700 rounded-lg">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
