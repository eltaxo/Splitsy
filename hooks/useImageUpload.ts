import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import imageCompression from 'browser-image-compression';

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadReceipt = async (file: File, expenseId: string): Promise<string> => {
    setIsUploading(true);
    setUploadError(null);

    try {
      // Validaciones
      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor, selecciona una imagen');
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen es demasiado grande. Máximo 5MB');
      }

      // Comprimir imagen a máx 1MB
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);

      // Subir a Firebase Storage
      const storageRef = ref(storage, `receipts/${expenseId}`);
      await uploadBytes(storageRef, compressedFile);

      // Obtener URL
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al subir la imagen';
      setUploadError(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadReceipt, isUploading, uploadError };
}
