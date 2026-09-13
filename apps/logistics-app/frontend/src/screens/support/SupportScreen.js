import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { AppHeader } from '../../components/common/AppHeader';
import { CollapsibleHeaderLayout } from '../../components/common/CollapsibleHeaderLayout';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { FAQS } from '../../mock/supportAndLegal';

export const SupportScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleCallSupport = () => {
    Linking.openURL('tel:18004192474').catch(() => {
      Alert.alert('Phone Call', 'Call Mandi Support Hotline: 1800-419-AGRI (1800-419-2474)');
    });
  };

  const handleOpenTicket = (topic) => {
    Alert.alert(
      'Open Support Ticket',
      `Would you like to connect with a Mandi Dispatch Supervisor for "${topic}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Chat',
          onPress: () => Alert.alert('Chat Connected', 'Dispatch agent is reviewing your active status.'),
        },
      ]
    );
  };

  return (
    <CollapsibleHeaderLayout
      header={
        <AppHeader
          title="Help & Support"
          subtitle="24x7 Mandi Dispatch Control Room"
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
        {/* Urgent Emergency / Dispatch Help Hero */}
        <View style={styles.emergencyHero}>
          <View style={styles.emergencyIconBox}>
            <MaterialCommunityIcons name="headset" size={28} color={colors.white} />
          </View>
          <View style={styles.emergencyContent}>
            <Text style={styles.emergencyTitle}>24x7 Partner Toll-Free</Text>
            <Text style={styles.emergencySubtitle}>
              Dedicated logistics helpline for route delays, transit breakdowns, or mandi gate check issues.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.callNowBtn}
            activeOpacity={0.85}
            onPress={handleCallSupport}
          >
            <MaterialCommunityIcons name="phone" size={18} color={colors.primary} />
            <Text style={styles.callNowBtnText}>Call 1800-419-AGRI</Text>
          </TouchableOpacity>
        </View>

        {/* Fast Action Grid */}
        <Text style={styles.sectionHeading}>COMMON HELP TOPICS</Text>
        <View style={styles.actionGrid}>
          {[
            { id: '1', title: 'Route / GPS Issue', icon: 'map-marker-alert', color: colors.primary },
            { id: '2', title: 'Produce Damaged', icon: 'food-apple', color: colors.error },
            { id: '3', title: 'Payment Settlement', icon: 'cash-fast', color: colors.accent },
            { id: '4', title: 'Vehicle Breakdown', icon: 'tow-truck', color: colors.primary },
          ].map((topic) => (
            <TouchableOpacity
              key={topic.id}
              style={styles.gridCard}
              activeOpacity={0.7}
              onPress={() => handleOpenTicket(topic.title)}
            >
              <View style={[styles.gridIconBox, { backgroundColor: colors.primaryContainer }]}>
                <MaterialCommunityIcons name={topic.icon} size={24} color={colors.white} />
              </View>
              <Text style={styles.gridTitle}>{topic.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Frequently Asked Questions */}
        <Text style={styles.sectionHeading}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={styles.faqList}>
          {FAQS.map((faq) => {
            const isExpanded = expandedFaq === faq.id;
            return (
              <AppCard key={faq.id} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  activeOpacity={0.7}
                  onPress={() => setExpandedFaq(isExpanded ? null : faq.id)}
                >
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <MaterialCommunityIcons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.faqAnswerBox}>
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  </View>
                )}
              </AppCard>
            );
          })}
        </View>

        {/* Safety Hotline Card */}
        <View style={styles.safetyBox}>
          <MaterialCommunityIcons name="shield-alert" size={22} color={colors.textSecondary} />
          <Text style={styles.safetyText}>
            For highway emergencies or road accidents, dial National Emergency Number <Text style={styles.bold}>112</Text> immediately.
          </Text>
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
  emergencyHero: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radiusLg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  emergencyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emergencyContent: {
    marginBottom: spacing.md,
  },
  emergencyTitle: {
    ...typography.titleMedium,
    color: colors.white,
    fontWeight: '800',
  },
  emergencySubtitle: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
    marginTop: 4,
  },
  callNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    paddingVertical: spacing.sm,
  },
  callNowBtnText: {
    ...typography.labelMedium,
    color: colors.primary,
    fontWeight: '800',
    marginLeft: spacing.xs,
  },
  sectionHeading: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  gridCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  gridIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  gridTitle: {
    ...typography.labelSmall,
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  faqList: {
    marginBottom: spacing.md,
  },
  faqCard: {
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    ...typography.labelMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    paddingRight: spacing.sm,
  },
  faqAnswerBox: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  faqAnswer: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  safetyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  safetyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
