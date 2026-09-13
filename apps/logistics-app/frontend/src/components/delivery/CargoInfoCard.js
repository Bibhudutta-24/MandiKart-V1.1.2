import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, borderRadius } from '../../theme';
import AppCard from '../common/AppCard';

export const CargoInfoCard = ({
  packaging = 'Crates',
  instructions = 'Keep crates upright. Handle with care.',
  weight = '120 kg',
  title = 'Fresh Tomatoes',
}) => {
  return (
    <AppCard style={styles.card}>
      <Text style={styles.sectionTitle}>Cargo Specifications</Text>

      <View style={styles.infoRow}>
        <View style={styles.iconBox}>
          <MaterialIcons name="inventory-2" size={18} color={colors.primary} />
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.infoLabel}>Commodity & Packaging</Text>
          <Text style={styles.infoValue}>{title} ({weight}) • {packaging}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={styles.iconBox}>
          <MaterialIcons name="info-outline" size={18} color={colors.tertiaryContainer} />
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.infoLabel}>Handling Instructions</Text>
          <Text style={styles.infoValue}>{instructions}</Text>
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
  },
  sectionTitle: {
    ...typography.labelLg,
    color: colors.onSurface,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    ...typography.labelSm,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginBottom: 2,
  },
  infoValue: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceVariant,
    marginVertical: 10,
  },
});

export default CargoInfoCard;
