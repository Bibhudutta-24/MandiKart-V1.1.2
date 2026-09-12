/**
 * MandiKart Authoritative Central Cloud Functions
 * Single Source of Truth for sensitive business logic, transactions, and event triggers.
 */
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

// Modules will be exported here as they are developed
export * from './auth';
export * from './farmers';
export * from './buyers';
export * from './fpos';
export * from './products';
export * from './orders';
export * from './logistics';
export * from './deliveries';
export * from './payments';
export * from './notifications';
export * from './admin';
