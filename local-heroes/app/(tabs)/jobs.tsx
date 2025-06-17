import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { Task, TaskFilters, TasksResponse } from '../types/task';

const { width, height } = Dimensions.get('window');

// Dutch cities with approximate coordinates
const DUTCH_CITIES_COORDS: Record<string, { latitude: number; longitude: number }> = {
  Amsterdam: { latitude: 52.3676, longitude: 4.9041 },
  Rotterdam: { latitude: 51.9225, longitude: 4.47917 },
  'The Hague': { latitude: 52.0705, longitude: 4.3007 },
  Utrecht: { latitude: 52.0907, longitude: 5.1214 },
  Eindhoven: { latitude: 51.4416, longitude: 5.4697 },
  Groningen: { latitude: 53.2194, longitude: 6.5665 },
  Tilburg: { latitude: 51.5555, longitude: 5.0913 },
  Almere: { latitude: 52.3508, longitude: 5.2647 },
  Breda: { latitude: 51.5719, longitude: 4.7683 },
  Nijmegen: { latitude: 51.8426, longitude: 5.8518 },
  Enschede: { latitude: 52.2215, longitude: 6.8937 },
};

interface JobMarker extends Task {
  coordinate: {
    latitude: number;
    longitude: number;
  };
}

// Custom Checkbox component
const CustomCheckbox = ({
  checked,
  onPress,
  label,
  count,
}: {
  checked: boolean;
  onPress: () => void;
  label: string;
  count: number;
}) => {
  return (
    <View style={styles.checkboxRow}>
      <TouchableOpacity onPress={onPress} style={styles.checkboxContainer}>
        <View style={[styles.checkboxBase, checked && styles.checkboxChecked]}>
          {checked && <Ionicons name="checkmark" size={14} color="white" />}
        </View>
      </TouchableOpacity>
      <Text style={styles.checkboxLabel}>{label}</Text>
      <Text style={styles.countBadge}>{count}</Text>
    </View>
  );
};

