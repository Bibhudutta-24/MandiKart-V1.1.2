import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, theme } from '../theme';
import { useAuthStore } from '../store/authStore';

export const HomeScreen = () => {
  const { user, farmer, logout } = useAuthStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Ram Ram 🙏</Text>
            <Text style={styles.farmerName}>{farmer?.name || user?.displayName || 'Kisan Bhai'}</Text>
            <Text style={styles.location}>
              <Ionicons name="location-sharp" size={14} color={colors.secondary} />
              {' '}{farmer?.village}, {farmer?.district}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={22} color={colors.error} />
          </TouchableOpacity>
        </View>

        {/* Verification Badge Banner */}
        <View style={styles.kycBanner}>
          <Ionicons name="checkmark-circle" size={20} color={colors.secondary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.kycTitle}>KYC Verified Farmer</Text>
            <Text style={styles.kycSubtitle}>Farm Size: {farmer?.farmSizeAcres || '5'} Acres • Direct Mandi Access</Text>
          </View>
        </View>

        {/* Command Center Summary Cards */}
        <Text style={styles.sectionHeading}>Command Center</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: colors.secondary }]}>
            <Text style={styles.statLabel}>Active Produce</Text>
            <Text style={styles.statValue}>3 Crops</Text>
            <Text style={styles.statSub}>Wheat, Rice, Mustard</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: colors.primaryContainer }]}>
            <Text style={styles.statLabel}>Live Orders</Text>
            <Text style={styles.statValue}>2 Pending</Text>
            <Text style={styles.statSub}>Ready for pickup</Text>
          </View>
        </View>

        {/* Primary Selling Action Card (from Stitch Design) */}
        <View style={styles.actionCard}>
          <View style={styles.actionCardContent}>
            <Text style={styles.actionCardTag}>BEST SELLING OPTION</Text>
            <Text style={styles.actionCardTitle}>List New Harvest</Text>
            <Text style={styles.actionCardDesc}>
              Connect directly with verified wholesale buyers at guaranteed rates.
            </Text>
            <TouchableOpacity style={styles.addProduceButton}>
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.addProduceText}>Add Produce</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Hub Navigation */}
        <Text style={styles.sectionHeading}>Farmer Operations</Text>
        <View style={styles.hubGrid}>
          <TouchableOpacity style={styles.hubItem}>
            <View style={[styles.hubIconBg, { backgroundColor: colors.surfaceContainerLow }]}>
              <MaterialCommunityIcons name="seed-outline" size={26} color={colors.primary} />
            </View>
            <Text style={styles.hubTitle}>My Produce</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.hubItem}>
            <View style={[styles.hubIconBg, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="receipt-outline" size={26} color={colors.secondary} />
            </View>
            <Text style={styles.hubTitle}>Mandi Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.hubItem}>
            <View style={[styles.hubIconBg, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="trending-up" size={26} color={colors.primaryContainer} />
            </View>
            <Text style={styles.hubTitle}>Live Rates</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.hubItem}>
            <View style={[styles.hubIconBg, { backgroundColor: '#E1F5FE' }]}>
              <Ionicons name="wallet-outline" size={26} color={colors.tertiary} />
            </View>
            <Text style={styles.hubTitle}>Payouts</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: theme.spacing.marginPage,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '700',
  },
  farmerName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.onSurface,
  },
  location: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  logoutButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: colors.surfaceCard,
    ...theme.shadows.card,
  },
  kycBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dataMatch,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    gap: 10,
    marginBottom: 20,
  },
  kycTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.secondary,
  },
  kycSubtitle: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceCard,
    padding: 14,
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 4,
    ...theme.shadows.card,
  },
  statLabel: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginVertical: 4,
  },
  statSub: {
    fontSize: 11,
    color: '#8a7264',
  },
  actionCard: {
    backgroundColor: colors.primaryContainer,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    marginBottom: 24,
    ...theme.shadows.soft3D,
  },
  actionCardContent: {},
  actionCardTag: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
    opacity: 0.9,
  },
  actionCardTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  actionCardDesc: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.95,
    marginBottom: 16,
  },
  addProduceButton: {
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.borderRadius.full,
    gap: 8,
  },
  addProduceText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  hubItem: {
    width: '48%',
    backgroundColor: colors.surfaceCard,
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.card,
  },
  hubIconBg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  hubTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },
});
