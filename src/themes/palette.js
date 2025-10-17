/**
 * Color intention for EFIT CRM Theme
 * @param {JsonObject} theme Theme customization object
 */

export default function themePalette(theme) {
  return {
    // Automatically switches based on light/dark mode toggle
    mode: theme?.customization?.navType || 'light',

    common: {
      black: '#000',
      white: '#fff'
    },

    // ==============================|| PRIMARY COLORS (EFIT Blue) ||============================== //
    primary: {
      light: theme.colors?.primaryLight, // #e0f2fe
      main: theme.colors?.primaryMain, // #1976d2
      dark: theme.colors?.primaryDark, // #1565c0
      200: theme.colors?.primary200,
      800: theme.colors?.primary800,
      contrastText: '#fff'
    },

    // ==============================|| SECONDARY COLORS (EFIT Green) ||============================== //
    secondary: {
      light: theme.colors?.secondaryLight, // #b2f5ea
      main: theme.colors?.secondaryMain, // #00bfa6
      dark: theme.colors?.secondaryDark, // #009e8a
      200: theme.colors?.secondary200,
      800: theme.colors?.secondary800,
      contrastText: '#fff'
    },

    // ==============================|| FEEDBACK COLORS ||============================== //
    error: {
      light: theme.colors?.errorLight,
      main: theme.colors?.errorMain,
      dark: theme.colors?.errorDark
    },
    warning: {
      light: theme.colors?.warningLight,
      main: theme.colors?.warningMain,
      dark: theme.colors?.warningDark
    },
    success: {
      light: theme.colors?.successLight,
      200: theme.colors?.success200,
      main: theme.colors?.successMain,
      dark: theme.colors?.successDark
    },
    orange: {
      light: theme.colors?.orangeLight,
      main: theme.colors?.orangeMain,
      dark: theme.colors?.orangeDark
    },

    // ==============================|| GREY SCALE ||============================== //
    grey: {
      50: theme.colors?.grey50,
      100: theme.colors?.grey100,
      200: theme.colors?.grey200,
      300: theme.colors?.grey300,
      500: theme.colors?.grey500,
      600: theme.colors?.grey600,
      700: theme.colors?.grey700,
      900: theme.colors?.grey900
    },

    // ==============================|| DARK MODE COLORS ||============================== //
    dark: {
      light: theme.colors?.darkTextPrimary,
      main: theme.colors?.darkLevel1,
      dark: theme.colors?.darkLevel2,
      800: theme.colors?.darkBackground,
      900: theme.colors?.darkPaper
    },

    // ==============================|| TEXT COLORS ||============================== //
    text: {
      primary: theme.darkTextPrimary, // Dark mode primary
      secondary: theme.darkTextSecondary, // Muted text
      dark: theme.textDark, // For headers / strong text
      hint: theme.colors?.grey500 // Placeholder text color
    },

    // ==============================|| BACKGROUND ||============================== //
    background: {
      paper: theme.paper, // Card/Form background
      default: theme.backgroundDefault // Page background
    },

    divider: theme.colors?.grey200
  };
}
