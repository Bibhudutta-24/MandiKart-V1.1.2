/**
 * Utility Formatting Functions
 */

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

export const formatDistance = (km) => {
  if (km === undefined || km === null) return '0 km';
  return `${Number(km).toFixed(1)} km`;
};

export const formatWeight = (kg) => {
  if (!kg) return '0 kg';
  return `${kg} kg`;
};

export const formatTimeMinutes = (mins) => {
  if (!mins) return '0 min';
  return `${mins} min`;
};

export const formatShortDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  const now = new Date();
  const past = new Date(timestamp);
  const diffSecs = Math.floor((now - past) / 1000);
  if (diffSecs < 60) return 'Just now';
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

/**
 * Dynamic Greeting based on current time:
 * - 05:00 - 11:59: Good Morning
 * - 12:00 - 12:59: Good Noon
 * - 13:00 - 16:59: Good Afternoon
 * - 17:00 - 21:59: Good Evening
 * - 22:00 - 04:59: Good Night
 */
export const getTimeGreeting = (date = new Date()) => {
  const hours = date.getHours();
  if (hours >= 5 && hours < 12) {
    return 'Good Morning';
  } else if (hours === 12) {
    return 'Good Noon';
  } else if (hours >= 13 && hours < 17) {
    return 'Good Afternoon';
  } else if (hours >= 17 && hours < 22) {
    return 'Good Evening';
  } else {
    return 'Good Night';
  }
};

