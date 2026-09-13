import React, { useRef, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { calculateDijkstraDeliveryRoute } from '../../services/dijkstraRoutingService';

export const OSMMapView = ({
  pickupLocation = { latitude: 20.3245, longitude: 85.8189, name: 'Ramesh Farm, Chandrasekharpur' },
  destinationLocation = { latitude: 20.2612, longitude: 85.8331, name: 'Customer Location, Unit-1' },
  driverLocation = { latitude: 20.2928, longitude: 85.8260 },
  routeInfo = { duration: '14 min', distance: '8.9 km', fuelSaved: '₹34 fuel saved' },
  height = 680,
  style,
  onRecenter,
}) => {
  const webViewRef = useRef(null);
  const fullScreenWebViewRef = useRef(null);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isDriver3D, setIsDriver3D] = useState(false);
  const [isFastPreview, setIsFastPreview] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const windowHeight = Dimensions.get('window').height;
  const activeInlineHeight = isExpanded ? Math.max(760, Math.round(windowHeight * 0.88)) : height;

  const pickupLat = pickupLocation?.latitude || 20.3245;
  const pickupLng = pickupLocation?.longitude || 85.8189;
  const destLat = destinationLocation?.latitude || 20.2612;
  const destLng = destinationLocation?.longitude || 85.8331;

  const dijkstraRoute = useMemo(() => {
    return calculateDijkstraDeliveryRoute(
      { latitude: pickupLat, longitude: pickupLng },
      { latitude: destLat, longitude: destLng }
    );
  }, [pickupLat, pickupLng, destLat, destLng]);

  const roadCoordinates = dijkstraRoute?.polyline || [
    [pickupLat, pickupLng],
    [(pickupLat + destLat) / 2, (pickupLng + destLng) / 2],
    [destLat, destLng],
  ];

  const roadSteps = dijkstraRoute?.roadSteps || [];
  const roadViaNames =
    roadSteps
      .slice(0, 2)
      .map((s) => s.road)
      .filter(Boolean)
      .join(' & ') || 'Sachivalaya Marg & Nandankanan Rd';

  const getLeafletHTML = (isInitial3D = false) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { box-sizing: border-box; }
          html, body {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: #e6f4ea;
            -webkit-user-select: none;
            user-select: none;
          }
          #map-viewport {
            height: 100%;
            width: 100%;
            position: relative;
            overflow: hidden;
            perspective: 800px;
            perspective-origin: 50% 80%;
            background: #e6f4ea;
          }
          #map {
            height: 100%;
            width: 100%;
            position: absolute;
            top: 0;
            left: 0;
            transform-origin: 50% 76%;
            background: #e6f4ea !important;
            will-change: transform;
          }
          .leaflet-container {
            background: #e6f4ea !important;
            outline: 0;
          }
          .leaflet-tile {
            filter: saturate(1.1) brightness(1.01);
            image-rendering: -webkit-optimize-contrast;
            transition: opacity 0.2s linear;
          }
          .leaflet-control-attribution { display: none !important; }
          body.navigation-3d #map {
            width: 250% !important;
            height: 250% !important;
            left: -75% !important;
            top: -75% !important;
            transform-origin: 50% 76% !important;
          }
          .constant-pin-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            pointer-events: auto;
            transform-origin: center bottom;
            transition: transform 0.15s ease-out;
          }
          .pin-bubble {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            border: 2.5px solid #ffffff;
            font-size: 17px;
          }
          .pickup-bubble { background: #006738; }
          .dest-bubble { background: #ba1a1a; }
          .pin-tag {
            background: rgba(15, 23, 42, 0.92);
            color: #ffffff;
            font-size: 9.5px;
            font-weight: 800;
            padding: 2px 7px;
            border-radius: 5px;
            margin-top: 3px;
            white-space: nowrap;
            border: 1px solid rgba(255,255,255,0.45);
            letter-spacing: 0.5px;
          }
          .vehicle-container {
            position: relative;
            width: 54px;
            height: 54px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .headlight-cone {
            position: absolute;
            top: -38px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 20px solid transparent;
            border-right: 20px solid transparent;
            border-top: 42px solid rgba(16, 185, 129, 0.4);
            filter: blur(2px);
            pointer-events: none;
          }
          .vehicle-glow-ring {
            position: absolute;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: rgba(16, 185, 129, 0.45);
            animation: pulseGlow 1.8s infinite ease-out;
          }
          .vehicle-inner-circle {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: #ffffff;
            border: 2.5px solid #006738;
            box-shadow: 0 4px 14px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            transition: transform 0.08s linear;
          }
          .vehicle-emoji { font-size: 21px; line-height: 1; }
          .vehicle-live-badge {
            position: absolute;
            bottom: -7px;
            background: #006738;
            color: #ffffff;
            font-size: 8px;
            font-weight: 900;
            padding: 1px 5px;
            border-radius: 4px;
            border: 1px solid #ffffff;
            white-space: nowrap;
            letter-spacing: 0.5px;
          }
          @keyframes pulseGlow {
            0% { transform: scale(0.85); opacity: 0.95; }
            70% { transform: scale(1.45); opacity: 0.15; }
            100% { transform: scale(1.65); opacity: 0; }
          }
        </style>
      </head>
      <body class="${isInitial3D ? 'navigation-3d' : ''}">
        <div id="map-viewport"><div id="map"></div></div>
        <script>
          var roadPath = ${JSON.stringify(roadCoordinates)};
          var pickupCoord = [${pickupLat}, ${pickupLng}];
          var destCoord = [${destLat}, ${destLng}];
          var isDriverPerspective = ${isInitial3D ? 'true' : 'false'};
          var isCameraFollow = ${isInitial3D ? 'true' : 'false'};
          var cameraBearing = 0;
          var mapEl = document.getElementById('map');

          var map = L.map('map', {
            zoomControl: false,
            attributionControl: false,
            touchZoom: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
            dragging: true,
            tap: true,
            zoomDelta: 0.5,
            zoomSnap: 0.25,
            minZoom: 8,
            maxZoom: 20
          }).setView(pickupCoord, isDriverPerspective ? 18 : 14.5);

          // 100% Free OpenStreetMap public tiles - NO API KEY REQUIRED, NO WATERMARKS
          var tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            minZoom: 8,
            subdomains: ['a', 'b', 'c'],
            keepBuffer: 8,
            updateWhenIdle: false,
            updateWhenZooming: true
          }).addTo(map);

          var pickupIcon = L.divIcon({
            className: 'constant-pickup-div',
            html: '<div class="constant-pin-wrapper"><div class="pin-bubble pickup-bubble">🌱</div><div class="pin-tag">PICKUP</div></div>',
            iconSize: [44, 54],
            iconAnchor: [22, 50]
          });
          L.marker(pickupCoord, { icon: pickupIcon, zIndexOffset: 1000 }).addTo(map);

          var destIcon = L.divIcon({
            className: 'constant-dest-div',
            html: '<div class="constant-pin-wrapper"><div class="pin-bubble dest-bubble">📍</div><div class="pin-tag">CUSTOMER</div></div>',
            iconSize: [44, 54],
            iconAnchor: [22, 50]
          });
          L.marker(destCoord, { icon: destIcon, zIndexOffset: 1000 }).addTo(map);

          // Road polyline with bold casing and glowing dashes
          var roadCasing = L.polyline(roadPath, { color: '#00210d', weight: 8, opacity: 0.35, lineCap: 'round', lineJoin: 'round' }).addTo(map);
          var roadLine = L.polyline(roadPath, { color: '#006738', weight: 5, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }).addTo(map);
          var roadDashes = L.polyline(roadPath, { color: '#ffffff', weight: 2, dashArray: '7, 10', opacity: 0.85, lineCap: 'round' }).addTo(map);
          var traveledPath = L.polyline([], { color: '#059669', weight: 6, opacity: 0.95, lineCap: 'round' }).addTo(map);

          // Fit route bounds nicely with top padding so route card does not overlap
          function fitRouteView() {
            if (!map || !roadLine) return;
            map.invalidateSize({ animate: false });
            if (!isDriverPerspective) {
              map.fitBounds(roadLine.getBounds(), {
                paddingTopLeft: [75, 25],
                paddingBottomRight: [35, 25],
                maxZoom: 15.5
              });
            }
          }

          fitRouteView();
          setTimeout(fitRouteView, 80);
          setTimeout(fitRouteView, 250);
          setTimeout(fitRouteView, 600);

          var vehicleIcon = L.divIcon({
            className: 'moving-vehicle-div',
            html: '<div class="vehicle-container">' +
                    '<div class="vehicle-glow-ring"></div>' +
                    '<div id="vehicle-rotator" class="vehicle-inner-circle">' +
                      '<div class="headlight-cone"></div>' +
                      '<span class="vehicle-emoji">🚚</span>' +
                    '</div>' +
                    '<div class="vehicle-live-badge">GPS LIVE</div>' +
                  '</div>',
            iconSize: [54, 54],
            iconAnchor: [27, 27]
          });
          var vehicleMarker = L.marker(roadPath[0], { icon: vehicleIcon, zIndexOffset: 2500 }).addTo(map);

          function getDist(p1, p2) {
            var dx = (p2[1] - p1[1]) * Math.cos((p1[0] + p2[0]) * Math.PI / 360);
            var dy = p2[0] - p1[0];
            return Math.sqrt(dx * dx + dy * dy);
          }

          function getBearing(p1, p2) {
            var lat1 = p1[0] * Math.PI / 180;
            var lat2 = p2[0] * Math.PI / 180;
            var dLon = (p2[1] - p1[1]) * Math.PI / 180;
            var y = Math.sin(dLon) * Math.cos(lat2);
            var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
            var b = Math.atan2(y, x) * 180 / Math.PI;
            return (b + 360) % 360;
          }

          var segmentLengths = [];
          var totalRouteDist = 0;
          function calculateLengths() {
            segmentLengths = [];
            totalRouteDist = 0;
            for (var i = 0; i < roadPath.length - 1; i++) {
              var segD = getDist(roadPath[i], roadPath[i + 1]);
              segmentLengths.push(segD);
              totalRouteDist += segD;
            }
          }
          calculateLengths();

          var animDuration = 840000; // 14 minutes realistic timing
          var pauseAtEnd = 6000;
          var cycleDuration = animDuration + pauseAtEnd;
          var animStartTime = null;

          function animateVehicle(timestamp) {
            if (!animStartTime) animStartTime = timestamp;
            var elapsed = (timestamp - animStartTime) % cycleDuration;
            var progressRatio = elapsed <= animDuration ? elapsed / animDuration : 1.0;
            var targetDist = progressRatio * totalRouteDist;
            var accumulated = 0;
            var currentPos = roadPath[0];
            var currentBearing = 0;
            var pathTraveled = [roadPath[0]];

            for (var j = 0; j < segmentLengths.length; j++) {
              var segLen = segmentLengths[j];
              if (accumulated + segLen >= targetDist || j === segmentLengths.length - 1) {
                var segProgress = segLen > 0 ? (targetDist - accumulated) / segLen : 1;
                segProgress = Math.max(0, Math.min(1, segProgress));
                var pA = roadPath[j];
                var pB = roadPath[j + 1];
                currentPos = [
                  pA[0] + (pB[0] - pA[0]) * segProgress,
                  pA[1] + (pB[1] - pA[1]) * segProgress
                ];
                currentBearing = getBearing(pA, pB);
                pathTraveled.push(currentPos);
                break;
              } else {
                accumulated += segLen;
                pathTraveled.push(roadPath[j + 1]);
              }
            }

            vehicleMarker.setLatLng(currentPos);
            traveledPath.setLatLngs(pathTraveled);

            // In map coordinates, rotate truck and headlights towards road direction
            // 🚚 emoji faces Left (270°) by default, so +90° points North (0°)
            var rotator = document.getElementById('vehicle-rotator');
            if (rotator) {
              rotator.style.transform = 'rotate(' + ((currentBearing + 90) % 360) + 'deg)';
            }

            // 3D Driver Perspective:
            // Camera sits behind the vehicle looking forward
            // The vehicle sits in front of the viewer near the bottom of the screen
            // The oncoming road and upcoming turns extend far ahead into the horizon
            if (isDriverPerspective && mapEl) {
              var diff = (currentBearing - cameraBearing + 540) % 360 - 180;
              cameraBearing = (cameraBearing + diff * 0.12 + 360) % 360;

              mapEl.style.transform = 'rotateX(56deg) rotateZ(' + (-cameraBearing) + 'deg) scale(1.55)';

              // Counter-rotate markers so they remain upright facing the driver
              var pins = document.querySelectorAll('.constant-pin-wrapper');
              for (var p = 0; p < pins.length; p++) {
                pins[p].style.transform = 'rotateZ(' + cameraBearing + 'deg) rotateX(-56deg)';
              }
            } else if (mapEl) {
              mapEl.style.transform = 'none';
              var pins = document.querySelectorAll('.constant-pin-wrapper');
              for (var p = 0; p < pins.length; p++) {
                pins[p].style.transform = 'none';
              }
            }

            if (isCameraFollow) {
              if (isDriverPerspective) {
                // LOOK-AHEAD CAMERA OFFSET:
                // We focus the camera 180 meters ahead of the vehicle along its heading.
                // This keeps the vehicle located at the bottom-center of the screen (~76% down),
                // so 76% of the screen ahead shows upcoming turns, curves, and junctions!
                var lookAheadKm = 0.18; // 180 meters look-ahead
                var rad = currentBearing * Math.PI / 180;
                var dLat = (lookAheadKm / 111.32) * Math.cos(rad);
                var dLng = (lookAheadKm / (111.32 * Math.cos(currentPos[0] * Math.PI / 180))) * Math.sin(rad);
                var cameraFocus = [currentPos[0] + dLat, currentPos[1] + dLng];
                map.panTo(cameraFocus, { animate: false, duration: 0 });
              } else {
                map.panTo(currentPos, { animate: false, duration: 0 });
              }
            }

            requestAnimationFrame(animateVehicle);
          }
          requestAnimationFrame(animateVehicle);

          map.on('dragstart', function() { isCameraFollow = false; });

          window.recenterMap = function() {
            isCameraFollow = false;
            if (isDriverPerspective) {
              window.setDriverPerspective(false);
            } else {
              fitRouteView();
            }
          };

          window.focusVehicle = function() {
            isCameraFollow = true;
            var currentPos = vehicleMarker.getLatLng();
            if (isDriverPerspective) {
              var lookAheadKm = 0.18;
              var rad = cameraBearing * Math.PI / 180;
              var dLat = (lookAheadKm / 111.32) * Math.cos(rad);
              var dLng = (lookAheadKm / (111.32 * Math.cos(currentPos.lat * Math.PI / 180))) * Math.sin(rad);
              map.setView([currentPos.lat + dLat, currentPos.lng + dLng], 18, { animate: true });
            } else {
              map.setView(currentPos, 16, { animate: true });
            }
          };

          window.zoomIn = function() { map.zoomIn(1); };
          window.zoomOut = function() { map.zoomOut(1); };

          window.toggleSpeed = function(isFast) {
            animDuration = isFast ? 35000 : 840000;
            cycleDuration = animDuration + pauseAtEnd;
            animStartTime = null;
          };

          window.setDriverPerspective = function(enable) {
            isDriverPerspective = enable;
            isCameraFollow = enable;
            if (enable) {
              document.body.classList.add('navigation-3d');
              map.invalidateSize();
              var currentPos = vehicleMarker.getLatLng();
              var lookAheadKm = 0.18;
              var rad = cameraBearing * Math.PI / 180;
              var dLat = (lookAheadKm / 111.32) * Math.cos(rad);
              var dLng = (lookAheadKm / (111.32 * Math.cos(currentPos.lat * Math.PI / 180))) * Math.sin(rad);
              map.setView([currentPos.lat + dLat, currentPos.lng + dLng], 18, { animate: false });
            } else {
              document.body.classList.remove('navigation-3d');
              if (mapEl) mapEl.style.transform = 'none';
              var pins = document.querySelectorAll('.constant-pin-wrapper');
              for (var p = 0; p < pins.length; p++) {
                pins[p].style.transform = 'none';
              }
              fitRouteView();
            }
          };
        </script>
      </body>
    </html>
  `;

  // HTML is generated once per route and does NOT reload on button state changes
  const inlineLeafletHTML = useMemo(
    () => getLeafletHTML(false),
    [pickupLat, pickupLng, destLat, destLng]
  );
  const fullScreenLeafletHTML = useMemo(
    () => getLeafletHTML(true),
    [pickupLat, pickupLng, destLat, destLng]
  );

  const handleRecenter = () => {
    if (webViewRef.current) webViewRef.current.injectJavaScript('if(window.recenterMap) { window.recenterMap(); } true;');
    if (onRecenter) onRecenter();
  };
  const handleFocusVehicle = () => {
    if (webViewRef.current) webViewRef.current.injectJavaScript('if(window.focusVehicle) { window.focusVehicle(); } true;');
  };
  const handleZoomIn = () => {
    if (webViewRef.current) webViewRef.current.injectJavaScript('if(window.zoomIn) { window.zoomIn(); } true;');
  };
  const handleZoomOut = () => {
    if (webViewRef.current) webViewRef.current.injectJavaScript('if(window.zoomOut) { window.zoomOut(); } true;');
  };
  const handleToggleDriverPerspective = () => {
    setIsDriver3D((prev) => {
      const next = !prev;
      if (webViewRef.current) webViewRef.current.injectJavaScript(`if(window.setDriverPerspective) { window.setDriverPerspective(${next}); } true;`);
      return next;
    });
  };

  const handleOpenFullScreen = () => {
    setIsFullScreen(true);
    setIsDriver3D(true);
  };
  const handleCloseFullScreen = () => setIsFullScreen(false);

  const handleFullScreenZoomIn = () => {
    if (fullScreenWebViewRef.current) fullScreenWebViewRef.current.injectJavaScript('if(window.zoomIn) { window.zoomIn(); } true;');
  };
  const handleFullScreenZoomOut = () => {
    if (fullScreenWebViewRef.current) fullScreenWebViewRef.current.injectJavaScript('if(window.zoomOut) { window.zoomOut(); } true;');
  };
  const handleFullScreenFocusVehicle = () => {
    if (fullScreenWebViewRef.current) fullScreenWebViewRef.current.injectJavaScript('if(window.focusVehicle) { window.focusVehicle(); } true;');
  };
  const handleFullScreenRecenter = () => {
    if (fullScreenWebViewRef.current) fullScreenWebViewRef.current.injectJavaScript('if(window.recenterMap) { window.recenterMap(); } true;');
  };
  const handleFullScreenToggleSpeed = () => {
    setIsFastPreview((prev) => {
      const next = !prev;
      if (fullScreenWebViewRef.current) fullScreenWebViewRef.current.injectJavaScript(`if(window.toggleSpeed) { window.toggleSpeed(${next}); } true;`);
      return next;
    });
  };
  const handleFullScreenToggleDriver3D = () => {
    setIsDriver3D((prev) => {
      const next = !prev;
      if (fullScreenWebViewRef.current) fullScreenWebViewRef.current.injectJavaScript(`if(window.setDriverPerspective) { window.setDriverPerspective(${next}); } true;`);
      return next;
    });
  };

  return (
    <View style={[styles.container, { height: activeInlineHeight }, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: inlineLeafletHTML }}
        style={styles.mapWebView}
        scrollEnabled={false}
        nestedScrollEnabled={true}
        androidLayerType="hardware"
        domStorageEnabled={true}
        javaScriptEnabled={true}
        cacheEnabled={true}
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        allowsInlineMediaPlayback={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Computing Dijkstra Road Route...</Text>
          </View>
        )}
      />

      {/* Top Route Overview Card */}
      <View style={styles.aiRouteCard}>
        <View style={styles.aiTopRow}>
          <View style={styles.aiBadgeRow}>
            <MaterialCommunityIcons name="routes" size={17} color={colors.primary} />
            <Text style={styles.aiTitle}>Dijkstra Optimal Route</Text>
          </View>
          <View style={styles.fuelSavedChip}>
            <Text style={styles.fuelSavedText}>₹34 saved</Text>
          </View>
        </View>
        <View style={styles.aiBottomRow}>
          <View style={styles.etaRow}>
            <Text style={styles.etaText}>{dijkstraRoute?.durationMinutes || 14} min</Text>
            <Text style={styles.distText}>({dijkstraRoute?.distanceKm || 8.9} km)</Text>
          </View>
          <Text style={styles.roadViaText} numberOfLines={1}>{roadViaNames}</Text>
        </View>
      </View>

      {/* Perfectly Sized Map Control Stack */}
      <View style={styles.mapControlsColumn}>
        {/* Fullscreen Trigger Pill Button */}
        <TouchableOpacity
          style={styles.fullScreenTriggerBtn}
          onPress={handleOpenFullScreen}
          activeOpacity={0.8}
          accessibilityLabel="Open Full Screen Navigation"
        >
          <MaterialIcons name="open-in-full" size={18} color="#ffffff" />
          <Text style={styles.fullScreenTriggerText}>FULL SCREEN</Text>
        </TouchableOpacity>

        {/* 3D Driver Chase Cam Toggle Button (44x44) */}
        <TouchableOpacity
          style={[styles.controlBtn, isDriver3D && styles.controlBtnActive]}
          onPress={handleToggleDriverPerspective}
          activeOpacity={0.8}
          accessibilityLabel="Toggle 3D Driver View"
        >
          <MaterialCommunityIcons
            name={isDriver3D ? "video-3d" : "video-2d"}
            size={24}
            color={isDriver3D ? colors.primary : colors.textPrimary}
          />
        </TouchableOpacity>

        {/* Zoom In / Zoom Out Group (44w x 86h) */}
        <View style={styles.zoomButtonGroup}>
          <TouchableOpacity style={styles.zoomSubBtn} onPress={handleZoomIn} activeOpacity={0.7} accessibilityLabel="Zoom In">
            <MaterialIcons name="add" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity style={styles.zoomSubBtn} onPress={handleZoomOut} activeOpacity={0.7} accessibilityLabel="Zoom Out">
            <MaterialIcons name="remove" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Vehicle Focus Button (44x44) */}
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={handleFocusVehicle}
          activeOpacity={0.8}
          accessibilityLabel="Focus Vehicle"
        >
          <MaterialCommunityIcons name="truck-delivery" size={22} color={colors.primary} />
        </TouchableOpacity>

        {/* Recenter Full Route (44x44) */}
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={handleRecenter}
          activeOpacity={0.8}
          accessibilityLabel="Recenter Route"
        >
          <MaterialIcons name="crop-free" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Full Screen Driver 3D Navigation Modal */}
      <Modal
        visible={isFullScreen}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={handleCloseFullScreen}
      >
        <View style={styles.fullScreenContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={true} />

          <WebView
            ref={fullScreenWebViewRef}
            originWhitelist={['*']}
            source={{ html: fullScreenLeafletHTML }}
            style={styles.fullScreenWebView}
            scrollEnabled={false}
            nestedScrollEnabled={true}
            androidLayerType="hardware"
            domStorageEnabled={true}
            javaScriptEnabled={true}
            cacheEnabled={true}
            cacheMode="LOAD_CACHE_ELSE_NETWORK"
            allowsInlineMediaPlayback={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
          />

          {/* Top Turn-by-Turn HUD */}
          <SafeAreaView style={styles.fsTopSafeArea}>
            <View style={styles.fsTopNavHud}>
              <TouchableOpacity
                style={styles.fsCloseNavBtn}
                onPress={handleCloseFullScreen}
                accessibilityLabel="Back to delivery card"
              >
                <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
              </TouchableOpacity>
              <View style={styles.fsTurnDetails}>
                <View style={styles.fsTurnRow}>
                  <MaterialCommunityIcons name="arrow-up-bold" size={26} color="#ffffff" />
                  <Text style={styles.fsNextRoadText} numberOfLines={1}>{roadViaNames}</Text>
                </View>
                <Text style={styles.fsTargetMandiText}>{destinationLocation?.name || 'Customer Location, Unit-1'}</Text>
              </View>
              <View style={styles.fs3dBadgePill}>
                <View style={styles.pulseLiveDot} />
                <Text style={styles.fs3dBadgeText}>3D CHASE</Text>
              </View>
            </View>
          </SafeAreaView>

          {/* Full Screen Controls Stack (All 44x44) */}
          <View style={styles.fsControlsColumn}>
            {/* 3D Chase Camera Toggle */}
            <TouchableOpacity
              style={[styles.controlBtn, isDriver3D && styles.controlBtnActive]}
              onPress={handleFullScreenToggleDriver3D}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={isDriver3D ? "video-3d" : "video-2d"}
                size={24}
                color={isDriver3D ? colors.primary : colors.textPrimary}
              />
            </TouchableOpacity>

            {/* Zoom In/Out (44w x 86h) */}
            <View style={styles.zoomButtonGroup}>
              <TouchableOpacity style={styles.zoomSubBtn} onPress={handleFullScreenZoomIn} activeOpacity={0.7}>
                <MaterialIcons name="add" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
              <View style={styles.zoomDivider} />
              <TouchableOpacity style={styles.zoomSubBtn} onPress={handleFullScreenZoomOut} activeOpacity={0.7}>
                <MaterialIcons name="remove" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Speed Toggle (1x vs 5x Fast Demo) */}
            <TouchableOpacity
              style={[styles.controlBtn, isFastPreview && styles.controlBtnActive]}
              onPress={handleFullScreenToggleSpeed}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={isFastPreview ? "flash" : "speedometer-slow"}
                size={22}
                color={isFastPreview ? '#ea580c' : colors.primary}
              />
            </TouchableOpacity>

            {/* Focus Vehicle (Chase Camera Lock) */}
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={handleFullScreenFocusVehicle}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="truck-delivery" size={22} color={colors.primary} />
            </TouchableOpacity>

            {/* Overview / Fit Route */}
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={handleFullScreenRecenter}
              activeOpacity={0.8}
            >
              <MaterialIcons name="crop-free" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Bottom Live Trip Summary Card */}
          <View style={styles.fsBottomSummaryCard}>
            <View style={styles.fsBottomLeft}>
              <View style={styles.fsEtaGroup}>
                <Text style={styles.fsEtaLarge}>{dijkstraRoute?.durationMinutes || 14} min</Text>
                <Text style={styles.fsDistSmall}>({dijkstraRoute?.distanceKm || 8.9} km)</Text>
              </View>
              <Text style={styles.fsSpeedIndicator}>Speed: 32 km/h • On Schedule</Text>
            </View>
            <TouchableOpacity
              style={styles.fsExitPillBtn}
              onPress={handleCloseFullScreen}
              activeOpacity={0.8}
            >
              <MaterialIcons name="fullscreen-exit" size={18} color="#ffffff" />
              <Text style={styles.fsExitPillText}>Exit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#e6f4ea',
  },
  mapWebView: {
    flex: 1,
    backgroundColor: '#e6f4ea',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  aiRouteCard: {
    position: 'absolute',
    top: 12,
    left: 14,
    right: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    zIndex: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  aiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  aiBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  aiTitle: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  fuelSavedChip: {
    backgroundColor: '#e6f4ea',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  fuelSavedText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  aiBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  etaText: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  distText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  roadViaText: {
    fontSize: 11,
    color: colors.textSecondary,
    maxWidth: '46%',
    textAlign: 'right',
    fontWeight: '500',
  },
  mapControlsColumn: {
    position: 'absolute',
    bottom: 16,
    right: 14,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 9,
    zIndex: 25,
  },
  fullScreenTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 19,
    gap: 5,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  fullScreenTriggerText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  controlBtnActive: {
    backgroundColor: '#e6f4ea',
    borderColor: colors.primary,
  },
  zoomButtonGroup: {
    width: 44,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  zoomSubBtn: {
    width: 44,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    width: '75%',
    alignSelf: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullScreenWebView: {
    flex: 1,
  },
  fsTopSafeArea: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 32 : 0,
    left: 0,
    right: 0,
    zIndex: 40,
  },
  fsTopNavHud: {
    marginHorizontal: 12,
    marginTop: 8,
    backgroundColor: '#004d28',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fsCloseNavBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fsTurnDetails: {
    flex: 1,
    marginLeft: 12,
  },
  fsTurnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fsNextRoadText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  fsTargetMandiText: {
    color: '#a7f3d0',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  fs3dBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    gap: 4,
  },
  pulseLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
  },
  fs3dBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  fsControlsColumn: {
    position: 'absolute',
    right: 14,
    top: Platform.OS === 'android' ? 125 : 140,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    zIndex: 35,
  },
  fsBottomSummaryCard: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 20,
    left: 14,
    right: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 40,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  fsBottomLeft: {
    flexDirection: 'column',
  },
  fsEtaGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  fsEtaLarge: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  fsDistSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  fsSpeedIndicator: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
  },
  fsExitPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ba1a1a',
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 21,
    gap: 6,
    elevation: 3,
    shadowColor: '#ba1a1a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fsExitPillText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
});

export default OSMMapView;
