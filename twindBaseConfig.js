function withOpacity(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}

function withHslOpacity(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `hsl(var(${variable}))`;
    }
    return `hsl(var(${variable}) / ${opacityValue})`;
  };
}

export default {
  darkMode: 'class',
  hash: false,
  theme: {
    extend: {
      fontFamily: {
        sans: 'Inter, sans-serif',
      },
      colors: {
        primaryStart: withOpacity('--gradient-primary-start'),
        primaryStop: withOpacity('--gradient-primary-stop'),
        secondaryLight: withOpacity('--foundation-secondary'),
        secondaryDark: withOpacity('--foundation-secondary-dark'),
        tertiaryLight: withOpacity('--tertiary-light'),
        tertiaryDark: withOpacity('--tertiary-dark'),
        black: withOpacity('--system-black'),
        white: withOpacity('--system-white'),
        grey1: withOpacity('--system-grey-1'),
        grey2: withOpacity('--system-grey-2'),
        grey3: withOpacity('--system-grey-3'),
        grey4: withOpacity('--system-grey-4'),
        grey5: withOpacity('--system-grey-5'),
        grey6: withOpacity('--system-grey-6'),
        grey7: withOpacity('--system-grey-7'),
        grey8: withOpacity('--system-grey-8'),
        grey9: withOpacity('--system-grey-9'),
        success: withOpacity('--feedback-success'),
        warningLight: withOpacity('--feedback-warning'),
        warningDark: withOpacity('--feedback-warning-dark'),
        errorLight: withOpacity('--feedback-error'),
        errorDark: withOpacity('--feedback-error-dark'),
        errorDark2: withOpacity('--feedback-error-dark2'),
        errorFade: withOpacity('--feedback-error-fade'),
        elevation: withOpacity('--elevation'),
        border: withHslOpacity('--border'),
        input: withHslOpacity('--input'),
        ring: withHslOpacity('--ring'),
        background: withHslOpacity('--background'),
        foreground: withHslOpacity('--foreground'),
        primary: {
          DEFAULT: withHslOpacity('--primary'),
          foreground: withHslOpacity('--primary-foreground'),
        },
        secondary: {
          DEFAULT: withHslOpacity('--secondary'),
          foreground: withHslOpacity('--secondary-foreground'),
        },
        destructive: {
          DEFAULT: withHslOpacity('--destructive'),
          foreground: withHslOpacity('--destructive-foreground'),
        },
        muted: {
          DEFAULT: withHslOpacity('--muted'),
          foreground: withHslOpacity('--muted-foreground'),
        },
        accent: {
          DEFAULT: withHslOpacity('--accent'),
          foreground: withHslOpacity('--accent-foreground'),
        },
        popover: {
          DEFAULT: withHslOpacity('--popover'),
          foreground: withHslOpacity('--popover-foreground'),
        },
        card: {
          DEFAULT: withHslOpacity('--card'),
          foreground: withHslOpacity('--card-foreground'),
        },
      },
      borderRadius: {
        large: '20px',
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: 'calc(var(--radius) - 4px)',
      },
      scale: {
        flip: '-1',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
