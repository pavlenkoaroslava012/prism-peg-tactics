/**
 * Codex asset contract — these names and no others.
 * Every entry below is referenced from the UI (button_round backs the square
 * HUD buttons on GameScreen; icon_1024 is the launcher icon and is not here).
 */
export const assets = {
  bgGame: require('../../assets/bg_game.png'),
  logo: require('../../assets/logo.png'),
  iconHome: require('../../assets/icon_home.png'),
  iconPause: require('../../assets/icon_pause.png'),
  spriteOrb: require('../../assets/sprite_1.png'),
  spriteGate: require('../../assets/sprite_2.png'),
  spriteCore: require('../../assets/sprite_3.png'),
  spriteShard: require('../../assets/sprite_4.png'),
  spriteFunnel: require('../../assets/sprite_5.png'),
  buttonRect: require('../../assets/button_rect.png'),
  buttonRound: require('../../assets/button_round.png'),
} as const;

export type AssetKey = keyof typeof assets;
export default assets;
