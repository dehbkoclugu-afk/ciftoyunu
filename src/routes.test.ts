import ComfortScreen from '../app/onboarding/comfort';
import LanguageScreen from '../app/onboarding/language';
import WelcomeScreen from '../app/onboarding/welcome';
import DevGalleryScreen from '../app/dev-gallery';
import HomeScreen from '../app/home';
import LaunchScreen from '../app/index';
import ModeScreen from '../app/mode';
import PlayersScreen from '../app/players';
import PacksScreen from '../app/packs';
import SessionSetupScreen from '../app/session-setup';
import PlayScreen from '../app/play';
import RecapScreen from '../app/recap';
import FavoritesScreen from '../app/favorites';

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
    expect(SessionSetupScreen).toEqual(expect.any(Function));
    expect(PlayScreen).toEqual(expect.any(Function));
    expect(RecapScreen).toEqual(expect.any(Function));
    expect(FavoritesScreen).toEqual(expect.any(Function));
    expect(DevGalleryScreen).toEqual(expect.any(Function));
  });
});
