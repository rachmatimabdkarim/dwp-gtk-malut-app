/**
 * Smart Client-Side Image Compressor & WebP Converter
 * Compresses images in browser before upload/saving.
 * Shrinks file size by 80% - 95% without noticeable loss of visual quality.
 */

export interface CompressionResult {
  dataUrl: string;
  originalSizeKB: number;
  compressedSizeKB: number;
  width: number;
  height: number;
  compressionRatio: number;
}

export const compressImage = (
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<CompressionResult> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File yang diunggah harus berupa gambar (JPG, PNG, WebP).'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scaling
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal memproses kanvas pengompresan gambar.'));
          return;
        }

        // Apply smooth interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP format for optimal compression & crisp quality
        let compressedDataUrl = canvas.toDataURL('image/webp', quality);

        // Fallback to JPEG if WebP is unsupported by old browser
        if (!compressedDataUrl.startsWith('data:image/webp')) {
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        const originalSizeKB = Math.round(file.size / 1024);
        // Estimate base64 byte size
        const compressedSizeBytes = Math.round((compressedDataUrl.length * 3) / 4);
        const compressedSizeKB = Math.round(compressedSizeBytes / 1024);
        const ratio = originalSizeKB > 0 
          ? Math.round(((originalSizeKB - compressedSizeKB) / originalSizeKB) * 100)
          : 0;

        resolve({
          dataUrl: compressedDataUrl,
          originalSizeKB,
          compressedSizeKB,
          width,
          height,
          compressionRatio: ratio > 0 ? ratio : 0
        });
      };

      img.onerror = () => reject(new Error('Gagal memuat file gambar.'));
    };

    reader.onerror = () => reject(new Error('Gagal membaca file dari komputer.'));
  });
};
