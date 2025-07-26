/**
 * Upload Delivery Files Modal Component
 * Allows sellers to upload delivery files for orders
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
    UploadOutlined, 
    DeleteOutlined, 
    FileOutlined,
    CloseOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import ApiService from '../../config/api.js'; // ĐÚNG

const UploadDeliveryModal = ({ 
    isOpen, 
    onClose, 
    orderId,
    onUploadSuccess 
}) => {
    const [files, setFiles] = useState([]);
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileSelect = (event) => {
        const selectedFiles = Array.from(event.target.files);
        
        // Validate file size (max 10MB per file)
        const maxSize = 10 * 1024 * 1024; // 10MB
        const validFiles = selectedFiles.filter(file => {
            if (file.size > maxSize) {
                setError(`File "${file.name}" is too large. Maximum size is 10MB.`);
                return false;
            }
            return true;
        });

        // Validate file types (exclude executable files)
        const allowedTypes = [
            'image/', 'video/', 'audio/', 'text/', 'application/pdf',
            'application/zip', 'application/x-rar', 'application/msword',
            'application/vnd.openxmlformats-officedocument'
        ];
        
        const safeFiles = validFiles.filter(file => {
            const isSafe = allowedTypes.some(type => file.type.startsWith(type));
            if (!isSafe) {
                setError(`File type "${file.type}" is not allowed for security reasons.`);
                return false;
            }
            return true;
        });

        setFiles(prevFiles => [...prevFiles, ...safeFiles]);
        setError(null);
    };

    const removeFile = (index) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            setError('Please select at least one file to upload.');
            return;
        }

        try {
            setUploading(true);
            setError(null);

            const response = await ApiService.uploadDeliveryFiles(orderId, files, message);
            
            if (response.status === 'success') {
                onUploadSuccess && onUploadSuccess();
                handleClose();
            } else {
                setError(response.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setError(error.message || 'Failed to upload files');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setFiles([]);
        setMessage('');
        setError(null);
        onClose();
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType) => {
        if (fileType.includes('image')) return '🖼️';
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('video')) return '🎥';
        if (fileType.includes('audio')) return '🎵';
        if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
        return '📁';
    };

    const getTotalSize = () => {
        return files.reduce((total, file) => total + file.size, 0);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">
                        <UploadOutlined className="mr-2" />
                        Upload Delivery Files
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        disabled={uploading}
                    >
                        <CloseOutlined className="text-xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {/* File Upload Area */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Files to Upload
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileSelect}
                                className="hidden"
                                id="file-upload"
                                disabled={uploading}
                            />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer flex flex-col items-center"
                            >
                                <UploadOutlined className="text-3xl text-gray-400 mb-2" />
                                <span className="text-sm text-gray-600">
                                    Click to upload files or drag and drop
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                    Maximum file size: 10MB
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Selected Files */}
                    {files.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                Selected Files ({files.length})
                            </h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {files.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-xl">
                                                {getFileIcon(file.type)}
                                            </span>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatFileSize(file.size)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                            disabled={uploading}
                                        >
                                            <DeleteOutlined />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                Total size: {formatFileSize(getTotalSize())}
                            </div>
                        </div>
                    )}

                    {/* Delivery Message */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Delivery Message (Optional)
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Add a message to the buyer about the delivery..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="3"
                            disabled={uploading}
                        />
                    </div>

                    {/* Upload Guidelines */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">
                            Upload Guidelines:
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Maximum file size: 10MB per file</li>
                            <li>• Supported formats: Images, Videos, Audio, Documents, Archives</li>
                            <li>• Executable files are not allowed for security reasons</li>
                            <li>• You can upload multiple files at once</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t p-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={uploading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={files.length === 0 || uploading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {uploading ? (
                                <>
                                    <LoadingOutlined className="animate-spin" />
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <UploadOutlined />
                                    <span>Upload Files</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

UploadDeliveryModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    orderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onUploadSuccess: PropTypes.func
};

export default UploadDeliveryModal;
