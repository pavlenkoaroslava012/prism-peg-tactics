import { bestRedirects, starsFor } from '../src/game/scoring';

describe('par scoring and the fewest-redirect record', () => {
  it('awards three stars only for a first-drop solve at or under par', () => {
    expect(starsFor({ solved: true, redirectsUsed: 2, par: 3, drops: 1 })).toBe(3);
    expect(starsFor({ solved: true, redirectsUsed: 3, par: 3, drops: 1 })).toBe(3);
    expect(starsFor({ solved: true, redirectsUsed: 3, par: 3, drops: 2 })).toBe(2);
  });

  it('awards two stars within one redirect of par and one beyond it', () => {
    expect(starsFor({ solved: true, redirectsUsed: 4, par: 3, drops: 2 })).toBe(2);
    expect(starsFor({ solved: true, redirectsUsed: 5, par: 3, drops: 2 })).toBe(1);
  });

  it('awards nothing for a miss', () => {
    expect(starsFor({ solved: false, redirectsUsed: 1, par: 3, drops: 1 })).toBe(0);
  });

  it('keeps the lowest redirect count ever achieved', () => {
    expect(bestRedirects(null, 4)).toBe(4);
    expect(bestRedirects(4, 2)).toBe(2);
    expect(bestRedirects(2, 5)).toBe(2);
  });
});
