import ComfortScreen from '../app/onboarding/comfort';
import LanguageScreen from '../app/onboarding/language';
import WelcomeScreen from '../app/onboarding/welcome';
import DevGalleryScreen from '../app/dev-gallery';
import HomeScreen from '../app/home';
import LaunchScreen from '../app/index';
import ModeScreen from '../app/mode';
import PlayersScreen from '../app/players';
import PacksScreen from '../app/packs';

describe('route modules', () => {
  it('exports launch, onboarding, home, and development gallery surfaces', () => {
    expect(LaunchScreen).toEqual(expect.any(Function));
    expect(LanguageScreen).toEqual(expect.any(Function));
    expect(WelcomeScreen).toEqual(expect.any(Function));
    expect(ComfortScreen).toEqual(expect.any(Function));
    expect(HomeScreen).toEqual(expect.any(Function));
    expect(ModeScreen).toEqual(expect.any(Function));
    expect(PlayersScreen).toEqual(expect.any(Function));
    expect(PacksScreen).toEqual(expect.any(Function));
    expect(DevGalleryScreen).toEqual(expect.any(Function));
  });
});
