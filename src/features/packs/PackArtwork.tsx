import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { getPackArtwork } from './artworkRegistry';

type PackArtworkProps = {
  artworkId: string;
  height: number;
  borderRadius: number;
};

export function PackArtwork({ artworkId, height, borderRadius }: PackArtworkProps) {
  const artwork = getPackArtwork(artworkId);
  const [width, setWidth] = useState(0);
  const scale = width > 0 ? Math.max(width / 1200, height / 800) : 1;
  const imageWidth = 1200 * scale;
  const imageHeight = 800 * scale;
  const left = Math.max(
    width - imageWidth,
    Math.min(0, width / 2 - imageWidth * artwork.focalPoint.x),
  );
  const top = Math.max(
    height - imageHeight,
    Math.min(0, height / 2 - imageHeight * artwork.focalPoint.y),
  );

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.frame, { height, borderRadius, backgroundColor: artwork.dominantColor }]}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {artwork.source ? (
        <Image
          accessibilityIgnoresInvertColors
          source={artwork.source}
          style={{ position: 'absolute', width: imageWidth, height: imageHeight, left, top }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', overflow: 'hidden' },
});
