// typings/moonconfig.d.ts

declare module "moon-style" {
  interface MoonConfig {
    sizes: Record<string, string>;
    fontSizes: Record<string, string>;
    borderRadius: Record<string, string>;
    fontWeights: Record<string, number>;
    lineHeights: Record<string, number>;
    borderWidths: Record<string, number>;
    themes: {
      root: Record<string, string>;
      light: Record<string, string>;
      dark: Record<string, string>;
    };
    fontFamilies: Record<string, string>;
    boxShadow: Record<string, string>;
    borderWidth: Record<string, string>;
    zIndex: Record<string, string>;
    outputPath: string;
  }

  const moonConfig: MoonConfig;
  export default moonConfig;
}
