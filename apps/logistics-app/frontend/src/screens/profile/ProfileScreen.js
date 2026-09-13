import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { CollapsibleHeaderLayout } from '../../components/common/CollapsibleHeaderLayout';
import { AppCard } from '../../components/common/AppCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ROUTES } from '../../navigation/routes';

const PRESET_AVATARS = [
  { id: '1', label: 'Driver Cap', uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80' },
  { id: '2', label: 'Partner Pro', uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80' },
  { id: '3', label: 'Agri Hero', uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=240&q=80' },
  { id: '4', label: 'Express Delivery', uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80' },
];

const VEHICLE_TYPES = [
  'Motorcycle with Cargo Rack',
  'Electric Cargo Scooter',
  'Small Commercial Carrier (3-Wheeler)',
  'Mahindra Bolero Maxi Truck',
];

export const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { partner, logout, updatePreferences, setPartner } = useAuth();
  const { isDarkMode, setDarkMode, colors: themeColors } = useTheme();

  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoNavigate, setAutoNavigate] = useState(true);

  // Modals visibility state
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const editBtnScale = useRef(new Animated.Value(1)).current;

  const handleEditPressIn = () => {
    Animated.spring(editBtnScale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 35,
      bounciness: 4,
    }).start();
  };

  const handleEditPressOut = () => {
    Animated.spring(editBtnScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 24,
      bounciness: 6,
    }).start();
  };

  // Vehicle data resolution
  const vehicle = {
    type: partner?.vehicle?.type || 'Mahindra Bolero Maxi Truck',
    registrationNumber: partner?.vehicle?.registrationNumber || partner?.vehicle?.plateNumber || 'OD-02-AB-4821',
    capacityKg: partner?.vehicle?.capacityKg || 1200,
    crateSlots: partner?.vehicle?.crateSlots || 45,
    coldStorage: partner?.vehicle?.coldStorage || false,
    insuranceExpiry: partner?.vehicle?.insuranceExpiry || partner?.vehicle?.insuranceValidUntil || '15-Nov-2027',
  };

  // Edit Profile Form State
  const [editName, setEditName] = useState(partner?.name || 'Rahul Singh');
  const [editPhone, setEditPhone] = useState(partner?.phone || '+91 98765 43210');
  const [editEmail, setEditEmail] = useState(partner?.email || 'rahul.partner@mandikart.com');
  const [editHub, setEditHub] = useState(partner?.hub || 'Sambalpur Main Mandi');
  const [editVehicleType, setEditVehicleType] = useState(vehicle.type);
  const [editVehicleReg, setEditVehicleReg] = useState(vehicle.registrationNumber);
  const [editCapacity, setEditCapacity] = useState(String(vehicle.capacityKg));
  const [editCrates, setEditCrates] = useState(String(vehicle.crateSlots));

  const openEditModal = () => {
    setEditName(partner?.name || 'Rahul Singh');
    setEditPhone(partner?.phone || '+91 98765 43210');
    setEditEmail(partner?.email || 'rahul.partner@mandikart.com');
    setEditHub(partner?.hub || 'Sambalpur Main Mandi');
    setEditVehicleType(vehicle.type);
    setEditVehicleReg(vehicle.registrationNumber);
    setEditCapacity(String(vehicle.capacityKg || 1200));
    setEditCrates(String(vehicle.crateSlots || 45));
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      Alert.alert('Validation', 'Please enter a valid driver name.');
      return;
    }
    if (!editPhone.trim()) {
      Alert.alert('Validation', 'Please enter a contact mobile number.');
      return;
    }

    const words = editName.trim().split(' ');
    const initials = words.length > 1
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : words[0].substring(0, 2).toUpperCase();

    setPartner((prev) => ({
      ...prev,
      name: editName.trim(),
      avatarInitials: initials || 'MK',
      phone: editPhone.trim(),
      email: editEmail.trim(),
      hub: editHub.trim(),
      city: editHub.split(' ')[0] || prev?.city || 'Bhubaneswar',
      vehicle: {
        ...prev?.vehicle,
        type: editVehicleType,
        registrationNumber: editVehicleReg.trim().toUpperCase(),
        plateNumber: editVehicleReg.trim().toUpperCase(),
        capacityKg: parseInt(editCapacity, 10) || 1200,
        crateSlots: parseInt(editCrates, 10) || 45,
      },
    }));

    setIsEditModalVisible(false);
    Alert.alert('Profile Updated', 'Your partner credentials and vehicle information have been saved.');
  };

  // Photo handlers
  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Please allow gallery access to choose a profile photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setPartner((prev) => ({ ...prev, avatarUri: uri }));
        setIsPhotoModalVisible(false);
        Alert.alert('Success', 'Profile photo updated successfully!');
      }
    } catch (err) {
      console.error('Gallery picker error:', err);
      Alert.alert('Error', 'Could not access gallery. You can pick one of the preset avatars below.');
    }
  };

  const handleTakePhotoWithCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Please allow camera access to take a profile photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setPartner((prev) => ({ ...prev, avatarUri: uri }));
        setIsPhotoModalVisible(false);
        Alert.alert('Success', 'Profile photo updated successfully!');
      }
    } catch (err) {
      console.error('Camera error:', err);
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const handleSelectPresetAvatar = (uri) => {
    setPartner((prev) => ({ ...prev, avatarUri: uri }));
    setIsPhotoModalVisible(false);
    Alert.alert('Success', 'Avatar updated!');
  };

  const handleRemovePhoto = () => {
    setPartner((prev) => {
      const copy = { ...prev };
      delete copy.avatarUri;
      return copy;
    });
    setIsPhotoModalVisible(false);
    Alert.alert('Photo Removed', 'Profile picture removed. Showing initials.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of MandiKart Partner?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background, paddingBottom: insets.bottom }]}>
      <CollapsibleHeaderLayout
        header={
          <AppHeader
            title="Driver Profile"
            subtitle="Partner Credentials & Vehicle"
          />
        }
        headerHeight={110}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Profile Card with Photo & Edit Button */}
        <View style={[styles.profileHero, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <View style={styles.profileHeroTopRow}>
            <TouchableOpacity
              style={[styles.avatarLarge, { borderColor: isDarkMode ? '#334155' : '#e2e8f0' }]}
              onPress={() => setIsPhotoModalVisible(true)}
              activeOpacity={0.8}
              accessibilityLabel="Change profile photo"
            >
              {partner?.avatarUri ? (
                <Image source={{ uri: partner.avatarUri }} style={styles.avatarImageLarge} />
              ) : (
                <Text style={styles.avatarText}>{partner?.avatarInitials || 'RS'}</Text>
              )}
              <View style={[styles.badgeCamera, { borderColor: themeColors.surface }]}>
                <MaterialCommunityIcons name="camera" size={13} color={colors.white} />
              </View>
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.profileName, { color: themeColors.textPrimary }]}>{partner?.name || 'Rahul Singh'}</Text>
                <StatusBadge status="verified" size="small" />
              </View>
              <Text style={[styles.profileId, { color: themeColors.textSecondary }]}>
                ID: {partner?.id || 'MKP-10482'} • Joined {partner?.joinedDate || 'Aug 2024'}
              </Text>
              <Text style={[styles.profileContact, { color: themeColors.textTertiary }]}>
                {partner?.phone || '+91 98765 43210'}
              </Text>
              <Text style={[styles.profileHubText, { color: themeColors.primary }]} numberOfLines={1}>
                📍 {partner?.hub || 'Sambalpur Main Mandi'}
              </Text>
            </View>
          </View>

          <View style={[styles.heroDivider, { backgroundColor: themeColors.border }]} />

          {/* Large & Prominent Edit Profile Button */}
          <Animated.View style={{ transform: [{ scale: editBtnScale }] }}>
            <TouchableOpacity
              style={[
                styles.editProfileBtnLarge,
                {
                  backgroundColor: isDarkMode ? '#064e3b33' : '#ecfdf5',
                  borderColor: isDarkMode ? '#065f46' : '#a7f3d0',
                },
              ]}
              onPress={openEditModal}
              onPressIn={handleEditPressIn}
              onPressOut={handleEditPressOut}
              activeOpacity={0.9}
              accessibilityLabel="Edit Profile details"
            >
              <View style={styles.editProfileBtnLeft}>
                <View style={[styles.editProfileIconCircle, { backgroundColor: themeColors.primary }]}>
                  <MaterialCommunityIcons name="account-edit" size={19} color={colors.white} />
                </View>
                <Text style={[styles.editProfileBtnLargeText, { color: themeColors.primary }]}>Edit Partner Profile</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={themeColors.primary} />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* 4 Quick Stats */}
        <View style={[styles.statsRow, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: themeColors.primary }]}>
              {partner?.stats?.totalDeliveries || partner?.totalDeliveries || 428}
            </Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Deliveries</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: themeColors.primary }]}>
              {partner?.stats?.rating || partner?.rating || '4.92'} ★
            </Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Rating</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: themeColors.primary }]}>{partner?.stats?.onTimeRate || '98%'}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>On-Time</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: themeColors.primary }]}>{partner?.stats?.experienceYears || '3 yrs'}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Exp</Text>
          </View>
        </View>

        {/* Registered Commercial Vehicle */}
        <View style={styles.sectionHeadingRow}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>REGISTERED AGRI-VEHICLE</Text>
          <TouchableOpacity onPress={openEditModal} activeOpacity={0.7}>
            <Text style={[styles.editLinkText, { color: themeColors.primary }]}>Modify</Text>
          </TouchableOpacity>
        </View>
        <AppCard style={styles.vehicleCard}>
          <View style={styles.vehicleHeader}>
            <View style={[styles.vehicleIcon, { backgroundColor: isDarkMode ? '#064e3b44' : '#ecfdf5' }]}>
              <MaterialCommunityIcons name="truck-cargo-container" size={24} color={themeColors.primary} />
            </View>
            <View style={styles.vehicleTitleBox}>
              <Text style={[styles.vehicleName, { color: themeColors.textPrimary }]}>{vehicle.type}</Text>
              <Text style={[styles.vehicleReg, { color: themeColors.textSecondary }]}>{vehicle.registrationNumber}</Text>
            </View>
            <StatusBadge status="verified" size="small" />
          </View>

          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

          <View style={styles.vehicleSpecsRow}>
            <View style={styles.specItem}>
              <Text style={[styles.specLabel, { color: themeColors.textTertiary }]}>Max Payload</Text>
              <Text style={[styles.specVal, { color: themeColors.textPrimary }]}>{vehicle.capacityKg} kg</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={[styles.specLabel, { color: themeColors.textTertiary }]}>Crate Slots</Text>
              <Text style={[styles.specVal, { color: themeColors.textPrimary }]}>{vehicle.crateSlots} crates</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={[styles.specLabel, { color: themeColors.textTertiary }]}>Insurance Till</Text>
              <Text style={[styles.specVal, { color: themeColors.textPrimary }]}>{vehicle.insuranceExpiry}</Text>
            </View>
          </View>
        </AppCard>

        {/* Document Verifications */}
        <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>DOCUMENTS & COMPLIANCE</Text>
        <AppCard style={styles.docCard}>
          {[
            { name: 'Driving License (Commercial HGV)', status: 'Approved' },
            { name: 'Vehicle Registration Certificate (RC)', status: 'Approved' },
            { name: 'Aadhaar Card KYC', status: 'Approved' },
            { name: 'Commercial Transit Insurance', status: 'Approved' },
          ].map((doc, idx) => (
            <View
              key={idx}
              style={[
                styles.docItem,
                idx !== 3 && { borderBottomWidth: 1, borderBottomColor: themeColors.border },
              ]}
            >
              <MaterialCommunityIcons name="shield-check" size={20} color={themeColors.primary} />
              <Text style={[styles.docName, { color: themeColors.textPrimary }]}>{doc.name}</Text>
              <Text style={[styles.docStatus, { color: themeColors.primary }]}>{doc.status}</Text>
            </View>
          ))}
        </AppCard>

        {/* Operational Preferences */}
        <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>APP & DISPATCH SETTINGS</Text>
        <AppCard style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={[styles.settingTitle, { color: themeColors.textPrimary }]}>Mandi Loud Audio Chime</Text>
              <Text style={[styles.settingSubtitle, { color: themeColors.textTertiary }]}>Play loud horn chime when new order is broadcasted</Text>
            </View>
            <Switch
              value={soundAlerts}
              onValueChange={setSoundAlerts}
              trackColor={{ false: isDarkMode ? '#334155' : colors.neutralVariant200, true: themeColors.primary }}
              thumbColor={soundAlerts ? themeColors.primary : colors.neutralVariant400}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={[styles.settingTitle, { color: themeColors.textPrimary }]}>Auto OSM Navigation</Text>
              <Text style={[styles.settingSubtitle, { color: themeColors.textTertiary }]}>Launch active turn-by-turn route upon accepting pickup</Text>
            </View>
            <Switch
              value={autoNavigate}
              onValueChange={setAutoNavigate}
              trackColor={{ false: isDarkMode ? '#334155' : colors.neutralVariant200, true: themeColors.primary }}
              thumbColor={autoNavigate ? themeColors.primary : colors.neutralVariant400}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={[styles.settingTitle, { color: themeColors.textPrimary }]}>Night Mode / Dark Theme</Text>
              <Text style={[styles.settingSubtitle, { color: themeColors.textTertiary }]}>
                {isDarkMode ? 'Dark high-contrast theme active across app' : 'Enable deep dark theme for night driving'}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={(val) => setDarkMode(val)}
              trackColor={{ false: isDarkMode ? '#334155' : '#cbd5e1', true: themeColors.primary }}
              thumbColor={isDarkMode ? '#ffffff' : '#94a3b8'}
            />
          </View>
        </AppCard>

        {/* Support & Legal Links */}
        <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>SUPPORT & POLICIES</Text>
        <AppCard style={styles.linksCard}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate(ROUTES.SUPPORT)}
          >
            <MaterialCommunityIcons name="help-circle-outline" size={22} color={themeColors.textPrimary} />
            <Text style={[styles.linkTitle, { color: themeColors.textPrimary }]}>Help & Mandi Dispatch Support</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={themeColors.textTertiary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate(ROUTES.LEGAL_POLICIES)}
          >
            <MaterialCommunityIcons name="file-document-outline" size={22} color={themeColors.textPrimary} />
            <Text style={[styles.linkTitle, { color: themeColors.textPrimary }]}>Terms, Privacy & Payout Policies</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={themeColors.textTertiary} />
          </TouchableOpacity>
        </AppCard>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: themeColors.surface, borderColor: themeColors.error }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="logout" size={20} color={themeColors.error} />
          <Text style={[styles.logoutText, { color: themeColors.error }]}>Log Out of MandiKart</Text>
        </TouchableOpacity>

        {/* Version info */}
        <Text style={[styles.versionText, { color: themeColors.textTertiary }]}>MandiKart Logistics Partner v2.4.0 (Build 2026)</Text>
      </ScrollView>
    </CollapsibleHeaderLayout>

      {/* ========================================================================= */}
      {/* 1. PHOTO SELECTION MODAL */}
      {/* ========================================================================= */}
      <Modal
        visible={isPhotoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPhotoModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsPhotoModalVisible(false)}
        >
          <View style={[styles.photoSheetContainer, { backgroundColor: themeColors.surface }]} onStartShouldSetResponder={() => true}>
            <View style={[styles.sheetHandle, { backgroundColor: isDarkMode ? '#334155' : '#cbd5e1' }]} />
            <Text style={[styles.sheetTitle, { color: themeColors.textPrimary }]}>Update Profile Photo</Text>
            <Text style={[styles.sheetSubtitle, { color: themeColors.textSecondary }]}>Choose a photo or select an official partner avatar</Text>

            {/* Quick Action Buttons */}
            <View style={styles.photoActionsRow}>
              <TouchableOpacity
                style={styles.photoActionCard}
                onPress={handleTakePhotoWithCamera}
                activeOpacity={0.7}
              >
                <View style={[styles.photoActionIcon, { backgroundColor: isDarkMode ? '#064e3b33' : '#ecfdf5', borderColor: themeColors.border }]}>
                  <MaterialIcons name="photo-camera" size={24} color={themeColors.primary} />
                </View>
                <Text style={[styles.photoActionLabel, { color: themeColors.textPrimary }]}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.photoActionCard}
                onPress={handlePickFromGallery}
                activeOpacity={0.7}
              >
                <View style={[styles.photoActionIcon, { backgroundColor: isDarkMode ? '#1e3a8a33' : '#eff6ff', borderColor: themeColors.border }]}>
                  <MaterialIcons name="photo-library" size={24} color="#3b82f6" />
                </View>
                <Text style={[styles.photoActionLabel, { color: themeColors.textPrimary }]}>Gallery</Text>
              </TouchableOpacity>

              {partner?.avatarUri ? (
                <TouchableOpacity
                  style={styles.photoActionCard}
                  onPress={handleRemovePhoto}
                  activeOpacity={0.7}
                >
                  <View style={[styles.photoActionIcon, { backgroundColor: isDarkMode ? '#7f1d1d33' : '#fef2f2', borderColor: themeColors.border }]}>
                    <MaterialIcons name="delete-outline" size={24} color={themeColors.error} />
                  </View>
                  <Text style={[styles.photoActionLabel, { color: themeColors.error }]}>Remove</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Preset Avatars Section */}
            <Text style={[styles.presetSectionTitle, { color: themeColors.textSecondary }]}>Or Choose Partner Avatar</Text>
            <View style={styles.presetAvatarsRow}>
              {PRESET_AVATARS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.presetAvatarItem}
                  onPress={() => handleSelectPresetAvatar(item.uri)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: item.uri }} style={[styles.presetAvatarImage, { borderColor: themeColors.border }]} />
                  <Text style={[styles.presetAvatarLabel, { color: themeColors.textSecondary }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.sheetCloseBtn, { backgroundColor: isDarkMode ? '#1e2638' : '#f1f5f9' }]}
              onPress={() => setIsPhotoModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.sheetCloseBtnText, { color: themeColors.textPrimary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. EDIT PROFILE MODAL */}
      {/* ========================================================================= */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.editModalContent, { backgroundColor: themeColors.surface }]}>
            <View style={[styles.editModalHeader, { borderBottomColor: themeColors.border }]}>
              <View>
                <Text style={[styles.editModalTitle, { color: themeColors.textPrimary }]}>Edit Profile Details</Text>
                <Text style={[styles.editModalSubtitle, { color: themeColors.textSecondary }]}>Update personal & vehicle credentials</Text>
              </View>
              <TouchableOpacity
                style={[styles.closeCircleBtn, { backgroundColor: isDarkMode ? '#1e2638' : '#f1f5f9' }]}
                onPress={() => setIsEditModalVisible(false)}
              >
                <MaterialIcons name="close" size={20} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.editModalBody}>
              {/* Personal Section */}
              <Text style={[styles.formGroupLabel, { color: themeColors.primary }]}>PERSONAL DETAILS</Text>

              <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>Full Name</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: isDarkMode ? '#1e2638' : '#f8fafc', color: themeColors.textPrimary, borderColor: themeColors.border }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Driver Full Name"
                placeholderTextColor={themeColors.textTertiary}
              />

              <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>Mobile Number</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: isDarkMode ? '#1e2638' : '#f8fafc', color: themeColors.textPrimary, borderColor: themeColors.border }]}
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
                placeholder="+91 98765 43210"
                placeholderTextColor={themeColors.textTertiary}
              />

              <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>Email Address</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: isDarkMode ? '#1e2638' : '#f8fafc', color: themeColors.textPrimary, borderColor: themeColors.border }]}
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                placeholder="partner@mandikart.com"
                placeholderTextColor={themeColors.textTertiary}
              />

              <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>Operating Hub / Mandi</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: isDarkMode ? '#1e2638' : '#f8fafc', color: themeColors.textPrimary, borderColor: themeColors.border }]}
                value={editHub}
                onChangeText={setEditHub}
                placeholder="e.g. Sambalpur Main Mandi"
                placeholderTextColor={themeColors.textTertiary}
              />

              {/* Vehicle Section */}
              <Text style={[styles.formGroupLabel, { color: themeColors.primary, marginTop: 18 }]}>VEHICLE DETAILS</Text>

              <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>Vehicle Model / Type</Text>
              <View style={styles.vehicleTypeChipsRow}>
                {VEHICLE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.vehicleTypeChip,
                      { backgroundColor: isDarkMode ? '#1e2638' : '#f1f5f9', borderColor: themeColors.border },
                      editVehicleType === type && { backgroundColor: isDarkMode ? '#064e3b44' : '#ecfdf5', borderColor: themeColors.primary },
                    ]}
                    onPress={() => setEditVehicleType(type)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.vehicleTypeChipText,
                        { color: themeColors.textSecondary },
                        editVehicleType === type && { color: themeColors.primary, fontWeight: '700' },
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>Vehicle Registration Number</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: isDarkMode ? '#1e2638' : '#f8fafc', color: themeColors.textPrimary, borderColor: themeColors.border }]}
                value={editVehicleReg}
                onChangeText={setEditVehicleReg}
                autoCapitalize="characters"
                placeholder="OD-02-AB-4821"
                placeholderTextColor={themeColors.textTertiary}
              />

              <View style={styles.splitRow}>
                <View style={styles.splitCol}>
                  <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>Payload (kg)</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: isDarkMode ? '#1e2638' : '#f8fafc', color: themeColors.textPrimary, borderColor: themeColors.border }]}
                    value={editCapacity}
                    onChangeText={setEditCapacity}
                    keyboardType="numeric"
                    placeholder="1200"
                    placeholderTextColor={themeColors.textTertiary}
                  />
                </View>
                <View style={styles.splitCol}>
                  <Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>Crates</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: isDarkMode ? '#1e2638' : '#f8fafc', color: themeColors.textPrimary, borderColor: themeColors.border }]}
                    value={editCrates}
                    onChangeText={setEditCrates}
                    keyboardType="numeric"
                    placeholder="45"
                    placeholderTextColor={themeColors.textTertiary}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={[styles.editModalFooter, { borderTopColor: themeColors.border }]}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: isDarkMode ? '#1e2638' : '#f1f5f9' }]}
                onPress={() => setIsEditModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelBtnText, { color: themeColors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: themeColors.primary }]}
                onPress={handleSaveProfile}
                activeOpacity={0.8}
              >
                <MaterialIcons name="check" size={18} color={colors.white} style={{ marginRight: 6 }} />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 94,
  },
  profileHero: {
    backgroundColor: colors.card,
    borderRadius: spacing.radiusLg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  profileHeroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarLarge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: spacing.md,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  avatarImageLarge: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  avatarText: {
    ...typography.headlineSmall,
    color: colors.white,
    fontWeight: '800',
  },
  badgeCamera: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileName: {
    ...typography.titleLarge,
    color: colors.textPrimary,
    fontWeight: '700',
    flex: 1,
    marginRight: 6,
  },
  profileId: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  profileContact: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    fontSize: 11,
    marginTop: 2,
  },
  profileHubText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 11,
    marginTop: 3,
  },
  heroDivider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginVertical: 12,
  },
  editProfileBtnLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    borderWidth: 1.2,
    borderColor: '#a7f3d0',
  },
  editProfileBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editProfileIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileBtnLargeText: {
    ...typography.labelLarge,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.titleMedium,
    color: colors.primary,
    fontWeight: '800',
  },
  statLabel: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.borderLight,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  sectionHeading: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  editLinkText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: '700',
  },
  vehicleCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  vehicleTitleBox: {
    flex: 1,
  },
  vehicleName: {
    ...typography.labelLarge,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  vehicleReg: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  vehicleSpecsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specItem: {
    flex: 1,
  },
  specLabel: {
    ...typography.labelSmall,
    color: colors.textTertiary,
  },
  specVal: {
    ...typography.labelMedium,
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
  docCard: {
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  docItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  docName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
    marginLeft: spacing.sm,
  },
  docStatus: {
    ...typography.labelSmall,
    color: colors.primary,
    fontWeight: '700',
  },
  settingsCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  settingTextCol: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  settingTitle: {
    ...typography.labelMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  settingSubtitle: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    fontSize: 11,
    marginTop: 2,
  },
  linksCard: {
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  linkTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
    marginTop: spacing.xs,
  },
  logoutText: {
    ...typography.labelMedium,
    color: colors.error,
    fontWeight: '700',
    marginLeft: spacing.xs,
  },
  versionText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
    fontSize: 11,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  photoSheetContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    ...typography.headlineSm,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  sheetSubtitle: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 18,
  },
  photoActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  photoActionCard: {
    alignItems: 'center',
    gap: 6,
  },
  photoActionIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  photoActionLabel: {
    ...typography.labelSm,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  presetSectionTitle: {
    ...typography.labelSm,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  presetAvatarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  presetAvatarItem: {
    alignItems: 'center',
    width: '23%',
  },
  presetAvatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
  },
  presetAvatarLabel: {
    ...typography.bodySmall,
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  sheetCloseBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  sheetCloseBtnText: {
    ...typography.labelMd,
    color: colors.textPrimary,
    fontWeight: '700',
  },

  // Edit Modal Styles
  editModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingBottom: 24,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  editModalTitle: {
    ...typography.headlineSm,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  editModalSubtitle: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editModalBody: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  formGroupLabel: {
    ...typography.labelSmall,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.primary,
    marginBottom: 8,
  },
  fieldLabel: {
    ...typography.labelSm,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...typography.bodyMd,
    color: colors.textPrimary,
  },
  vehicleTypeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  vehicleTypeChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  vehicleTypeChipActive: {
    backgroundColor: '#ecfdf5',
    borderColor: colors.primary,
  },
  vehicleTypeChipText: {
    ...typography.labelSm,
    fontSize: 11,
    color: colors.textSecondary,
  },
  vehicleTypeChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  splitRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  splitCol: {
    flex: 1,
  },
  editModalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    ...typography.labelMd,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    ...typography.labelMd,
    color: colors.white,
    fontWeight: '700',
  },
});

export default ProfileScreen;
