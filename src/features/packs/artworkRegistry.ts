import type { ImageSourcePropType } from 'react-native';

type FocalPoint = { x: number; y: number };

export type PackArtworkDefinition = {
  registered: boolean;
  source?: ImageSourcePropType;
  focalPoint: FocalPoint;
  dominantColor: string;
};

const artworkRegistry: Record<string, PackArtworkDefinition> = {
  art_warm_start: {
    registered: true,
    source: require('../../../assets/pack-art/warm-start.png'),
    focalPoint: { x: 0.52, y: 0.48 },
    dominantColor: '#F4B85E',
  },
  art_laugh_together: {
    registered: true,
    source: require('../../../assets/pack-art/laugh-together.png'),
    focalPoint: { x: 0.52, y: 0.46 },
    dominantColor: '#55BCEB',
  },
  art_deep_night: {
    registered: true,
    source: require('../../../assets/pack-art/deep-night.png'),
    focalPoint: { x: 0.68, y: 0.4 },
    dominantColor: '#211A3A',
  },
  art_appreciation: {
    registered: true,
    source: require('../../../assets/pack-art/appreciation.png'),
    focalPoint: { x: 0.5, y: 0.48 },
    dominantColor: '#F5CAD4',
  },
  art_friends_easy: {
    registered: true,
    source: require('../../../assets/pack-art/friends-easy.png'),
    focalPoint: { x: 0.5, y: 0.5 },
    dominantColor: '#4E8CD8',
  },
};

const fallback: PackArtworkDefinition = {
  registered: false,
  focalPoint: { x: 0.5, y: 0.5 },
  dominantColor: '#7357E8',
};

export function getPackArtwork(artworkId: string): PackArtworkDefinition {
  return artworkRegistry[artworkId] ?? fallback;
}