export default function JobsScreen() {
  // View mode state
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Existing states
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [showCities, setShowCities] = useState(false);
  const [paymentRange, setPaymentRange] = useState([0, 999]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [selectedDatePosted, setSelectedDatePosted] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [scrollPosition, setScrollPosition] = useState(0); // Backend integration state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter counts state
  const [filterCounts, setFilterCounts] = useState({
    categories: {} as Record<string, number>,
    experienceLevels: {} as Record<string, number>,
    datePosted: {} as Record<string, number>,
  });
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  // Map-related states and refs
  const [jobsWithCoordinates, setJobsWithCoordinates] = useState<JobMarker[]>([]);
  const webViewRef = useRef<WebView>(null);

  // Dutch cities list
  const dutchCities = [
    'Amsterdam',
    'Rotterdam',
    'The Hague',
    'Utrecht',
    'Eindhoven',
    'Groningen',
    'Tilburg',
    'Almere',
    'Breda',
    'Nijmegen',
    'Enschede',
  ];
  // Dynamic filter arrays based on loaded counts
  const categories = [
    { name: 'Gardening', count: filterCounts.categories['Gardening'] || 0 },
    { name: 'Cleaning', count: filterCounts.categories['Cleaning'] || 0 },
    { name: 'Moving', count: filterCounts.categories['Moving'] || 0 },
    { name: 'Pet Care', count: filterCounts.categories['Pet Care'] || 0 },
    { name: 'Electrical', count: filterCounts.categories['Electrical'] || 0 },
    { name: 'Assembly', count: filterCounts.categories['Assembly'] || 0 },
    { name: 'Technology', count: filterCounts.categories['Technology'] || 0 },
    { name: 'Shopping', count: filterCounts.categories['Shopping'] || 0 },
    { name: 'Painting', count: filterCounts.categories['Painting'] || 0 },
    { name: 'Plumbing', count: filterCounts.categories['Plumbing'] || 0 },
    { name: 'Events', count: filterCounts.categories['Events'] || 0 },
    { name: 'Repair', count: filterCounts.categories['Repair'] || 0 },
    { name: 'Education', count: filterCounts.categories['Education'] || 0 },
  ].filter((cat) => cat.count > 0); // Only show categories with jobs
  const experienceLevels = [
    { name: 'No experience', count: filterCounts.experienceLevels['No experience'] || 0 },
    { name: 'Beginner', count: filterCounts.experienceLevels['Beginner'] || 0 },
    { name: 'Intermediate', count: filterCounts.experienceLevels['Intermediate'] || 0 },
    { name: 'Expert', count: filterCounts.experienceLevels['Expert'] || 0 },
  ].filter((exp) => exp.count > 0); // Only show levels with jobs
  const datePostedOptions = [
    { name: 'All', count: filterCounts.datePosted['All'] || 0 },
    { name: 'Last 24 Hours', count: filterCounts.datePosted['Last 24 Hours'] || 0 },
    { name: 'Last 7 Days', count: filterCounts.datePosted['Last 7 Days'] || 0 },
    { name: 'Last 30 Days', count: filterCounts.datePosted['Last 30 Days'] || 0 },
  ];

  const tags = ['engineering', 'design', 'marketing', 'ui/ux', 'management', 'software', 'construction'];

  const toggleCategory = (category: string): void => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((item) => item !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const toggleExperience = (experience: string): void => {
    if (selectedExperience.includes(experience)) {
      setSelectedExperience(selectedExperience.filter((item) => item !== experience));
    } else {
      setSelectedExperience([...selectedExperience, experience]);
    }
  };

  const toggleDatePosted = (date: string): void => {
    if (selectedDatePosted.includes(date)) {
      setSelectedDatePosted(selectedDatePosted.filter((item) => item !== date));
    } else {
      setSelectedDatePosted([...selectedDatePosted, date]);
    }
  };
  const toggleTag = (tag: string): void => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((item) => item !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Map-related functions
  const getCoordinatesForLocation = (location: string): { latitude: number; longitude: number } => {
    // Check if it's one of our known Dutch cities
    if (DUTCH_CITIES_COORDS[location]) {
      return DUTCH_CITIES_COORDS[location];
    }

    // If not found, place it randomly around Netherlands
    const baseLatitude = 52.1326;
    const baseLongitude = 5.2913;
    const randomOffsetLat = (Math.random() - 0.5) * 2;
    const randomOffsetLng = (Math.random() - 0.5) * 2;

    return {
      latitude: baseLatitude + randomOffsetLat,
      longitude: baseLongitude + randomOffsetLng,
    };
  };

  const getMarkerColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'gardening':
        return '#2E8B57';
      case 'cleaning':
        return '#4169E1';
      case 'moving':
        return '#FF6347';
      case 'pet care':
        return '#9370DB';
      case 'electrical':
        return '#FFD700';
      case 'plumbing':
        return '#00CED1';
      case 'technology':
        return '#FF1493';
      default:
        return '#2A9D8F';
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'gardening':
        return '🌱';
      case 'cleaning':
        return '🧹';
      case 'moving':
        return '📦';
      case 'pet care':
        return '🐕';
      case 'electrical':
        return '⚡';
      case 'plumbing':
        return '🔧';
      case 'technology':
        return '💻';
      case 'assembly':
        return '🔨';
      case 'painting':
        return '🎨';
      case 'repair':
        return '🛠️';
      default:
        return '💼';
    }
  };

  const generateMapHTML = () => {
    const markersJS = jobsWithCoordinates.map((job) => ({
      id: job._id,
      lat: job.coordinate.latitude,
      lng: job.coordinate.longitude,
      title: job.title,
      location: job.location,
      price: job.price,
      category: job.category || 'General',
      color: getMarkerColor(job.category),
      icon: getCategoryIcon(job.category),
    }));

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        #map { height: 100vh; width: 100vw; }
        .leaflet-popup-content { margin: 8px 12px; line-height: 1.4; }
        .job-popup { min-width: 200px; }
        .job-title { font-size: 16px; font-weight: bold; color: #333; margin: 0 0 8px 0; }
        .job-detail { margin: 4px 0; color: #666; font-size: 14px; }
        .job-price { color: #2A9D8F; font-weight: bold; }
        .view-button { background: #2A9D8F; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-top: 8px; font-size: 14px; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        try {
          const map = L.map('map').setView([52.1326, 5.2913], 7);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);

          const markers = ${JSON.stringify(markersJS)};
          
          markers.forEach(marker => {
            const customIcon = L.divIcon({
              className: 'custom-marker',
              html: '<div style="background: white; border: 3px solid ' + marker.color + '; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">' + marker.icon + '</div>',
              iconSize: [40, 40],
              iconAnchor: [20, 20],
              popupAnchor: [0, -20]
            });

            L.marker([marker.lat, marker.lng], { icon: customIcon })
              .addTo(map)
              .bindPopup('<div class="job-popup"><h3 class="job-title">' + marker.title + '</h3><div class="job-detail">📍 ' + marker.location + '</div><div class="job-detail job-price">💰 €' + marker.price + '</div><div class="job-detail">🏷️ ' + marker.category + '</div><button class="view-button" onclick="viewJobDetails(\\'' + marker.id + '\\')">View Details</button></div>');
          });

          function viewJobDetails(jobId) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'viewJob', jobId: jobId }));
            }
          }

          function handleMessage(data) {
            if (data === 'refresh') {
              location.reload();
            } else if (data === 'recenter') {
              map.setView([52.1326, 5.2913], 7);
            }
          }

          document.addEventListener('message', function(event) { handleMessage(event.data); });
          window.addEventListener('message', function(event) { handleMessage(event.data); });
          window.viewJobDetails = viewJobDetails;
        } catch (error) {
          console.error('Map error:', error);
        }
      </script>
    </body>
    </html>
    `;
  };
  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('WebView message received:', message);
      if (message.type === 'viewJob') {
        console.log('Navigating to job ID:', message.jobId);
        router.push(`/jobs/${message.jobId}`);
      }
    } catch (error) {
      console.error('Failed to parse WebView message:', error);
    }
  };

  const focusOnNetherlands = () => {
    if (webViewRef.current) {
      webViewRef.current.postMessage('recenter');
    }
  };

  const refreshMap = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };
  // Clear all filters
  const clearAllFilters = () => {
    setSearchText('');
    setSelectedLocation('');
    setSelectedCategories([]);
    setSelectedExperience([]);
    setSelectedDatePosted([]);
    setSelectedTags([]);
    setPaymentRange([0, 999]);
  }; // Pull to refresh functionality
  const onRefresh = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      setRefreshing(true);
      await Promise.all([
        loadTasks(1, true),
        loadFilterCounts(), // Also refresh filter counts
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      if (isMountedRef.current) {
        setRefreshing(false);
      }
    }
  }, []);
  // Load tasks from backend
  const loadTasks = async (page: number = 1, resetResults: boolean = false) => {
    if (!isMountedRef.current) return;

    try {
      // Only show loading spinner if not refreshing
      if (!refreshing) {
        setLoading(true);
      }

      const filters: TaskFilters = {
        page,
        limit: 10,
      }; // Apply filters
      if (searchText.trim()) {
        filters.search = searchText.trim();
      }
      if (selectedLocation) {
        filters.location = selectedLocation;
      }
      if (selectedCategories.length > 0) {
        filters.category = selectedCategories[0]; // For simplicity, use first category
      }
      if (selectedExperience.length > 0) {
        filters.experienceLevel = selectedExperience[0]; // For simplicity, use first experience level
      }
      if (paymentRange[0] > 0) {
        filters.minPrice = paymentRange[0];
      }
      if (paymentRange[1] < 999) {
        filters.maxPrice = paymentRange[1];
      }
      if (selectedDatePosted.length > 0) {
        filters.datePosted = selectedDatePosted[0];
      }
      if (selectedTags.length > 0) {
        filters.tags = selectedTags;
      }

      const response: TasksResponse = await authService.getTasks(filters); // Check if component is still mounted before updating state
      if (!isMountedRef.current) return;

      if (resetResults || page === 1) {
        setTasks(response.tasks);
        // Also create jobs with coordinates for map view
        const jobMarkers: JobMarker[] = response.tasks
          .filter((job: Task) => job.location)
          .map((job: Task) => ({
            ...job,
            coordinate: getCoordinatesForLocation(job.location || ''),
          }));
        setJobsWithCoordinates(jobMarkers);
      } else {
        setTasks((prev) => [...prev, ...response.tasks]);
        // For pagination, append to existing map markers
        const newJobMarkers: JobMarker[] = response.tasks
          .filter((job: Task) => job.location)
          .map((job: Task) => ({
            ...job,
            coordinate: getCoordinatesForLocation(job.location || ''),
          }));
        setJobsWithCoordinates((prev) => [...prev, ...newJobMarkers]);
      }

      setTotalResults(response.total);
      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      console.error('Failed to load tasks:', error);
      if (isMountedRef.current) {
        Alert.alert('Error', error.message || 'Failed to load jobs');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        // Don't set refreshing to false here as it's handled in onRefresh
      }
    }
  }; // Load filter counts
  const loadFilterCounts = async () => {
    if (!isMountedRef.current) return;

    try {
      const response = await authService.getFilterCounts();

      if (!isMountedRef.current) return;

      setFilterCounts({
        categories: response.categories || {},
        experienceLevels: response.experienceLevels || {},
        datePosted: response.datePosted || {},
      });
    } catch (error) {
      console.error('Failed to load filter counts:', error);
      // Set default counts on error
      if (isMountedRef.current) {
        setFilterCounts({
          categories: {},
          experienceLevels: {},
          datePosted: {},
        });
      }
    }
  };

  // Load tasks on component mount
  useEffect(() => {
    loadTasks(1, true);
    loadFilterCounts(); // Load filter counts initially
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  // Reload tasks when filters change
  useEffect(() => {
    if (!isMountedRef.current || loading) return;

    const timeoutId = setTimeout(() => {
      if (isMountedRef.current && !loading) {
        loadTasks(1, true);
      }
    }, 500); // Debounce API calls

    return () => clearTimeout(timeoutId);
  }, [
    searchText,
    selectedLocation,
    selectedCategories,
    selectedExperience,
    selectedDatePosted,
    selectedTags,
    paymentRange,
  ]);

  // Helper functions for status styling
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'OPEN':
        return { backgroundColor: '#E8F5E8' };
      case 'IN_PROGRESS':
        return { backgroundColor: '#FFF3CD' };
      case 'COMPLETED':
        return { backgroundColor: '#D1ECF1' };
      case 'CANCELLED':
        return { backgroundColor: '#F8D7DA' };
      default:
        return { backgroundColor: '#E9ECEF' };
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status) {
      case 'OPEN':
        return { color: '#155724' };
      case 'IN_PROGRESS':
        return { color: '#856404' };
      case 'COMPLETED':
        return { color: '#0C5460' };
      case 'CANCELLED':
        return { color: '#721C24' };
      default:
        return { color: '#495057' };
    }
  };

  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      {/* View Toggle */}
      <View style={styles.viewToggleContainer}>
        <TouchableOpacity
          style={[styles.viewToggleButton, viewMode === 'list' && styles.activeViewToggle]}
          onPress={() => setViewMode('list')}
        >
          <Ionicons name="list" size={20} color={viewMode === 'list' ? '#fff' : '#2A9D8F'} />
          <Text style={[styles.viewToggleText, viewMode === 'list' && styles.activeViewToggleText]}>List</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewToggleButton, viewMode === 'map' && styles.activeViewToggle]}
          onPress={() => setViewMode('map')}
        >
          <Ionicons name="map" size={20} color={viewMode === 'map' ? '#fff' : '#2A9D8F'} />
          <Text style={[styles.viewToggleText, viewMode === 'map' && styles.activeViewToggleText]}>Map</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'list' ? (
        /* List View */
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollViewContent}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2A9D8F']}
              tintColor="#2A9D8F"
              title="Pull to refresh"
              titleColor="#666"
            />
          }
          onScroll={(event) => {
            setScrollPosition(event.nativeEvent.contentOffset.y);
          }}
          onMomentumScrollEnd={(event) => {
            setScrollPosition(event.nativeEvent.contentOffset.y);
          }}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Buttons Row */}
          <View style={styles.topButtonsRow}>
            {/* Filters Button */}
            <TouchableOpacity style={styles.filtersButton} onPress={() => setShowFilters(!showFilters)}>
              <Text style={styles.filtersButtonText}>{showFilters ? 'Hide Filters' : 'Show Filters'}</Text>
              <Ionicons name={showFilters ? 'chevron-up' : 'chevron-down'} size={16} color="#2A9D8F" />
            </TouchableOpacity>
            {/* Clear Filters Button */}
            <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
              <Ionicons name="trash-outline" size={16} color="#666" />
              <Text style={styles.clearFiltersButtonText}>Clear</Text>
            </TouchableOpacity>
            {/* Post Job Button */}
            <TouchableOpacity style={styles.postJobButton} onPress={() => router.push('/post-job')}>
              <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
              <Text style={styles.postJobButtonText}>Post a Job</Text>
            </TouchableOpacity>
          </View>
          {showFilters && (
            <>
              {/* Search Section */}
              <View style={styles.searchSection}>
                <Text style={styles.sectionTitle}>Search by Job Title</Text>
                <View style={styles.searchInputContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Job title"
                    value={searchText}
                    onChangeText={setSearchText}
                  />
                </View>
              </View>

              {/* Location Section */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Location</Text>
                <TouchableOpacity
                  style={styles.locationSelector}
                  onPress={() => {
                    // Store current scroll position before showing cities
                    setShowCities(!showCities);
                  }}
                >
                  <Ionicons name="location-outline" size={16} color="#999" />
                  <Text style={styles.locationText}>{selectedLocation ? selectedLocation : 'Choose city'}</Text>
                  <Ionicons
                    name={showCities ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#999"
                    style={styles.chevron}
                  />
                </TouchableOpacity>

                {/* City selection modal */}
                <Modal
                  visible={showCities}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setShowCities(false)}
                >
                  <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCities(false)}>
                    <View style={styles.modalContainer}>
                      <View style={styles.citiesDropdownContainer}>
                        <View style={styles.citiesDropdownHeader}>
                          <Text style={styles.citiesDropdownTitle}>Select a city</Text>
                          <TouchableOpacity onPress={() => setShowCities(false)}>
                            <Ionicons name="close" size={24} color="#333" />
                          </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.citiesDropdown} showsVerticalScrollIndicator={true}>
                          {dutchCities.map((city, index) => (
                            <TouchableOpacity
                              key={index}
                              style={styles.cityItem}
                              onPress={() => {
                                setSelectedLocation(city);
                                setShowCities(false);
                              }}
                            >
                              <Text style={[styles.cityText, selectedLocation === city && styles.selectedCityText]}>
                                {city}
                              </Text>
                              {selectedLocation === city && <Ionicons name="checkmark" size={16} color="#2A9D8F" />}
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Modal>
              </View>

              {/* Category Section */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Category</Text>
                {categories.map((category, index) => (
                  <CustomCheckbox
                    key={index}
                    checked={selectedCategories.includes(category.name)}
                    onPress={() => toggleCategory(category.name)}
                    label={category.name}
                    count={category.count}
                  />
                ))}
                <TouchableOpacity style={styles.showMoreButton}>
                  <Text style={styles.showMoreText}>Show More</Text>
                </TouchableOpacity>
              </View>

              {/* Experience Level Section */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Experience Level</Text>
                {experienceLevels.map((level, index) => (
                  <CustomCheckbox
                    key={index}
                    checked={selectedExperience.includes(level.name)}
                    onPress={() => toggleExperience(level.name)}
                    label={level.name}
                    count={level.count}
                  />
                ))}
              </View>

              {/* Date Posted Section */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Date Posted</Text>
                {datePostedOptions.map((option, index) => (
                  <CustomCheckbox
                    key={index}
                    checked={selectedDatePosted.includes(option.name)}
                    onPress={() => toggleDatePosted(option.name)}
                    label={option.name}
                    count={option.count}
                  />
                ))}
              </View>

              {/* Payment Range Section */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Payment</Text>
                <View style={styles.sliderContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={999}
                    value={paymentRange[1]}
                    onValueChange={(value: number) => setPaymentRange([0, Math.round(value)])}
                    minimumTrackTintColor="#2A9D8F"
                    maximumTrackTintColor="#E9ECEF"
                    thumbTintColor="#2A9D8F"
                  />
                </View>
                <View style={styles.paymentRangeTextContainer}>
                  <Text style={styles.paymentRangeText}>Payment: 0€ - {paymentRange[1]}€</Text>
                  <TouchableOpacity style={styles.applyButton}>
                    <Text style={styles.applyButtonText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Tags Section */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {tags.map((tag, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.tagButton, selectedTags.includes(tag) && styles.tagButtonSelected]}
                      onPress={() => toggleTag(tag)}
                    >
                      <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextSelected]}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
          {/* Results Count */}
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>
              {loading ? 'Loading...' : `Showing 1-${Math.min(tasks.length, totalResults)} of ${totalResults} results`}
            </Text>
            <TouchableOpacity style={styles.sortButton}>
              <Text style={styles.sortButtonText}>Sort by latest</Text>
              <Ionicons name="chevron-down" size={16} color="#333" />
            </TouchableOpacity>
          </View>
          {/* Task Cards */}
          {loading && tasks.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2A9D8F" />
              <Text style={styles.loadingText}>Loading jobs...</Text>
            </View>
          ) : tasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="briefcase-outline" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No jobs found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your filters or search criteria</Text>
            </View>
          ) : (
            <View style={styles.tasksContainer}>
              {tasks.map((task) => (
                <TouchableOpacity
                  key={task._id}
                  style={styles.taskCard}
                  onPress={() => router.push(`/jobs/${task._id}` as any)}
                >
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskPrice}>€{task.price}</Text>
                  </View>
                  <Text style={styles.taskDescription} numberOfLines={2}>
                    {task.description}
                  </Text>
                  <View style={styles.taskMeta}>
                    {task.location && (
                      <View style={styles.taskMetaItem}>
                        <Ionicons name="location-outline" size={14} color="#666" />
                        <Text style={styles.taskMetaText}>{task.location}</Text>
                      </View>
                    )}
                    {task.category && (
                      <View style={styles.taskMetaItem}>
                        <Ionicons name="pricetag-outline" size={14} color="#666" />
                        <Text style={styles.taskMetaText}>{task.category}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.taskFooter}>
                    <View style={styles.taskPoster}>
                      <View style={styles.posterAvatar}>
                        <Text style={styles.posterInitial}>{task.postedBy.firstName?.charAt(0) || 'U'}</Text>
                      </View>
                      <Text style={styles.posterName}>
                        {task.postedBy.firstName} {task.postedBy.lastName}
                      </Text>
                    </View>

                    <View style={[styles.statusBadge, getStatusBadgeStyle(task.status)]}>
                      <Text style={[styles.statusText, getStatusTextStyle(task.status)]}>
                        {task.status.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>
                  {task.tags && task.tags.length > 0 && (
                    <View style={styles.taskTags}>
                      {task.tags.slice(0, 3).map((tag, index) => (
                        <View key={index} style={styles.taskTag}>
                          <Text style={styles.taskTagText}>{tag}</Text>
                        </View>
                      ))}
                      {task.tags.length > 3 && <Text style={styles.moreTagsText}>+{task.tags.length - 3}</Text>}
                    </View>
                  )}
                  {/* Apply Now Button */}
                  <TouchableOpacity
                    style={[styles.applyButton, { marginTop: 10 }]}
                    onPress={async () => {
                      try {
                        await authService.applyForTask(task._id);
                        Alert.alert('Application Sent', 'You have applied for this job.');
                      } catch (error: any) {
                        Alert.alert('Error', error.message || 'Failed to apply for this job.');
                      }
                    }}
                  >
                    <Text style={styles.applyButtonText}>Apply Now</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}

              {/* Load More Button */}
              {currentPage < totalPages && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={() => loadTasks(currentPage + 1, false)}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#2A9D8F" />
                  ) : (
                    <Text style={styles.loadMoreText}>Load More Jobs</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      ) : (
        /* Map View */
        <View style={styles.mapContainer}>
          <WebView
            ref={webViewRef}
            source={{ html: generateMapHTML() }}
            style={styles.map}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <ActivityIndicator size="large" color="#2A9D8F" />
                <Text>Loading map...</Text>
              </View>
            )}
            onError={(error) => {
              console.error('WebView error:', error);
              Alert.alert('Map Error', 'Failed to load the map. Please try the list view.');
            }}
          />
          {/* Map Controls */}
          <View style={styles.mapControls}>
            <TouchableOpacity style={styles.mapControlButton} onPress={focusOnNetherlands}>
              <Ionicons name="locate" size={24} color="#2A9D8F" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.mapControlButton} onPress={refreshMap}>
              <Ionicons name="refresh" size={24} color="#2A9D8F" />
            </TouchableOpacity>
          </View>
          {/* Job Statistics */}
          <View style={styles.mapStatsContainer}>
            <View style={styles.mapStatItem}>
              <Text style={styles.mapStatNumber}>{jobsWithCoordinates.length}</Text>
              <Text style={styles.mapStatLabel}>Jobs Found</Text>
            </View>
          </View>
          {/* Legend */}
          <View style={styles.mapLegendContainer}>
            <Text style={styles.mapLegendTitle}>Categories</Text>
            <View style={styles.mapLegendItems}>
              {['gardening', 'cleaning', 'moving', 'technology'].map((category) => (
                <View key={category} style={styles.mapLegendItem}>
                  <View style={[styles.mapLegendMarker, { backgroundColor: getMarkerColor(category) }]}>
                    <Text style={styles.mapLegendIcon}>{getCategoryIcon(category)}</Text>
                  </View>
                  <Text style={styles.mapLegendText}>{category}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  topButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F7F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F7F6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  postJobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A9D8F',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  filtersButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2A9D8F',
    marginRight: 8,
  },
  clearFiltersButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 8,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2A9D8F',
    marginLeft: 8,
  },
  postJobButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  searchSection: {
    marginBottom: 16,
    backgroundColor: '#F1F7F6',
    padding: 16,
    borderRadius: 8,
  },
  filterSection: {
    marginBottom: 16,
    backgroundColor: '#F1F7F6',
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#333',
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  locationText: {
    flex: 1,
    marginLeft: 8,
    color: '#999',
  },
  chevron: {
    marginLeft: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkboxContainer: {
    marginRight: 10,
  },
  checkboxBase: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#2A9D8F',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2A9D8F',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  countBadge: {
    fontSize: 14,
    color: '#999',
  },
  showMoreButton: {
    backgroundColor: '#2A9D8F',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  showMoreText: {
    color: 'white',
    fontWeight: '600',
  },
  sliderContainer: {
    marginVertical: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  paymentRangeTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentRangeText: {
    fontSize: 14,
    color: '#333',
  },
  applyButton: {
    backgroundColor: '#2A9D8F',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tagButton: {
    backgroundColor: '#E9ECEF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagButtonSelected: {
    backgroundColor: '#2A9D8F',
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  tagTextSelected: {
    color: 'white',
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  resultsText: {
    fontSize: 12,
    color: '#666',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F7F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  sortButtonText: {
    fontSize: 12,
    color: '#333',
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'transparent',
  },
  citiesDropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  citiesDropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F7F6',
  },
  citiesDropdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  citiesDropdown: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    maxHeight: 300,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F7F6',
  },
  cityText: {
    fontSize: 14,
    color: '#333',
  },
  selectedCityText: {
    color: '#2A9D8F',
    fontWeight: '600',
  },
  // New styles for task cards and loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  tasksContainer: {
    marginTop: 16,
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  taskPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A9D8F',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  taskMetaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskPoster: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  posterAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A9D8F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  posterInitial: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  posterName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  taskTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 8,
  },
  taskTag: {
    backgroundColor: '#F1F7F6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  taskTagText: {
    fontSize: 11,
    color: '#2A9D8F',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  loadMoreButton: {
    backgroundColor: '#2A9D8F',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  loadMoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // View toggle styles
  viewToggleContainer: {
    flexDirection: 'row',
    margin: 10,
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
    padding: 4,
  },
  viewToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeViewToggle: {
    backgroundColor: '#2A9D8F',
  },
  viewToggleText: {
    marginLeft: 5,
    color: '#2A9D8F',
    fontWeight: '600',
  },
  activeViewToggleText: {
    color: '#fff',
  },
  // Map styles
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapControls: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'column',
  },
  mapControlButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 25,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapStatsContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapStatItem: {
    alignItems: 'center',
  },
  mapStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2A9D8F',
  },
  mapStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  mapLegendContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxWidth: width * 0.7,
  },
  mapLegendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  mapLegendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mapLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },
  mapLegendMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  mapLegendIcon: {
    fontSize: 10,
  },
  mapLegendText: {
    fontSize: 10,
    color: '#666',
    textTransform: 'capitalize',
  },
}); 
