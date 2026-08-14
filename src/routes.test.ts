import ComfortScreen from '../app/onboarding/comfort';
import LanguageScreen from '../app/onboarding/language';
import WelcomeScreen from '../app/onboarding/welcome';
import DevGalleryScreen from '../app/dev-gallery';
import HomeScreen from '../app/home';
import LaunchScreen from '../app/index';

describe('route modules', () => {
  it('exports launch, onboarding, home, and development gallery surfaces', () => {
    expect(LaunchScreen).toEqual(expect.any(Function));
    expect(LanguageScreen).toEqual(expect.any(Function));
    expect(WelcomeScreen).toEqual(expect.any(Function));
    expect(ComfortScreen).toEqual(expect.any(Function));
    expect(HomeScreen).toEqual(expect.any(Function));
    expect(DevGalleryScreen).toEqual(expect.any(Function));
  });
});
