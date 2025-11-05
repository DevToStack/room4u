// admin/components/FileUpload.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUpload,
    faCheckCircle,
    faExclamationTriangle,
    faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';

const FileUpload = ({ apartmentId, onUploadComplete, existingImages = [], maxFiles = 20, onClose }) => {
    const [uploadingFiles, setUploadingFiles] = useState([]); // { file, preview, progress, status, id }
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Clean up object URLs when component unmounts or files are removed
    useEffect(() => {
        return () => {
            uploadingFiles.forEach(fileObj => {
                if (fileObj.preview) {
                    URL.revokeObjectURL(fileObj.preview);
                }
            });
        };
    }, [uploadingFiles]);

    // Format file size to human readable format
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Calculate uploaded size based on progress
    const getUploadedSize = (file, progress) => {
        const totalSize = file.size;
        const uploadedSize = (progress / 100) * totalSize;
        return {
            uploaded: formatFileSize(uploadedSize),
            total: formatFileSize(totalSize)
        };
    };

    // Validate files before upload
    const validateFiles = (files) => {
        const errors = [];
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

        files.forEach(file => {
            // Check file type
            if (!allowedTypes.includes(file.type)) {
                errors.push(`"${file.name}" is not a supported image format.`);
            }

            // Check file size
            if (file.size > maxSize) {
                errors.push(`"${file.name}" exceeds 10MB size limit.`);
            }

            // Check if we're exceeding max files
            const totalFilesAfterUpload = existingImages.length + uploadingFiles.filter(f => f.status === 'success').length + files.length;
            if (totalFilesAfterUpload > maxFiles) {
                errors.push(`Maximum ${maxFiles} images allowed per apartment.`);
            }
        });

        return errors;
    };

    // Upload Files
    const uploadFiles = async (files) => {
        setError('');
        setSuccess('');

        // Validate files
        const validationErrors = validateFiles(files);
        if (validationErrors.length > 0) {
            setError(validationErrors.join(' '));
            return;
        }

        const newUploadFiles = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            progress: 0,
            status: 'uploading',
            id: Math.random().toString(36).substr(2, 9) // Generate unique ID for each file
        }));

        setUploadingFiles((prev) => [...prev, ...newUploadFiles]);

        const successfulUploads = [];

        try {
            for (const fileObj of newUploadFiles) {
                try {
                    await new Promise((resolve, reject) => {
                        const formData = new FormData();
                        formData.append('apartmentId', apartmentId);
                        formData.append('files', fileObj.file);

                        const xhr = new XMLHttpRequest();

                        xhr.upload.addEventListener('progress', (event) => {
                            if (event.lengthComputable) {
                                const percent = (event.loaded / event.total) * 100;
                                setUploadingFiles((prev) =>
                                    prev.map((f) =>
                                        f.id === fileObj.id ? { ...f, progress: percent } : f
                                    )
                                );
                            }
                        });

                        xhr.addEventListener('load', () => {
                            if (xhr.status === 200) {
                                try {
                                    const result = JSON.parse(xhr.responseText);
                                    if (result.success && result.uploaded && result.uploaded.length > 0) {
                                        const uploaded = result.uploaded[0];
                                        setUploadingFiles((prev) =>
                                            prev.map((f) =>
                                                f.id === fileObj.id
                                                    ? { ...f, status: 'success', progress: 100 }
                                                    : f
                                            )
                                        );
                                        successfulUploads.push(uploaded);
                                        resolve();
                                    } else {
                                        const errorMessage = result.message || 'Upload failed';
                                        setUploadingFiles((prev) =>
                                            prev.map((f) =>
                                                f.id === fileObj.id ? { ...f, status: 'error' } : f
                                            )
                                        );
                                        reject(new Error(errorMessage));
                                    }
                                } catch (parseError) {
                                    setUploadingFiles((prev) =>
                                        prev.map((f) =>
                                            f.id === fileObj.id ? { ...f, status: 'error' } : f
                                        )
                                    );
                                    reject(new Error('Invalid response from server'));
                                }
                            } else {
                                setUploadingFiles((prev) =>
                                    prev.map((f) =>
                                        f.id === fileObj.id ? { ...f, status: 'error' } : f
                                    )
                                );
                                reject(new Error(`Upload failed with status: ${xhr.status}`));
                            }
                        });

                        xhr.addEventListener('error', () => {
                            setUploadingFiles((prev) =>
                                prev.map((f) =>
                                    f.id === fileObj.id ? { ...f, status: 'error' } : f
                                )
                            );
                            reject(new Error('Network error occurred'));
                        });

                        xhr.addEventListener('abort', () => {
                            setUploadingFiles((prev) =>
                                prev.map((f) =>
                                    f.id === fileObj.id ? { ...f, status: 'error' } : f
                                )
                            );
                            reject(new Error('Upload was cancelled'));
                        });

                        xhr.open('POST', '/api/admin/gallery');
                        xhr.send(formData);
                    });
                } catch (fileError) {
                    console.error(`Upload failed for ${fileObj.file.name}:`, fileError);
                    // Continue with next file even if one fails
                }
            }

            // Call completion callback if we have successful uploads
            if (successfulUploads.length > 0 && onUploadComplete) {
                onUploadComplete(successfulUploads);
                setSuccess(`Successfully uploaded ${successfulUploads.length} image(s)`);
            }

            // Auto-close if all uploads are complete and we have the onClose prop
            if (onClose && uploadingFiles.every(f => f.status !== 'uploading')) {
                setTimeout(() => {
                    onClose();
                }, 2000);
            }

        } catch (batchError) {
            console.error('Batch upload error:', batchError);
            setError('Some files failed to upload. Please try again.');
        }
    };

    // Remove uploaded file from view
    const handleRemoveFile = (fileId) => {
        setUploadingFiles((prev) => {
            const fileToRemove = prev.find(f => f.id === fileId);
            if (fileToRemove && fileToRemove.preview) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            return prev.filter((f) => f.id !== fileId);
        });
    };

    // Clear all completed uploads
    const handleClearAll = () => {
        setUploadingFiles((prev) => {
            prev.forEach(fileObj => {
                if (fileObj.preview) {
                    URL.revokeObjectURL(fileObj.preview);
                }
            });
            return [];
        });
        setError('');
        setSuccess('');
    };

    // Dropzone configuration
    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        if (acceptedFiles.length === 0 && rejectedFiles.length > 0) {
            const rejectionErrors = rejectedFiles.map(rejection => {
                if (rejection.errors.some(error => error.code === 'file-too-large')) {
                    return `"${rejection.file.name}" is too large.`;
                }
                if (rejection.errors.some(error => error.code === 'file-invalid-type')) {
                    return `"${rejection.file.name}" is not a supported image format.`;
                }
                return `"${rejection.file.name}" was rejected.`;
            });
            setError(rejectionErrors.join(' '));
            return;
        }

        if (acceptedFiles.length > 0) {
            uploadFiles(acceptedFiles);
        }
    }, [apartmentId, existingImages, uploadingFiles]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: true
    });

    // Get completed upload count
    const completedCount = uploadingFiles.filter(f => f.status === 'success').length;
    const totalCount = uploadingFiles.length;

    return (
        <div className="space-y-6">
            {/* Header with progress and close button */}
            <div className="flex justify-between items-center">
                <div>
                    {uploadingFiles.length > 0 && (
                        <p className="text-sm text-neutral-400">
                            {completedCount} of {totalCount} completed
                        </p>
                    )}
                </div>
            </div>

            {/* Dropzone - Only show if not all files are completed */}
            {!(uploadingFiles.length > 0 && uploadingFiles.every(f => f.status === 'success')) && (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragActive
                        ? 'border-blue-400 bg-blue-900/20'
                        : 'border-neutral-700 hover:border-neutral-500 bg-neutral-900'
                        }`}
                >
                    <input {...getInputProps()} />
                    <FontAwesomeIcon
                        icon={faUpload}
                        className="text-3xl text-neutral-400 mb-2"
                    />
                    <p className="text-neutral-300 mb-1">
                        Drag & drop images here, or click to select
                    </p>
                    <p className="text-sm text-neutral-500">
                        Supports JPG, PNG, WEBP, GIF • Max 10MB per file • Max {maxFiles} images per apartment
                    </p>
                </div>
            )}

            {/* Alerts */}
            {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>{error}</span>
                    <button
                        onClick={() => setError('')}
                        className="ml-auto text-red-300 hover:text-white"
                    >
                        <FontAwesomeIcon icon={faTimesCircle} />
                    </button>
                </div>
            )}

            {success && (
                <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-lg flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <span>{success}</span>
                </div>
            )}

            {/* Upload Progress */}
            {uploadingFiles.length > 0 && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-neutral-200">
                            Upload Progress
                        </h3>
                        {uploadingFiles.some(f => f.status === 'success' || f.status === 'error') && (
                            <button
                                onClick={handleClearAll}
                                className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-96 p-2">
                        {uploadingFiles.map((fileObj) => {
                            const sizeInfo = getUploadedSize(fileObj.file, fileObj.progress);

                            return (
                                <div
                                    key={fileObj.id}
                                    className="bg-neutral-900 rounded-xl border border-neutral-800 p-4"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Small Image Preview */}
                                        <div className="relative w-16 h-16 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                                            <Image
                                                src={fileObj.preview}
                                                alt={fileObj.file.name}
                                                fill
                                                sizes="64px"
                                                className="object-cover"
                                                onLoad={() => {
                                                    // Object URL is already created, no need to revoke here
                                                    // It will be revoked when component unmounts or file is removed
                                                }}
                                            />

                                            {/* Status Icon Overlay */}
                                            {fileObj.status !== 'uploading' && (
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                    <FontAwesomeIcon
                                                        icon={
                                                            fileObj.status === 'success'
                                                                ? faCheckCircle
                                                                : faTimesCircle
                                                        }
                                                        className={
                                                            fileObj.status === 'success'
                                                                ? 'text-green-400 text-lg'
                                                                : 'text-red-400 text-lg'
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* File Info and Progress */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-sm text-neutral-300 truncate" title={fileObj.file.name}>
                                                    {fileObj.file.name}
                                                </span>
                                                <span className="text-xs text-neutral-400 ml-2 flex-shrink-0">
                                                    {Math.round(fileObj.progress)}%
                                                </span>
                                            </div>

                                            {/* File Size Display */}
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-neutral-400">
                                                    {fileObj.status === 'uploading'
                                                        ? `${sizeInfo.uploaded} / ${sizeInfo.total}`
                                                        : sizeInfo.total
                                                    }
                                                </span>
                                            </div>

                                            {/* Full Width Progress Bar */}
                                            <div className="w-full bg-neutral-700 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full transition-all duration-300 ease-out ${fileObj.status === 'error'
                                                        ? 'bg-red-500'
                                                        : fileObj.status === 'success'
                                                            ? 'bg-green-500'
                                                            : 'bg-blue-500'
                                                        }`}
                                                    style={{
                                                        width: `${fileObj.progress}%`,
                                                    }}
                                                />
                                            </div>

                                            {/* Status Text */}
                                            <div className="flex justify-between items-center mt-2">
                                                <span className={`text-xs ${fileObj.status === 'uploading'
                                                    ? 'text-blue-400'
                                                    : fileObj.status === 'success'
                                                        ? 'text-green-400'
                                                        : 'text-red-400'
                                                    }`}>
                                                    {fileObj.status === 'uploading' && 'Uploading...'}
                                                    {fileObj.status === 'success' && 'Upload completed'}
                                                    {fileObj.status === 'error' && 'Upload failed'}
                                                </span>

                                                {/* Remove Button */}
                                                {(fileObj.status === 'success' || fileObj.status === 'error') && (
                                                    <button
                                                        onClick={() => handleRemoveFile(fileObj.id)}
                                                        className="text-neutral-400 hover:text-neutral-200 text-xs flex items-center gap-1"
                                                    >
                                                        <FontAwesomeIcon icon={faTimesCircle} className="text-xs" />
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;