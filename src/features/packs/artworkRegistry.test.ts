import { loadEmbeddedContent } from '@/content/loader';

import { getPackArtwork } from './artworkRegistry';

describe('pack artwork registry', () => {
  it('covers every active embedded pack with normalized focal points', () => {
    const bundle = loadEmbeddedContent('en')!;

    for (const pack of bundle.packs) {
      const artwork = getPackArtwork(pack.artworkId);
      expect(artwork.registered).toBe(true);
      expect(artwork.focalPoint.x).toBeGreaterThanOrEqual(0);
      expect(artwork.focalPoint.x).toBeLessThanOrEqual(1);
      expect(artwork.focalPoint.y).toBeGreaterThanOrEqual(0);
      expect(artwork.focalPoint.y).toBeLessThanOrEqual(1);
    }
  });

  it('returns a deterministic fallback for unknown artwork', () => {
    expect(getPackArtwork('missing')).toMatchObject({
      registered: false,
      focalPoint: { x: 0.5, y: 0.5 },
    });
  });
});
