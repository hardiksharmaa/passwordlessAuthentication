
import React from 'react';
import { Text, TextStyle, StyleSheet, TextProps } from 'react-native';
import { COLORS, FONT_SIZE, FONT_WEIGHT, LINE_HEIGHT } from '@/constants';

type TypographyVariant = 'display' | 'heading' | 'subheading' | 'body' | 'caption';
type TypographyColor = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'error' | 'success';
type FontWeight = 'regular' | 'medium' | 'semiBold' | 'bold';
type TextAlign = 'left' | 'center' | 'right';

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: TypographyColor;
  weight?: FontWeight;
  align?: TextAlign;
  style?: TextStyle;
  children: React.ReactNode;
}


const variantStyles: Record<TypographyVariant, TextStyle> = {
  display: {
    fontSize: FONT_SIZE.xxxl,
    fontFamily: 'Inter_700Bold',
    lineHeight: FONT_SIZE.xxxl * LINE_HEIGHT.tight,
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: FONT_SIZE.xxl,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: FONT_SIZE.xxl * LINE_HEIGHT.tight,
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: FONT_SIZE.lg,
    fontFamily: 'Inter_500Medium',
    lineHeight: FONT_SIZE.lg * LINE_HEIGHT.normal,
  },
  body: {
    fontSize: FONT_SIZE.md,
    fontFamily: 'Inter_400Regular',
    lineHeight: FONT_SIZE.md * LINE_HEIGHT.normal,
  },
  caption: {
    fontSize: FONT_SIZE.sm,
    fontFamily: 'Inter_400Regular',
    lineHeight: FONT_SIZE.sm * LINE_HEIGHT.normal,
  },
};


const colorMap: Record<TypographyColor, string> = {
  primary: COLORS.textPrimary,
  secondary: COLORS.textSecondary,
  tertiary: COLORS.textTertiary,
  inverse: COLORS.textInverse,
  error: COLORS.error,
  success: COLORS.success,
};

const weightMap: Record<FontWeight, string> = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export function Typography({
  variant = 'body',
  color = 'primary',
  weight,
  align,
  style,
  children,
  ...rest
}: TypographyProps) {
  const baseStyle = variantStyles[variant];
  const textColor = colorMap[color];
  
  const combinedStyle: TextStyle = {
    ...baseStyle,
    color: textColor,
    ...(weight && { fontFamily: weightMap[weight] }),
    ...(align && { textAlign: align }),
  };

  return (
    <Text style={[combinedStyle, style]} {...rest}>
      {children}
    </Text>
  );
}

export default Typography;
