import { useState, useRef, useCallback, useMemo } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Custom hook for collapsible header on scroll.
 * 
 * - When user scrolls down, header smoothly hides (slides up offscreen).
 * - When user scrolls up, header smoothly shows (slides down into view).
 * - When user is near the top (scrollY <= 15), header is always visible.
 * 
 * Uses React Native's native driver for 60/120 FPS hardware accelerated animation.
 */
export const useCollapsibleHeader = ({
  initialHeight = 96,
  insetsTop = 0,
  threshold = 8,
  minScrollOffset = 40,
} = {}) => {
  const initialTotal = initialHeight + insetsTop;
  const [totalHeight, setTotalHeight] = useState(initialTotal);
  const animValue = useRef(new Animated.Value(0)).current; // 0 = visible, 1 = hidden
  const lastScrollY = useRef(0);
  const isHidden = useRef(false);

  const showHeader = useCallback(() => {
    if (!isHidden.current) return;
    isHidden.current = false;
    Animated.timing(animValue, {
      toValue: 0,
      duration: 220,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [animValue]);

  const hideHeader = useCallback(() => {
    if (isHidden.current) return;
    isHidden.current = true;
    Animated.timing(animValue, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [animValue]);

  const onScroll = useCallback(
    (event) => {
      const currentY = event.nativeEvent.contentOffset.y;
      const diff = currentY - lastScrollY.current;

      // When near the top, always show header
      if (currentY <= 15) {
        showHeader();
      } else if (diff > threshold && currentY > minScrollOffset) {
        // Scrolling down -> hide header
        hideHeader();
      } else if (diff < -threshold) {
        // Scrolling up -> show header
        showHeader();
      }

      lastScrollY.current = currentY;
    },
    [showHeader, hideHeader, threshold, minScrollOffset]
  );

  const headerTranslateY = useMemo(
    () =>
      animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -totalHeight],
      }),
    [animValue, totalHeight]
  );

  const onHeaderLayout = useCallback(
    (e) => {
      const h = e.nativeEvent.layout.height;
      if (h && Math.abs(h - totalHeight) > 2) {
        setTotalHeight(h);
      }
    },
    [totalHeight]
  );

  return {
    onScroll,
    headerTranslateY,
    totalHeight,
    contentPaddingTop: totalHeight + 10,
    onHeaderLayout,
    showHeader,
    hideHeader,
    scrollProps: {
      onScroll,
      scrollEventThrottle: 16,
    },
  };
};

export default useCollapsibleHeader;
