import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from './routes';
import { useAuth } from '../context/AuthContext';

// Navigators
import { MainTabNavigator } from './MainTabNavigator';

// Intro Animation
import { IntroAnimationScreen } from '../screens/intro/IntroAnimationScreen';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Delivery Flow Screens
import { DeliveryDetailsScreen } from '../screens/deliveries/DeliveryDetailsScreen';
import { ActiveRouteScreen } from '../screens/deliveries/ActiveRouteScreen';
import { PODScreen } from '../screens/deliveries/PODScreen';
import { DeliveryExceptionScreen } from '../screens/deliveries/DeliveryExceptionScreen';

// Other Nested Screens
import { PayoutHistoryScreen } from '../screens/earnings/PayoutHistoryScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { SupportScreen } from '../screens/support/SupportScreen';
import { LegalPoliciesScreen } from '../screens/legal/LegalPoliciesScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { isAuthenticated } = useAuth();
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {!isAuthenticated ? (
        // Intro + Auth Stack
        <Stack.Group>
          {!hasSeenIntro && (
            <Stack.Screen
              name={ROUTES.INTRO_ANIMATION}
              options={{ animation: 'fade' }}
            >
              {(props) => (
                <IntroAnimationScreen
                  {...props}
                  onComplete={() => setHasSeenIntro(true)}
                />
              )}
            </Stack.Screen>
          )}
          <Stack.Screen
            name={ROUTES.LOGIN}
            component={LoginScreen}
            options={{ animation: 'fade' }}
          />
          <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
        </Stack.Group>
      ) : (
        // Main Authenticated App Stack
        <Stack.Group>
          {/* Bottom Tabs with Home, Deliveries, Earnings, Ranking, Profile */}
          <Stack.Screen name={ROUTES.MAIN_TABS} component={MainTabNavigator} />

          {/* Connected Delivery Workflow Screens */}
          <Stack.Screen name={ROUTES.DELIVERY_DETAILS} component={DeliveryDetailsScreen} />
          <Stack.Screen name={ROUTES.ACTIVE_ROUTE} component={ActiveRouteScreen} />
          <Stack.Screen name={ROUTES.POD} component={PODScreen} />
          <Stack.Screen name={ROUTES.DELIVERY_EXCEPTION} component={DeliveryExceptionScreen} />

          {/* Secondary Stack Screens */}
          <Stack.Screen name={ROUTES.PAYOUT_HISTORY} component={PayoutHistoryScreen} />
          <Stack.Screen name={ROUTES.NOTIFICATIONS} component={NotificationsScreen} />
          <Stack.Screen name={ROUTES.SUPPORT} component={SupportScreen} />
          <Stack.Screen name={ROUTES.LEGAL_POLICIES} component={LegalPoliciesScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};
