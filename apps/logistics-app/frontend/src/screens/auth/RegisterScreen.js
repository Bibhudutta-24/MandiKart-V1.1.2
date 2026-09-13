import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, borderRadius, shadows } from '../../theme';
import AppButton from '../../components/common/AppButton';
import AppInput from '../../components/common/AppInput';
import { ROUTES } from '../../navigation/routes';
import { useAuth } from '../../context/AuthContext';

const VEHICLE_TYPES = [
  'Motorcycle with Cargo Rack',
  'Electric Cargo 2-Wheeler',
  'Three Wheeler (Auto / Piaggio)',
  'Mini Truck (Tata Ace / Pickup)',
];

export const RegisterScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { register, sendRegisterOtp, verifyRegisterOtp, loginWithGoogle } = useAuth();

  // Active step: 1: Aadhaar & PAN, 2: Vehicle & DL, 3: Bank Details, 4: Mobile OTP
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Aadhaar & PAN State
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarPhotoUri, setAadhaarPhotoUri] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [panPhotoUri, setPanPhotoUri] = useState('');

  // 2. Vehicle & Driving License State
  const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[0]);
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState('');
  const [vehiclePhotoUri, setVehiclePhotoUri] = useState('');
  const [platePhotoUri, setPlatePhotoUri] = useState('');
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState('');
  const [drivingLicensePhotoUri, setDrivingLicensePhotoUri] = useState('');

  // 3. Bank Details State
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [passbookPhotoUri, setPassbookPhotoUri] = useState('');
  const [detectedBank, setDetectedBank] = useState('');

  // 4. Mobile & OTP State
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);

  // Success Modal
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [registeredPartnerId, setRegisteredPartnerId] = useState('');

  // OTP Timer handler
  useEffect(() => {
    if (otpSent && countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [otpSent, countdown]);

  // IFSC Bank Name Autodetect
  useEffect(() => {
    const code = bankIfsc.trim().toUpperCase();
    if (code.startsWith('SBIN')) setDetectedBank('State Bank of India');
    else if (code.startsWith('HDFC')) setDetectedBank('HDFC Bank');
    else if (code.startsWith('ICIC')) setDetectedBank('ICICI Bank');
    else if (code.startsWith('PUNB')) setDetectedBank('Punjab National Bank');
    else if (code.startsWith('BARB')) setDetectedBank('Bank of Baroda');
    else if (code.startsWith('CNRB')) setDetectedBank('Canara Bank');
    else if (code.startsWith('UTIB')) setDetectedBank('Axis Bank');
    else if (code.length >= 4) setDetectedBank('Verified Commercial Bank Branch');
    else setDetectedBank('');
  }, [bankIfsc]);

  // Image Picker (Camera or Gallery)
  const handlePickImage = (title, onSelected) => {
    Alert.alert(
      `Upload ${title}`,
      'Choose upload source:',
      [
        {
          text: 'Open Camera',
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Camera permission is required to capture photos.');
                return;
              }
              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                onSelected(result.assets[0].uri);
              }
            } catch (err) {
              console.error('Camera capture error:', err);
              Alert.alert('Camera Error', 'Could not open camera. Please use gallery upload or check permissions.');
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Gallery access is required to select photos.');
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                onSelected(result.assets[0].uri);
              }
            } catch (err) {
              console.error('Gallery picker error:', err);
              Alert.alert('Gallery Error', 'Could not access gallery.');
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  // Step 1 Validation: Aadhaar & PAN
  const validateStep1 = () => {
    setError('');
    const cleanAadhaar = aadhaarNumber.replace(/\s+/g, '');
    if (cleanAadhaar.length < 12) {
      setError('Please enter a valid 12-digit Aadhaar Number.');
      return false;
    }
    if (!aadhaarPhotoUri) {
      setError('Please upload a clear photo of your Aadhaar Card.');
      return false;
    }
    const cleanPan = panNumber.trim().toUpperCase();
    if (cleanPan.length !== 10) {
      setError('Please enter a valid 10-character PAN Number (e.g. ABCDE1234F).');
      return false;
    }
    if (!panPhotoUri) {
      setError('Please upload a clear photo of your PAN Card.');
      return false;
    }
    return true;
  };

  // Step 2 Validation: Vehicle & DL
  const validateStep2 = () => {
    setError('');
    if (!vehiclePlateNumber.trim()) {
      setError('Please enter your Vehicle Registration Number.');
      return false;
    }
    if (!vehiclePhotoUri) {
      setError('Please upload a clear photo of your vehicle.');
      return false;
    }
    if (!platePhotoUri) {
      setError('Please upload a photo of your vehicle with clear number plate.');
      return false;
    }
    if (!drivingLicenseNumber.trim()) {
      setError('Please enter your Driving License Number.');
      return false;
    }
    if (!drivingLicensePhotoUri) {
      setError('Please upload a clear photo of your Driving License.');
      return false;
    }
    return true;
  };

  // Step 3 Validation: Bank Details
  const validateStep3 = () => {
    setError('');
    if (!bankAccountNumber.trim() || bankAccountNumber.length < 9) {
      setError('Please enter a valid Bank Account Number.');
      return false;
    }
    if (bankAccountNumber !== confirmAccountNumber) {
      setError('Bank Account numbers do not match. Please recheck.');
      return false;
    }
    if (!bankIfsc.trim() || bankIfsc.length < 11) {
      setError('Please enter a valid 11-digit Bank IFSC Code.');
      return false;
    }
    if (!passbookPhotoUri) {
      setError('Please upload a clear photo of your Bank Passbook or Cheque.');
      return false;
    }
    return true;
  };

  // Navigation between steps
  const handleNextStep = () => {
    if (activeStep === 1) {
      if (validateStep1()) setActiveStep(2);
    } else if (activeStep === 2) {
      if (validateStep2()) setActiveStep(3);
    } else if (activeStep === 3) {
      if (validateStep3()) setActiveStep(4);
    }
  };

  // Step 4: OTP Actions
  const handleSendOtp = async () => {
    setError('');
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      await sendRegisterOtp(cleanMobile);
      setOtpSent(true);
      setCountdown(30);
      setCanResend(false);
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndRegister = async () => {
    setError('');
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      setError('Please enter the 4-digit verification OTP received on your mobile.');
      return;
    }

    setLoading(true);
    try {
      // 1. Verify OTP
      await verifyRegisterOtp(mobile, cleanOtp);

      // 2. Submit Complete Partner Registration
      const result = await register({
        aadhaarNumber: aadhaarNumber.replace(/\s+/g, ''),
        aadhaarPhotoUri,
        panNumber: panNumber.trim().toUpperCase(),
        panPhotoUri,
        vehicleType,
        vehiclePlateNumber: vehiclePlateNumber.trim().toUpperCase(),
        vehiclePhotoUri,
        platePhotoUri,
        drivingLicenseNumber: drivingLicenseNumber.trim().toUpperCase(),
        drivingLicensePhotoUri,
        bankAccountNumber: bankAccountNumber.trim(),
        bankIfsc: bankIfsc.trim().toUpperCase(),
        passbookPhotoUri,
        bankName: detectedBank,
        mobile: mobile.replace(/\D/g, ''),
      });

      setRegisteredPartnerId(result.partnerId || 'MKP-10483');
      setSuccessModalVisible(true);
    } catch (err) {
      setError(err.message || 'Registration verification failed. Please enter the valid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle({
        name: 'Google Partner',
        email: 'partner.driver@mandikart.com',
      });
    } catch (err) {
      setError(err.message || 'Google registration failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Render photo uploader card component
  const renderPhotoCard = (title, subtitle, icon, uri, onSelect, onRemove) => (
    <View style={styles.photoCard}>
      <View style={styles.photoCardHeader}>
        <View style={styles.photoIconBadge}>
          <MaterialIcons name={icon} size={20} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.photoTitle}>{title}</Text>
          <Text style={styles.photoSubtitle}>{subtitle}</Text>
        </View>
        {Boolean(uri) && (
          <View style={styles.uploadedBadge}>
            <MaterialIcons name="check-circle" size={14} color="#FFFFFF" />
            <Text style={styles.uploadedBadgeText}>Attached</Text>
          </View>
        )}
      </View>

      {uri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri }} style={styles.previewImage} resizeMode="cover" />
          <View style={styles.previewOverlayRow}>
            <TouchableOpacity
              style={styles.retakeBtn}
              onPress={() => handlePickImage(title, onSelect)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="photo-camera" size={14} color="#FFFFFF" />
              <Text style={styles.retakeBtnText}>Change Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deletePhotoBtn}
              onPress={onRemove}
              activeOpacity={0.8}
            >
              <MaterialIcons name="delete-outline" size={16} color="#DC2626" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={() => handlePickImage(title, onSelect)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="cloud-upload" size={28} color={colors.primary} />
          <Text style={styles.uploadBoxText}>Tap to Capture or Upload Photo</Text>
          <Text style={styles.uploadBoxSub}>Camera & Gallery Supported (JPG, PNG)</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (activeStep > 1) {
              setActiveStep(activeStep - 1);
            } else {
              navigation.goBack();
            }
          }}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Partner Onboarding</Text>
          <Text style={styles.headerStepText}>Step {activeStep} of 4</Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      {/* Step Progress Pills */}
      <View style={styles.stepProgressRow}>
        {[
          { num: 1, label: 'Aadhaar / PAN' },
          { num: 2, label: 'Vehicle & DL' },
          { num: 3, label: 'Bank Details' },
          { num: 4, label: 'Mobile OTP' },
        ].map((item) => {
          const isDone = activeStep > item.num;
          const isCurrent = activeStep === item.num;
          return (
            <View key={item.num} style={styles.stepPillItem}>
              <View
                style={[
                  styles.stepPillDot,
                  isDone && styles.stepPillDone,
                  isCurrent && styles.stepPillCurrent,
                ]}
              >
                {isDone ? (
                  <MaterialIcons name="check" size={12} color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.stepPillDotText,
                      isCurrent && { color: '#FFFFFF', fontWeight: '800' },
                    ]}
                  >
                    {item.num}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepPillLabel,
                  isCurrent && { color: colors.primary, fontWeight: '700' },
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Error Banner */}
        {Boolean(error) && (
          <View style={styles.errorBox}>
            <MaterialIcons name="error-outline" size={18} color={colors.error} />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        {/* ============================================================ */}
        {/* STEP 1: AADHAAR & PAN DETAILS */}
        {/* ============================================================ */}
        {activeStep === 1 && (
          <View>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionTitle}>Identity Verification</Text>
              <Text style={styles.sectionSubtitle}>
                Aadhaar card aur PAN card ki details aur clear photos attach karein.
              </Text>
            </View>

            {/* Google Sign-up Option */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleSignUp}
              disabled={googleLoading || loading}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="google" size={20} color="#EA4335" style={{ marginRight: 10 }} />
              <Text style={styles.googleBtnText}>
                {googleLoading ? 'Signing up with Google...' : 'Quick Sign up with Google'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or register with documents</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Aadhaar Input */}
            <AppInput
              label="Aadhaar Card Number"
              placeholder="12-digit Aadhaar (e.g. 5482 9102 7364)"
              value={aadhaarNumber}
              onChangeText={(txt) => {
                const cleaned = txt.replace(/\D/g, '').slice(0, 12);
                const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
                setAadhaarNumber(formatted);
                if (error) setError('');
              }}
              keyboardType="number-pad"
              maxLength={14}
              icon="badge"
            />

            {/* Aadhaar Photo Card */}
            {renderPhotoCard(
              'Aadhaar Card Photo',
              'Front clear photo with full name & Aadhaar number visible',
              'camera-front',
              aadhaarPhotoUri,
              (uri) => {
                setAadhaarPhotoUri(uri);
                if (error) setError('');
              },
              () => setAadhaarPhotoUri('')
            )}

            {/* PAN Input */}
            <AppInput
              label="PAN Card Number"
              placeholder="10-character PAN (e.g. ABCDE1234F)"
              value={panNumber}
              onChangeText={(txt) => {
                setPanNumber(txt.toUpperCase().slice(0, 10));
                if (error) setError('');
              }}
              autoCapitalize="characters"
              maxLength={10}
              icon="credit-card"
            />

            {/* PAN Photo Card */}
            {renderPhotoCard(
              'PAN Card Photo',
              'Clear photo showing PAN number, photo, and signature',
              'photo-camera',
              panPhotoUri,
              (uri) => {
                setPanPhotoUri(uri);
                if (error) setError('');
              },
              () => setPanPhotoUri('')
            )}

            <AppButton
              title="Next: Vehicle & Driving License"
              iconRight="arrow-forward"
              onPress={handleNextStep}
              style={styles.nextBtn}
            />
          </View>
        )}

        {/* ============================================================ */}
        {/* STEP 2: VEHICLE PHOTOS & DRIVING LICENSE */}
        {/* ============================================================ */}
        {activeStep === 2 && (
          <View>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionTitle}>Vehicle & License Details</Text>
              <Text style={styles.sectionSubtitle}>
                Vehicle clear photo, number plate photo aur driving license attach karein.
              </Text>
            </View>

            {/* Vehicle Type Selector */}
            <Text style={styles.fieldLabel}>Select Vehicle Type</Text>
            <View style={styles.vehicleTypeGrid}>
              {VEHICLE_TYPES.map((type) => {
                const isSelected = vehicleType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.vehicleTypeChip, isSelected && styles.vehicleTypeChipSelected]}
                    onPress={() => setVehicleType(type)}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons
                      name={type.includes('Two') || type.includes('Motorcycle') ? 'two-wheeler' : 'local-shipping'}
                      size={18}
                      color={isSelected ? '#FFFFFF' : colors.outline}
                    />
                    <Text
                      style={[
                        styles.vehicleTypeChipText,
                        isSelected && styles.vehicleTypeChipTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Vehicle Number Input */}
            <AppInput
              label="Vehicle Registration Number"
              placeholder="e.g. OD-02-AB-4821"
              value={vehiclePlateNumber}
              onChangeText={(txt) => {
                setVehiclePlateNumber(txt.toUpperCase());
                if (error) setError('');
              }}
              autoCapitalize="characters"
              maxLength={15}
              icon="pin"
            />

            {/* 1. Vehicle Clear Photo */}
            {renderPhotoCard(
              'Vehicle Clear Photo',
              'Full clear photo of your vehicle from front or side',
              'directions-bike',
              vehiclePhotoUri,
              (uri) => {
                setVehiclePhotoUri(uri);
                if (error) setError('');
              },
              () => setVehiclePhotoUri('')
            )}

            {/* 2. Vehicle Photo with Clear Number Plate */}
            {renderPhotoCard(
              'Vehicle Photo with Clear Number Plate',
              'Close-up view of vehicle with clearly readable number plate',
              'featured-play-list',
              platePhotoUri,
              (uri) => {
                setPlatePhotoUri(uri);
                if (error) setError('');
              },
              () => setPlatePhotoUri('')
            )}

            {/* Driving License Number Input */}
            <AppInput
              label="Driving License (DL) Number"
              placeholder="e.g. DL-OD022018004821"
              value={drivingLicenseNumber}
              onChangeText={(txt) => {
                setDrivingLicenseNumber(txt.toUpperCase());
                if (error) setError('');
              }}
              autoCapitalize="characters"
              maxLength={20}
              icon="drive-eta"
            />

            {/* 3. Driving License Photo */}
            {renderPhotoCard(
              'Driving License Photo',
              'Front clear photo of valid Commercial / Transport DL',
              'badge',
              drivingLicensePhotoUri,
              (uri) => {
                setDrivingLicensePhotoUri(uri);
                if (error) setError('');
              },
              () => setDrivingLicensePhotoUri('')
            )}

            <AppButton
              title="Next: Bank Account Details"
              iconRight="arrow-forward"
              onPress={handleNextStep}
              style={styles.nextBtn}
            />
          </View>
        )}

        {/* ============================================================ */}
        {/* STEP 3: BANK ACCOUNT & IFSC CODE */}
        {/* ============================================================ */}
        {activeStep === 3 && (
          <View>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionTitle}>Bank Account & Payout Setup</Text>
              <Text style={styles.sectionSubtitle}>
                Daily delivery earnings aapke is bank account mein transfer ki jaayengi.
              </Text>
            </View>

            {/* Account Number */}
            <AppInput
              label="Bank Account Number"
              placeholder="Enter your account number"
              value={bankAccountNumber}
              onChangeText={(txt) => {
                setBankAccountNumber(txt.replace(/\D/g, ''));
                if (error) setError('');
              }}
              keyboardType="number-pad"
              maxLength={20}
              icon="account-balance"
            />

            {/* Confirm Account Number */}
            <AppInput
              label="Confirm Bank Account Number"
              placeholder="Re-enter bank account number"
              value={confirmAccountNumber}
              onChangeText={(txt) => {
                setConfirmAccountNumber(txt.replace(/\D/g, ''));
                if (error) setError('');
              }}
              keyboardType="number-pad"
              maxLength={20}
              icon="verified"
            />

            {/* IFSC Code */}
            <AppInput
              label="Bank IFSC Code"
              placeholder="11-character IFSC (e.g. SBIN0001234)"
              value={bankIfsc}
              onChangeText={(txt) => {
                setBankIfsc(txt.toUpperCase().slice(0, 11));
                if (error) setError('');
              }}
              autoCapitalize="characters"
              maxLength={11}
              icon="account-balance-wallet"
            />

            {/* Detected Bank Badge */}
            {Boolean(detectedBank) && (
              <View style={styles.bankBadge}>
                <MaterialIcons name="check-circle" size={16} color="#FFFFFF" />
                <Text style={styles.bankBadgeText}>{detectedBank}</Text>
              </View>
            )}

            {/* Bank Passbook / Cheque Photo */}
            {renderPhotoCard(
              'Bank Passbook / Cheque Photo',
              'Photo of passbook first page or cancelled cheque with account number & IFSC',
              'receipt-long',
              passbookPhotoUri,
              (uri) => {
                setPassbookPhotoUri(uri);
                if (error) setError('');
              },
              () => setPassbookPhotoUri('')
            )}

            <AppButton
              title="Next: Mobile OTP Verification"
              iconRight="arrow-forward"
              onPress={handleNextStep}
              style={styles.nextBtn}
            />
          </View>
        )}

        {/* ============================================================ */}
        {/* STEP 4: MOBILE NUMBER OTP AUTHENTICATION */}
        {/* ============================================================ */}
        {activeStep === 4 && (
          <View>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionTitle}>Mobile OTP Authentication</Text>
              <Text style={styles.sectionSubtitle}>
                Aapke mobile number ko OTP se verify karke registration complete karein.
              </Text>
            </View>

            <View style={styles.card}>
              {!otpSent ? (
                /* Send OTP Step */
                <View>
                  <AppInput
                    label="Mobile Number for Verification"
                    placeholder="Enter 10-digit mobile number"
                    value={mobile}
                    onChangeText={(txt) => {
                      setMobile(txt.replace(/\D/g, ''));
                      if (error) setError('');
                    }}
                    keyboardType="phone-pad"
                    maxLength={10}
                    prefix="+91"
                    icon="phone-android"
                  />

                  <AppButton
                    title="Send Verification OTP"
                    iconRight="sms"
                    onPress={handleSendOtp}
                    loading={loading}
                    style={styles.nextBtn}
                  />
                </View>
              ) : (
                /* Enter OTP Step */
                <View>
                  <View style={styles.phonePill}>
                    <View style={styles.phonePillLeft}>
                      <MaterialIcons name="phone" size={16} color={colors.primary} />
                      <Text style={styles.phonePillText}>+91 {mobile}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setOtpSent(false);
                        setOtp('');
                      }}
                    >
                      <Text style={styles.changePhoneText}>Change</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.fieldLabel}>Enter 4-Digit Verification Code</Text>
                  <View style={styles.otpInputContainer}>
                    <TextInput
                      style={styles.otpTextInput}
                      value={otp}
                      onChangeText={(txt) => {
                        setOtp(txt.replace(/\D/g, '').slice(0, 4));
                        if (error) setError('');
                      }}
                      keyboardType="number-pad"
                      maxLength={4}
                      placeholder="• • • •"
                      placeholderTextColor={colors.outline}
                      letterSpacing={14}
                      autoFocus
                    />
                  </View>

                  {/* Countdown Timer */}
                  <View style={styles.timerRow}>
                    {canResend ? (
                      <TouchableOpacity onPress={handleSendOtp} disabled={loading}>
                        <Text style={styles.resendActiveText}>Resend OTP</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.timerText}>
                        Resend code in{' '}
                        <Text style={styles.timerHighlight}>{countdown}s</Text>
                      </Text>
                    )}
                  </View>

                  {/* Complete Registration Button */}
                  <AppButton
                    title="Verify Mobile & Complete Registration"
                    iconRight="verified-user"
                    onPress={handleVerifyOtpAndRegister}
                    loading={loading}
                    style={styles.nextBtn}
                  />
                </View>
              )}
            </View>

            {/* Summary Review Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Document Verification Checklist</Text>
              <View style={styles.summaryItem}>
                <MaterialIcons
                  name={aadhaarPhotoUri ? 'check-circle' : 'radio-button-unchecked'}
                  size={16}
                  color={aadhaarPhotoUri ? '#15803d' : colors.outline}
                />
                <Text style={styles.summaryItemText}>
                  Aadhaar Card: {aadhaarNumber ? `XXXX-${aadhaarNumber.slice(-4)}` : 'Not provided'}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <MaterialIcons
                  name={panPhotoUri ? 'check-circle' : 'radio-button-unchecked'}
                  size={16}
                  color={panPhotoUri ? '#15803d' : colors.outline}
                />
                <Text style={styles.summaryItemText}>
                  PAN Card: {panNumber || 'Not provided'}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <MaterialIcons
                  name={vehiclePhotoUri && platePhotoUri ? 'check-circle' : 'radio-button-unchecked'}
                  size={16}
                  color={vehiclePhotoUri && platePhotoUri ? '#15803d' : colors.outline}
                />
                <Text style={styles.summaryItemText}>
                  Vehicle Photos: {vehiclePlateNumber || 'Not provided'}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <MaterialIcons
                  name={drivingLicensePhotoUri ? 'check-circle' : 'radio-button-unchecked'}
                  size={16}
                  color={drivingLicensePhotoUri ? '#15803d' : colors.outline}
                />
                <Text style={styles.summaryItemText}>
                  Driving License: {drivingLicenseNumber || 'Not provided'}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <MaterialIcons
                  name={passbookPhotoUri ? 'check-circle' : 'radio-button-unchecked'}
                  size={16}
                  color={passbookPhotoUri ? '#15803d' : colors.outline}
                />
                <Text style={styles.summaryItemText}>
                  Bank Account: {bankAccountNumber ? `A/C ending in ${bankAccountNumber.slice(-4)}` : 'Not provided'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Existing Partner Link */}
        <View style={styles.loginLinkRow}>
          <Text style={styles.loginLinkText}>Already registered as a partner?</Text>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)}>
            <Text style={styles.loginActionText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* SUCCESS MODAL */}
      <Modal visible={successModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconCircle}>
              <MaterialIcons name="verified" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.modalTitle}>Registration Submitted!</Text>
            <Text style={styles.modalSub}>
              Aapka partner onboarding safalta-purvak complete ho gaya hai.
            </Text>

            <View style={styles.partnerIdBox}>
              <Text style={styles.partnerIdLabel}>Assigned Partner ID</Text>
              <Text style={styles.partnerIdValue}>{registeredPartnerId}</Text>
            </View>

            <View style={styles.modalDocsSummary}>
              <Text style={styles.modalDocsTitle}>Verified Credentials:</Text>
              <Text style={styles.modalDocLine}>✔ Aadhaar & PAN Uploaded</Text>
              <Text style={styles.modalDocLine}>✔ Vehicle & License Uploaded</Text>
              <Text style={styles.modalDocLine}>✔ Bank Settlement Configured</Text>
              <Text style={styles.modalDocLine}>✔ Mobile OTP Authenticated</Text>
            </View>

            <AppButton
              title="Go to Mobile Sign In"
              iconRight="arrow-forward"
              onPress={() => {
                setSuccessModalVisible(false);
                navigation.navigate(ROUTES.LOGIN);
              }}
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2EBE2',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F0F4F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleBox: {
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.subtitle1,
    fontWeight: '800',
    color: colors.onSurface,
  },
  headerStepText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
  },
  stepProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6EFE6',
  },
  stepPillItem: {
    flex: 1,
    alignItems: 'center',
  },
  stepPillDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepPillDone: {
    backgroundColor: colors.primary,
  },
  stepPillCurrent: {
    backgroundColor: colors.primary,
  },
  stepPillDotText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  stepPillLabel: {
    fontSize: 10,
    color: colors.outline,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  sectionHeaderBox: {
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.h3,
    fontWeight: '800',
    color: colors.onSurface,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.outline,
    marginTop: 4,
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDE8E8',
    padding: 12,
    borderRadius: borderRadius.md,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F8B4B4',
  },
  errorBannerText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
    flex: 1,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
    marginBottom: 14,
    ...shadows.xs,
  },
  googleBtnText: {
    ...typography.button,
    color: '#1E293B',
    fontWeight: '700',
    fontSize: 14,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8E2',
  },
  dividerText: {
    ...typography.caption,
    color: colors.outline,
    paddingHorizontal: 10,
    fontSize: 11,
  },
  photoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2EBE2',
    ...shadows.xs,
  },
  photoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  photoIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoTitle: {
    ...typography.subtitle2,
    fontWeight: '700',
    color: colors.onSurface,
  },
  photoSubtitle: {
    ...typography.caption,
    fontSize: 11,
    color: colors.outline,
    marginTop: 1,
  },
  uploadedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  uploadedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: '#F9FCF9',
  },
  uploadBoxText: {
    ...typography.body2,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 6,
  },
  uploadBoxSub: {
    ...typography.caption,
    fontSize: 11,
    color: colors.outline,
    marginTop: 2,
  },
  previewContainer: {
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginTop: 4,
  },
  previewImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#E5E7EB',
  },
  previewOverlayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retakeBtnText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  deletePhotoBtn: {
    padding: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
  },
  fieldLabel: {
    ...typography.subtitle2,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 8,
  },
  vehicleTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  vehicleTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2EBE2',
  },
  vehicleTypeChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  vehicleTypeChipText: {
    ...typography.caption,
    color: colors.onSurface,
    fontWeight: '600',
  },
  vehicleTypeChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  bankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 6,
    marginBottom: 16,
    marginTop: -8,
  },
  bankBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2EBE2',
    ...shadows.sm,
    marginBottom: 18,
  },
  phonePill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 16,
  },
  phonePillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phonePillText: {
    ...typography.body2,
    fontWeight: '700',
    color: colors.onSurface,
  },
  changePhoneText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  otpInputContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  otpTextInput: {
    ...typography.h2,
    color: colors.onSurface,
    fontWeight: '800',
    textAlign: 'center',
    width: '100%',
  },
  timerRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    ...typography.caption,
    color: colors.outline,
  },
  timerHighlight: {
    fontWeight: '700',
    color: colors.primary,
  },
  resendActiveText: {
    ...typography.body2,
    fontWeight: '700',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2EBE2',
    marginBottom: 16,
  },
  summaryTitle: {
    ...typography.subtitle2,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 10,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  summaryItemText: {
    ...typography.caption,
    color: colors.onSurface,
  },
  nextBtn: {
    marginTop: 8,
  },
  loginLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  loginLinkText: {
    ...typography.caption,
    color: colors.outline,
  },
  loginActionText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    ...shadows.lg,
  },
  modalIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    ...typography.h3,
    fontWeight: '800',
    color: colors.onSurface,
    textAlign: 'center',
  },
  modalSub: {
    ...typography.caption,
    color: colors.outline,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  partnerIdBox: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  partnerIdLabel: {
    ...typography.caption,
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
    opacity: 0.9,
  },
  partnerIdValue: {
    ...typography.h3,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  modalDocsSummary: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    marginBottom: 20,
  },
  modalDocsTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 6,
  },
  modalDocLine: {
    ...typography.caption,
    fontSize: 11,
    color: '#374151',
    marginBottom: 3,
  },
});

export default RegisterScreen;
