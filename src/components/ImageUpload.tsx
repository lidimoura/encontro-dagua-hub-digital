import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface ImageUploadProps {
    bucket: 'avatars' | 'qr-images';
    currentImageUrl?: string;
    onUploadComplete: (url: string) => void;
    label?: string;
    accept?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    bucket,
    currentImageUrl,
    onUploadComplete,
    label = 'Escolher Imagem',
    accept = 'image/*'
}) => {
    const { showToast } = useToast();
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('Por favor, selecione uma imagem válida', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Imagem muito grande. Máximo 5MB', 'error');
            return;
        }

        setUploading(true);

        try {
            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            const publicUrl = data.publicUrl;

            // Update preview
            setPreviewUrl(publicUrl);

            // Callback with URL
            onUploadComplete(publicUrl);

            showToast('Imagem enviada com sucesso!', 'success');
        } catch (error: any) {
            console.error('Error uploading image:', error);
            showToast('Erro ao enviar imagem. Tente novamente.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(undefined);
        onUploadComplete('');
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
            </label>

            {previewUrl ? (
                <div className="relative group">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border-2 border-slate-200 dark:border-slate-700"
                    />
                    <button
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        type="button"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                            <>
                                <Loader2 className="w-10 h-10 text-slate-400 animate-spin mb-3" />
                                <p className="text-sm text-slate-500 dark:text-slate-400">Enviando...</p>
                            </>
                        ) : (
                            <>
                                <ImageIcon className="w-10 h-10 text-slate-400 mb-3" />
                                <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                                    <span className="font-semibold">Clique para enviar</span> ou arraste
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    PNG, JPG, GIF (máx. 5MB)
                                </p>
                            </>
                        )}
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept={accept}
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </label>
            )}
        </div>
    );
};
