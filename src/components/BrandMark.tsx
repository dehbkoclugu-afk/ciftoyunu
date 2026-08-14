import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/design';

type BrandMarkProps = {
  size?: number;
};

export function BrandMark({ size = 48 }: BrandMarkProps) {
  const theme = useAppTheme();
  const cardSize = size * 0.72;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size }}
    >
      <View
        style={[
          styles.card,
          {
            width: cardSize,
            height: cardSize * 0.78,
            borderRadius: size * 0.18,
            backgroundColor: theme.colors.coral,
            left: 0,
            top: size * 0.2,
            transform: [{ rotate: '-8deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.card,
          {
            width: cardSize,
            height: cardSize * 0.78,
            borderRadius: size * 0.18,
            backgroundColor: theme.colors.primary,
            right: 0,
            top: size * 0.06,
            transform: [{ rotate: '7deg' }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { position: 'absolute' },
});
