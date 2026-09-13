import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import { useCollapsibleHeader } from '../../hooks/useCollapsibleHeader';
import { useTheme } from '../../context/ThemeContext';

/**
 * CollapsibleHeaderLayout
 * 
 * Reusable layout that automatically hides the header when scrolling down
 * and reveals it when scrolling up or when near the top of the scroll view.
 * 
 * Smooth 60/120 FPS hardware-accelerated transitions via Animated & useNativeDriver: true.
 * 
 * Usage:
 * <CollapsibleHeaderLayout
 *   header={<AppHeader title="My Title" ... />}
 * >
 *   <ScrollView contentContainerStyle={styles.scrollContent}>
 *     ...
 *   </ScrollView>
 * </CollapsibleHeaderLayout>
 */
export const CollapsibleHeaderLayout = ({
  header,
  children,
  style,
  headerHeight = 96,
  threshold = 8,
  minScrollOffset = 40,
}) => {
  const insets = useSafeAreaInsets();
  const { colors: themeColors } = useTheme();
  const {
    headerTranslateY,
    totalHeight,
    onHeaderLayout,
    onScroll,
  } = useCollapsibleHeader({
    initialHeight: headerHeight,
    insetsTop: insets.top,
    threshold,
    minScrollOffset,
  });

  // Clone child (ScrollView or FlatList) to attach onScroll and dynamic top padding
  let renderedChild = children;
  if (React.isValidElement(children)) {
    const existingContentStyle = StyleSheet.flatten(children.props.contentContainerStyle) || {};
    const existingPaddingTop = existingContentStyle.paddingTop ?? existingContentStyle.padding ?? 12;
    const existingOnScroll = children.props.onScroll;

    const mergedContentStyle = [
      existingContentStyle,
      { paddingTop: totalHeight + existingPaddingTop },
    ];

    let refreshControl = children.props.refreshControl;
    if (React.isValidElement(refreshControl)) {
      refreshControl = React.cloneElement(refreshControl, {
        progressViewOffset: totalHeight,
      });
    }

    const handleScroll = (e) => {
      if (typeof existingOnScroll === 'function') {
        existingOnScroll(e);
      }
      onScroll(e);
    };

    renderedChild = React.cloneElement(children, {
      onScroll: handleScroll,
      scrollEventThrottle: 16,
      contentContainerStyle: mergedContentStyle,
      refreshControl,
    });
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }, style]}>
      <Animated.View
        onLayout={onHeaderLayout}
        style={[
          styles.headerWrapper,
          {
            paddingTop: insets.top,
            backgroundColor: themeColors.surface,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        {header}
      </Animated.View>
      {renderedChild}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',
    overflow: 'hidden',
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 6,
    backgroundColor: colors.surface,
  },
});

export default CollapsibleHeaderLayout;
