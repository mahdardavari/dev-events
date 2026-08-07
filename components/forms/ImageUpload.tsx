'use client';

import {useCallback, useState} from 'react';
import Image from 'next/image';
import {Upload, X} from 'lucide-react';

interface ImageUploadProps {
    currentImage?: string;
    error?: string;
    onChange: (file: File | null) => void;
    onBlur?: () => void;
    name: string;
}

export function ImageUpload({currentImage, error, onChange, onBlur, name}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                setFileName(file.name);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
                onChange(file);
            }
        },
        [onChange]
    );

    const handleRemove = useCallback(() => {
        setPreview(null);
        setFileName(null);
        onChange(null);
    }, [onChange]);

    const displayImage = preview || currentImage;

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium mb-1 text-gray-300">
                Event Image <span className="text-red-400">*</span>
            </label>

            {displayImage ? (
                <div className="relative animate-[fadeInUp_300ms_ease-out]">
                    <Image
                        src={displayImage}
                        alt="Event preview"
                        width={800}
                        height={400}
                        className="w-full h-48 object-cover rounded-lg border border-gray-700"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                        <label
                            htmlFor={name}
                            className="cursor-pointer bg-gray-800/80 hover:bg-gray-700 text-white p-2 rounded-full transition duration-[160ms] ease-out active:scale-90"
                        >
                            <Upload size={16}/>
                        </label>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="bg-red-600/80 hover:bg-red-500 text-white p-2 rounded-full transition duration-[160ms] ease-out active:scale-90"
                        >
                            <X size={16}/>
                        </button>
                    </div>
                    {fileName && (
                        <p className="text-sm text-gray-400 mt-1 truncate">{fileName}</p>
                    )}
                </div>
            ) : (
                <label
                    htmlFor={name}
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer hover:border-gray-500 transition-colors"
                >
                    <Upload className="w-8 h-8 text-gray-500 mb-2"/>
                    <p className="text-sm text-gray-400">Click to upload image</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP up to 5MB</p>
                </label>
            )}

            <input
                type="file"
                id={name}
                name={name}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                onBlur={onBlur}
                className="hidden"
            />

            {error && (
                <p className="text-red-400 text-sm mt-1" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
