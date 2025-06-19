import React from 'react';
import { Image, ImageProps, View, Text, StyleSheet } from 'react-native';

interface ProfileImageProps extends Omit<ImageProps, 'source'> {
  uri?: string;
  fallbackUri?: string;
  size?: number;
}

export default function ProfileImage({
  uri,
  fallbackUri = 'https://randomuser.me/api/portraits/men/32.jpg',
  size = 120,
  style,
  ...props
}: ProfileImageProps) {
  const [imageError, setImageError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const imageSource = { uri: imageError ? fallbackUri : uri || fallbackUri };

  const imageStyle = [
    {
      width: size,
      height: size,
      borderRadius: size / 2,
    },
    style,
  ];

  return (
    <View>
      <Image
        {...props}
        source={imageSource}
        style={imageStyle}
        onError={() => {
          console.log('Image load error, falling back to default');
          setImageError(true);
          setLoading(false);
        }}
        onLoad={() => setLoading(false)}
        onLoadStart={() => setLoading(true)}
      />
      {loading && (
        <View style={[styles.loadingOverlay, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={styles.loadingText}>...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 12,
  },
});
