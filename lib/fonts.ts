// fonts.ts
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const FONT_FAMILIES = {
  HELVETICA: 'Helvetica',
  ROBOTO: 'Roboto-Regular'
} as const;

export type FontFamily = keyof typeof FONT_FAMILIES;

export function getFontPath(fontFamily: FontFamily): string {
  // Map font family names to their file paths
  const fontPaths: Record<FontFamily, string> = {
    HELVETICA: path.join(__dirname, 'fonts/Helvetica.ttf'),
    ROBOTO: path.join(__dirname, 'fonts/Roboto-Regular.ttf')
  };

  if (!(fontFamily in fontPaths)) {
    throw new Error(`Font ${fontFamily} not configured`);
  }
  
  return fontPaths[fontFamily];
}