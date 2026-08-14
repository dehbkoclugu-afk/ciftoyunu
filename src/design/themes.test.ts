import { resolveTheme, themes } from './themes';

describe('theme resolution', () => {
  it('uses the approved warm light palette', () => {
    expect(themes.light.colors).toMatchObject({
      canvas: '#FFF9F4',
      surface: '#FFFFFF',
      ink: '#1C1720',
      primary: '#7357E8',
      coral: '#F25F70',
    });
  });

  it('uses the approved plum dark palette', () => {
    expect(themes.dark.colors).toMatchObject({
      canvas: '#121015',
      surface: '#1D1922',
      ink: '#FFF8F2',
      primary: '#9B86FF',
      coral: '#FF7685',
    });
  });

  it('defaults an unknown system scheme to light', () => {
    expect(resolveTheme(null)).toBe(themes.light);
    expect(resolveTheme('dark')).toBe(themes.dark);
  });
});
