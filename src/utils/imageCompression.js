/**
 * Compresses an image file using HTML Canvas.
 * @param {File} file - The image file to compress.
 * @param {number} quality - Quality of the compressed image (0 to 1). Default 0.6.
 * @param {number} maxWidth - Maximum width of the output image. Default 600px.
 * @returns {Promise<File>} - A promise that resolves with the compressed File.
 */
export const compressImage = async (file, quality = 0.6, maxWidth = 600) => {
    // Optimization: If file is already small (e.g. < 200KB), skip compression
    if (file.size < 200 * 1024) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize if larger than maxWidth
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Canvas is empty'));
                            return;
                        }
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};
