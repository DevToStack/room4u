import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTimes,
    faChevronLeft,
    faChevronRight,
    faDownload,
    faExternalLinkAlt,
    faSearchPlus,
    faSearchMinus,
    faExpand,
    faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

export default function ImagePreviewer({
    images,
    initialIndex = 0,
    imagePreviewOpen,
    closeImagePreview,
}) {
    const [isLoading, setIsLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex);

    const previewImage = images[currentImageIndex];
    const hasPrevious = currentImageIndex > 0;
    const hasNext = currentImageIndex < images.length - 1;

    // Navigation
    const goToPrevious = () => {
        if (hasPrevious) {
            setCurrentImageIndex(currentImageIndex - 1);
            setIsLoading(true);
            setImageError(false);
        }
    };

    const goToNext = () => {
        if (hasNext) {
            setCurrentImageIndex(currentImageIndex + 1);
            setIsLoading(true);
            setImageError(false);
        }
    };

    // Zoom
    const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
    const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
    const resetZoom = () => setZoomLevel(1);

    // Download
    const downloadImage = async () => {
        try {
            const response = await fetch(previewImage.image_url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = previewImage.image_name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download failed:", error);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!imagePreviewOpen) return;
            switch (e.key) {
                case "Escape":
                    closeImagePreview();
                    break;
                case "ArrowLeft":
                    goToPrevious();
                    break;
                case "ArrowRight":
                    goToNext();
                    break;
                case "+":
                    zoomIn();
                    break;
                case "-":
                    zoomOut();
                    break;
                case "0":
                    resetZoom();
                    break;
                default:
                    break;
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [imagePreviewOpen, currentImageIndex]);

    if (!imagePreviewOpen || !previewImage) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
            {/* Close Button */}
            <button
                onClick={closeImagePreview}
                className="absolute top-4 right-4 z-10 text-white text-2xl hover:text-gray-300 transition-colors duration-200 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            >
                <FontAwesomeIcon icon={faTimes} />
            </button>

            {/* Navigation */}
            {hasPrevious && (
                <button
                    onClick={goToPrevious}
                    className="absolute left-4 z-10 text-white text-2xl hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
                >
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
            )}
            {hasNext && (
                <button
                    onClick={goToNext}
                    className="absolute right-4 z-10 text-white text-2xl hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
                >
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
            )}

            {/* Image */}
            <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                )}
                <img
                    src={previewImage.image_url}
                    alt={previewImage.image_name}
                    className="max-w-full max-h-full object-contain transition-opacity duration-300"
                    style={{
                        opacity: isLoading ? 0 : 1,
                        transform: `scale(${zoomLevel})`,
                    }}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setImageError(true);
                    }}
                />
                {imageError && (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-center">
                        <div>
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl mb-2" />
                            <p>Failed to load image</p>
                            <button
                                onClick={() => {
                                    setIsLoading(true);
                                    setImageError(false);
                                }}
                                className="mt-2 px-4 py-2 bg-white bg-opacity-20 rounded hover:bg-opacity-30"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-lg">{previewImage.image_name}</h3>
                        <p className="text-sm text-gray-300">
                            {(previewImage.file_size / 1024 / 1024).toFixed(1)} MB •{" "}
                            {new Date(previewImage.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => window.open(previewImage.image_url, "_blank")}
                            className="px-3 py-2 bg-white bg-opacity-20 rounded hover:bg-opacity-30 flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faExternalLinkAlt} />
                            Open Original
                        </button>
                        <button
                            onClick={downloadImage}
                            className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faDownload} />
                            Download
                        </button>
                    </div>
                </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 flex gap-2">
                <button
                    onClick={zoomIn}
                    className="text-white text-xl bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
                >
                    <FontAwesomeIcon icon={faSearchPlus} />
                </button>
                <button
                    onClick={zoomOut}
                    className="text-white text-xl bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
                >
                    <FontAwesomeIcon icon={faSearchMinus} />
                </button>
                <button
                    onClick={resetZoom}
                    className="text-white text-xl bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
                >
                    <FontAwesomeIcon icon={faExpand} />
                </button>
            </div>
        </div>
    );
}
