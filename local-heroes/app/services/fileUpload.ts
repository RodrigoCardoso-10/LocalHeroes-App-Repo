import * as FileSystem from 'expo-file-system';

export const fileUploadService = {
  uploadImage: async (imageUri: string): Promise<string> => {
    try {
      console.log('Starting image upload process for URI:', imageUri);

      // Check if the file exists
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error('Image file does not exist');
      }

      console.log('File info:', fileInfo);

      // Check file size (limit to 5MB)
      if (fileInfo.size && fileInfo.size > 5 * 1024 * 1024) {
        throw new Error('Image file is too large. Please choose an image smaller than 5MB.');
      }

      // For now, we'll convert the image to base64 and send it to the backend
      // In a production app, you'd want to upload to a cloud storage service like AWS S3, Cloudinary, etc.

      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('Base64 conversion complete. Length:', base64.length);

      // Get the file extension from the URI
      const fileExtension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';

      // Create a data URL
      const dataUrl = `data:${mimeType};base64,${base64}`;

      console.log('Data URL created successfully');
      return dataUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to process image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },
};
