import DevGalleryScreen from '../app/dev-gallery';
import HomeScreen from '../app/index';

describe('route modules', () => {
  it('exports the home and development gallery surfaces', () => {
    expect(HomeScreen).toEqual(expect.any(Function));
    expect(DevGalleryScreen).toEqual(expect.any(Function));
  });
});
