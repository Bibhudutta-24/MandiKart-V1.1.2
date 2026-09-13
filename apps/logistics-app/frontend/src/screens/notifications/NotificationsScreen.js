import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { AppHeader } from '../../components/common/AppHeader';
import { CollapsibleHeaderLayout } from '../../components/common/CollapsibleHeaderLayout';
import { AppCard } from '../../components/common/AppCard';
import { notificationService } from '../../services/notificationService';
import { formatRelativeTime } from '../../utils/formatters';

const TABS = ['All', 'Deliveries', 'Payouts', 'Alerts'];

export const NotificationsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemPress = async (item) => {
    if (!item.read) {
      await notificationService.markAsRead(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Deliveries') return item.type === 'delivery';
    if (activeTab === 'Payouts') return item.type === 'payout';
    if (activeTab === 'Alerts') return item.type === 'system' || item.type === 'incentive';
    return true;
  });

  const getIconForType = (type) => {
    switch (type) {
      case 'delivery':
        return { name: 'truck-fast', color: colors.primary };
      case 'payout':
        return { name: 'bank-check', color: colors.primary };
      case 'incentive':
        return { name: 'trophy', color: colors.accent };
      default:
        return { name: 'bell-ring', color: colors.textSecondary };
    }
  };

  return (
    <CollapsibleHeaderLayout
      header={
        <AppHeader
          title="Notifications"
          subtitle="Mandi & Dispatch Alerts"
          showBack
          onBackPress={() => navigation.goBack()}
          rightAction={{
            icon: 'check-all',
            onPress: handleMarkAllAsRead,
          }}
        />
      }
      headerHeight={60}
    >

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Category Tabs */}
        <View style={styles.tabRow}>
          {TABS.map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabChip, isSelected && styles.tabChipActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabChipText, isSelected && styles.tabChipTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Notifications List */}
        {filteredNotifications.map((item) => {
          const iconInfo = getIconForType(item.type);
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => handleItemPress(item)}
            >
              <AppCard style={[styles.notifCard, !item.read && styles.notifCardUnread]}>
                <View style={styles.notifRow}>
                  <View style={[styles.iconBox, { backgroundColor: colors.primaryContainer }]}>
                    <MaterialCommunityIcons name={iconInfo.name} size={22} color={colors.white} />
                  </View>

                  <View style={styles.contentCol}>
                    <View style={styles.headerRow}>
                      <Text style={[styles.title, !item.read && styles.titleBold]}>
                        {item.title}
                      </Text>
                      {!item.read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.body}>{item.message}</Text>
                    <Text style={styles.timestamp}>{formatRelativeTime(item.timestamp)}</Text>
                  </View>
                </View>
              </AppCard>
            </TouchableOpacity>
          );
        })}

        {filteredNotifications.length === 0 && (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="bell-sleep" size={48} color={colors.neutralVariant300} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>You're all caught up with mandi dispatches!</Text>
          </View>
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
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  tabChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.radiusFull,
    backgroundColor: colors.card,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tabChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabChipText: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabChipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  notifCard: {
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  notifCardUnread: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  contentCol: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.labelMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  titleBold: {
    fontWeight: '700',
    color: colors.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  body: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  timestamp: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    fontSize: 11,
    marginTop: 4,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    ...typography.titleMedium,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: 2,
  },
});
