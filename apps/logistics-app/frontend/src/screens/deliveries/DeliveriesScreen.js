import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, borderRadius, spacing } from '../../theme';
import AppHeader from '../../components/common/AppHeader';
import { CollapsibleHeaderLayout } from '../../components/common/CollapsibleHeaderLayout';
import DeliveryCard from '../../components/delivery/DeliveryCard';
import SmartRouteBanner from '../../components/delivery/SmartRouteBanner';
import EmptyState from '../../components/common/EmptyState';
import { useDelivery } from '../../context/DeliveryContext';
import { useTheme } from '../../context/ThemeContext';
import { ROUTES } from '../../navigation/routes';

export const DeliveriesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isDarkMode, colors: themeColors } = useTheme();
  const { deliveries, acceptDelivery, refreshDeliveries, setActiveDelivery } = useDelivery();

  const [activeTab, setActiveTab] = useState('Available'); // 'Available' | 'Active' | 'Completed'
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshDeliveries();
    setRefreshing(false);
  };

  const filteredDeliveries = deliveries.filter((d) => {
    if (activeTab === 'Available') return d.status === 'AVAILABLE';
    if (activeTab === 'Active') return d.status === 'ACTIVE' || d.status === 'IN_TRANSIT';
    if (activeTab === 'Completed') return d.status === 'COMPLETED';
    return true;
  });

  const handleCardPress = (delivery) => {
    setActiveDelivery(delivery);
    navigation.navigate(ROUTES.DELIVERY_DETAILS, { deliveryId: delivery.id });
  };

  const handleAccept = async (id) => {
    try {
      await acceptDelivery(id);
      Alert.alert(
        'Delivery Accepted',
        'Order assigned! You can view route details or start navigation now.',
        [
          {
            text: 'Go to Active Route',
            onPress: () => navigation.navigate(ROUTES.ACTIVE_ROUTE),
          },
          { text: 'Later' },
        ]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to accept delivery.');
    }
  };

  return (
    <CollapsibleHeaderLayout
      header={
        <AppHeader
          title="My Deliveries"
          subtitle="Manage your agricultural delivery requests"
        />
      }
      headerHeight={110}
    >

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { backgroundColor: themeColors.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themeColors.primary]}
          />
        }
      >
        {/* Segmented Filter Tabs */}
        <View
          style={[
            styles.tabBar,
            {
              backgroundColor: themeColors.card,
              borderColor: isDarkMode ? themeColors.border : colors.outlineVariant,
              borderWidth: 1,
            },
          ]}
        >
          {['Available', 'Active', 'Completed'].map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  isSelected && [
                    styles.tabButtonActive,
                    { backgroundColor: themeColors.primary },
                  ],
                ]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    { color: isSelected ? themeColors.onPrimary : themeColors.textSecondary },
                    isSelected && styles.tabButtonTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Filter / Sort Row */}
        <View style={styles.filterSortRow}>
          <View style={styles.sortLeft}>
            <Text style={[styles.sectionHeading, { color: themeColors.textPrimary }]}>
              {activeTab === 'Available'
                ? 'Nearby Deliveries'
                : activeTab === 'Active'
                ? 'Ongoing Deliveries'
                : 'Delivery History'}
            </Text>
            <Text style={[styles.sortSub, { color: themeColors.textSecondary }]}>Sort: Nearest</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.filterBtn,
              {
                backgroundColor: isDarkMode ? themeColors.surfaceContainerHigh : colors.surfaceContainerHigh,
                borderColor: isDarkMode ? themeColors.border : 'transparent',
                borderWidth: isDarkMode ? 1 : 0,
              },
            ]}
            onPress={() =>
              Alert.alert('Filter', 'Filter by radius, weight (kg), or crop type.')
            }
            activeOpacity={0.7}
          >
            <Text style={[styles.filterBtnText, { color: themeColors.textSecondary }]}>Filter</Text>
            <MaterialIcons name="tune" size={16} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Smart Route Match Banner (on Available tab) */}
        {activeTab === 'Available' && (
          <SmartRouteBanner
            savingKm="6.8 km"
            extraEarning="₹140"
            onPress={() => {
              Alert.alert(
                'AI Smart Route Optimization',
                'Combining Green Valley Farm & Farmer Collection Point saves 6.8 km and adds ₹140 bonus.'
              );
            }}
          />
        )}

        {/* Delivery Cards List */}
        {filteredDeliveries.length > 0 ? (
          filteredDeliveries.map((delivery) => (
            <DeliveryCard
              key={delivery.id}
              delivery={delivery}
              onPress={() => handleCardPress(delivery)}
              onAccept={handleAccept}
              showActions={activeTab === 'Available'}
            />
          ))
        ) : (
          <EmptyState
            icon={
              activeTab === 'Active'
                ? 'local-shipping'
                : activeTab === 'Completed'
                ? 'check-circle'
                : 'inbox'
            }
            title={
              activeTab === 'Active'
                ? 'No active deliveries'
                : activeTab === 'Completed'
                ? 'No completed deliveries yet'
                : 'No deliveries available nearby'
            }
            description={
              activeTab === 'Active'
                ? 'Accept a delivery from the Available tab to start a trip.'
                : 'Check back shortly or pull down to refresh.'
            }
            actionTitle={activeTab !== 'Available' ? 'Browse Available' : 'Refresh'}
            onActionPress={
              activeTab !== 'Available'
                ? () => setActiveTab('Available')
                : onRefresh
            }
          />
        )}
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
    paddingHorizontal: spacing.containerMargin,
    paddingTop: 14,
    paddingBottom: 28,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainer,
    borderRadius: borderRadius.full,
    padding: 4,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  tabButtonTextActive: {
    color: colors.onPrimary,
    fontWeight: '700',
  },
  filterSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sortLeft: {
    gap: 2,
  },
  sectionHeading: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  sortSub: {
    ...typography.labelSm,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  filterBtnText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
});

export default DeliveriesScreen;
