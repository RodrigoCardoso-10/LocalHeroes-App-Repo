declare module 'expo-image-picker' {
  export type MediaTypeOptions = {
    All: 'All';
    Videos: 'Videos';
    Images: 'Images';
  };

  export type ImagePickerResult = {
    canceled: boolean;
    assets?: Array<{
      uri: string;
      width: number;
      height: number;
      type?: string;
      fileName?: string;
      fileSize?: number;
    }>;
  };

  export type PermissionResponse = {
    status: 'granted' | 'denied' | 'undetermined';
    expires: 'never' | number;
    canAskAgain: boolean;
  };

  export const MediaTypeOptions: MediaTypeOptions;

  export function launchImageLibraryAsync(options: {
    mediaTypes: any;
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
    allowsMultipleSelection?: boolean;
    exif?: boolean;
  }): Promise<ImagePickerResult>;

  export function launchCameraAsync(options: {
    mediaTypes: any;
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
    exif?: boolean;
  }): Promise<ImagePickerResult>;

  export function requestMediaLibraryPermissionsAsync(): Promise<PermissionResponse>;
  
  export function requestCameraPermissionsAsync(): Promise<PermissionResponse>;
  
  export function getCameraPermissionsAsync(): Promise<PermissionResponse>;
  
  export function getMediaLibraryPermissionsAsync(): Promise<PermissionResponse>;
}
