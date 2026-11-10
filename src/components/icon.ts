import type { LucideIcon } from 'lucide-react-native';

/**
 * Every icon in the app comes from lucide-react-native: one library, one
 * predictable 24x24 box, no AI-PNG aspect-ratio drift inside buttons.
 */
export type IconComponent = LucideIcon;
export type IconProps = { size?: number; color?: string };
