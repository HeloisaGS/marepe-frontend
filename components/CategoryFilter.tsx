import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
  onClearAll: () => void;
}

export default function CategoryFilter({
  categories,
  selectedCategories,
  onToggleCategory,
  onClearAll,
}: CategoryFilterProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {selectedCategories.length > 0 && (
          <TouchableOpacity
            style={[styles.chip, styles.clearChip]}
            onPress={onClearAll}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="close-circle" size={16} color="#E95822" />
            <Text style={styles.clearText}>Limpar</Text>
          </TouchableOpacity>
        )}

        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category.id);
          return (
            <TouchableOpacity
              key={category.id}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onToggleCategory(category.id)}
              activeOpacity={0.7}
            >
              {isSelected && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={16}
                  color="#FFF"
                  style={styles.checkIcon}
                />
              )}
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#DDD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chipSelected: {
    backgroundColor: '#E95822',
    borderColor: '#E95822',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  chipTextSelected: {
    color: '#FFF',
  },
  checkIcon: {
    marginRight: 6,
  },
  clearChip: {
    backgroundColor: '#FFF',
    borderColor: '#E95822',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E95822',
    marginLeft: 4,
  },
});
