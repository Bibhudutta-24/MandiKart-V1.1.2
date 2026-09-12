/**
 * MandiKart Authoritative Cloud Functions - Auth Domain
 * Handles Farmer Auth lifecycle, role validation, and profile initialization
 */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Triggered on new user creation in Firebase Authentication
 * Ensures each user gets registered in the authoritative 'users' collection
 */
export const onUserCreated = functions.auth.user().onCreate(async (userRecord) => {
  const { uid, phoneNumber, email, displayName } = userRecord;

  const userRef = db.collection('users').doc(uid);
  const existing = await userRef.get();

  if (!existing.exists) {
    await userRef.set({
      uid,
      phoneNumber: phoneNumber || null,
      email: email || null,
      displayName: displayName || 'New Farmer',
      role: 'FARMER',
      status: 'ACTIVE',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
});

/**
 * Callable Function: Verify and Complete Farmer Registration
 */
export const completeFarmerRegistration = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to register');
  }

  const uid = context.auth.uid;
  const { name, village, district, state, pincode, farmSizeAcres, cropsGrown } = data;

  if (!name || !state || !district || !village || !pincode) {
    throw new functions.https.HttpsError('invalid-argument', 'All required farm profile fields must be provided');
  }

  const farmerId = `fmr_${uid.slice(0, 12)}`;
  const farmerRef = db.collection('farmers').doc(farmerId);
  const userRef = db.collection('users').doc(uid);

  const batch = db.batch();

  batch.set(farmerRef, {
    farmerId,
    uid,
    name,
    phoneNumber: context.auth.token.phone_number || '',
    state,
    district,
    village,
    pincode,
    farmSizeAcres: Number(farmSizeAcres) || 0,
    cropsGrown: Array.isArray(cropsGrown) ? cropsGrown : [],
    isKycVerified: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  batch.update(userRef, {
    role: 'FARMER',
    farmerId,
    displayName: name,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();

  return { success: true, farmerId };
});
