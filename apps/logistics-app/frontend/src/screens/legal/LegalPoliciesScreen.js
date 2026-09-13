import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { AppHeader } from '../../components/common/AppHeader';
import { CollapsibleHeaderLayout } from '../../components/common/CollapsibleHeaderLayout';
import { AppCard } from '../../components/common/AppCard';
import { LEGAL_SECTIONS } from '../../mock/supportAndLegal';

export const LegalPoliciesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedSection, setSelectedSection] = useState(LEGAL_SECTIONS[0]);

  return (
    <CollapsibleHeaderLayout
      header={
        <AppHeader
          title="Legal & Policies"
          subtitle="Agri-Logistics Partner Governance"
          showBack
          onBackPress={() => navigation.goBack()}
        />
      }
      headerHeight={60}
    >

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Selectors */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillScrollView}
          contentContainerStyle={styles.pillContainer}
        >
          {LEGAL_SECTIONS.map((sec) => {
            const isSelected = selectedSection.id === sec.id;
            return (
              <TouchableOpacity
                key={sec.id}
                style={[styles.policyPill, isSelected && styles.policyPillActive]}
                onPress={() => setSelectedSection(sec)}
              >
                <Text style={[styles.policyPillText, isSelected && styles.policyPillTextActive]}>
                  {sec.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Policy Document Body */}
        <AppCard style={styles.documentCard}>
          <View style={styles.docHeader}>
            <View style={styles.docIconBox}>
              <MaterialCommunityIcons name="file-certificate" size={24} color={colors.white} />
            </View>
            <View style={styles.docHeaderText}>
              <Text style={styles.docTitle}>{selectedSection.title}</Text>
              <Text style={styles.docUpdated}>Last Updated: {selectedSection.lastUpdated}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.docContent}>{selectedSection.content}</Text>
        </AppCard>

        {/* Regulatory Compliance Badge */}
        <View style={styles.complianceBox}>
          <MaterialCommunityIcons name="shield-check" size={22} color={colors.primary} />
          <View style={styles.complianceTextCol}>
            <Text style={styles.complianceTitle}>Government Agri-Logistics Aligned</Text>
            <Text style={styles.complianceDesc}>
              Complies with Digital Agricultural Logistics Mandates and Ministry of Agriculture guidelines.
            </Text>
          </View>
        </View>
      </ScrollView>
    </CollapsibleHeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  pillScrollView: {
    marginBottom: spacing.md,
  },
  pillContainer: {
    paddingRight: spacing.md,
  },
  policyPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.radiusFull,
    backgroundColor: colors.card,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  policyPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  policyPillText: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  policyPillTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  documentCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  docHeaderText: {
    flex: 1,
  },
  docTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  docUpdated: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  docContent: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  complianceBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceContainer,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  complianceTextCol: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  complianceTitle: {
    ...typography.labelMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  complianceDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
});
