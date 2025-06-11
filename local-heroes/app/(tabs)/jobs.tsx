import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TextInput, TouchableOpacity, Pressable, Modal, SafeAreaView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '../components/Header';
import Slider from '@react-native-community/slider';

// Custom Checkbox component
const CustomCheckbox = ({ checked, onPress, label, count }: { checked: boolean, onPress: () => void, label: string, count: number }) => {
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
  const [scrollPosition, setScrollPosition] = useState(0);
  
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

  const categories = [
    { name: 'Gardening', count: 10 },
    { name: 'Bricolage', count: 10 },
    { name: 'Moving', count: 10 },
    { name: 'Petsitting', count: 10 },
    { name: 'Leisure', count: 10 },
  ];

  const experienceLevels = [
    { name: 'No-experience', count: 10 },
    { name: 'Fresher', count: 10 },
    { name: 'Intermediate', count: 10 },
    { name: 'Expert', count: 10 },
  ];

  const datePostedOptions = [
    { name: 'All', count: 10 },
    { name: 'Last Hour', count: 10 },
    { name: 'Last 24 Hours', count: 10 },
    { name: 'Last 7 Days', count: 10 },
    { name: 'Last 30 Days', count: 10 },
  ];

  const tags = [
    'engineering',
    'design',
    'marketing',
    'ui/ux',
    'management',
    'software',
    'construction',
  ];

  const toggleCategory = (category: string): void => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(item => item !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const toggleExperience = (experience: string): void => {
    if (selectedExperience.includes(experience)) {
      setSelectedExperience(selectedExperience.filter(item => item !== experience));
    } else {
      setSelectedExperience([...selectedExperience, experience]);
    }
  };

  const toggleDatePosted = (date: string): void => {
    if (selectedDatePosted.includes(date)) {
      setSelectedDatePosted(selectedDatePosted.filter(item => item !== date));
    } else {
      setSelectedDatePosted([...selectedDatePosted, date]);
    }
  };

  const toggleTag = (tag: string): void => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(item => item !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollViewContent}
        scrollEventThrottle={16}
        onScroll={(event) => {
          setScrollPosition(event.nativeEvent.contentOffset.y);
        }}
        onMomentumScrollEnd={(event) => {
          setScrollPosition(event.nativeEvent.contentOffset.y);
        }}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        keyboardShouldPersistTaps="handled">
        {/* Top Buttons Row */}
        <View style={styles.topButtonsRow}>
          {/* Filters Button */}
          <TouchableOpacity 
            style={styles.filtersButton} 
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filtersButtonText}>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Text>
            <Ionicons 
              name={showFilters ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#2A9D8F" 
            />
          </TouchableOpacity>
          
          {/* Post Job Button */}
          <TouchableOpacity 
            style={styles.postJobButton}
            onPress={() => router.push('/post-job')}
          >
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
                <Text style={styles.locationText}>
                  {selectedLocation ? selectedLocation : 'Choose city'}
                </Text>
                <Ionicons 
                  name={showCities ? "chevron-up" : "chevron-down"} 
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
                <TouchableOpacity 
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setShowCities(false)}
                >
                  <View style={styles.modalContainer}>
                    <View style={styles.citiesDropdownContainer}>
                      <View style={styles.citiesDropdownHeader}>
                        <Text style={styles.citiesDropdownTitle}>Select a city</Text>
                        <TouchableOpacity onPress={() => setShowCities(false)}>
                          <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                      </View>
                      <ScrollView 
                        style={styles.citiesDropdown}
                        showsVerticalScrollIndicator={true}
                      >
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
                            {selectedLocation === city && (
                              <Ionicons name="checkmark" size={16} color="#2A9D8F" />
                            )}
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
          <Text style={styles.resultsText}>Showing 1-5 of 5 results</Text>
          <TouchableOpacity style={styles.sortButton}>
            <Text style={styles.sortButtonText}>Sort by latest</Text>
            <Ionicons name="chevron-down" size={16} color="#333" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
    flex: 1,
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
});