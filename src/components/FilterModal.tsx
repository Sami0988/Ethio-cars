// components/FilterModal.tsx
import React, { useState } from "react";
import { Modal, Platform, ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Chip,
  Divider,
  IconButton,
  Portal,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import {
  BODY_TYPES,
  CarFilters,
  FUEL_TYPES,
  SORT_OPTIONS,
  TRANSMISSIONS,
} from "../features/cars/car.types";

interface FilterModalProps {
  visible: boolean;
  onDismiss: () => void;
  filters: CarFilters;
  onApplyFilters: (filters: CarFilters) => void;
  onClearFilters: () => void;
  priceRange?: { min: number; max: number };
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onDismiss,
  filters,
  onApplyFilters,
  onClearFilters,
  priceRange,
}) => {
  const theme = useTheme();
  const [localFilters, setLocalFilters] = useState<CarFilters>(filters);

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleClear = () => {
    setLocalFilters({ sort: "newest", limit: 20 });
    onClearFilters();
  };

  const handlePriceChange = (type: "min" | "max", value: string) => {
    const numValue = value ? parseInt(value.replace(/\D/g, "")) : undefined;
    setLocalFilters((prev) => ({
      ...prev,
      [type === "min" ? "minPrice" : "maxPrice"]: numValue,
    }));
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={[
            styles.container,
            { backgroundColor: theme.colors.background },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                Filters & Sort
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Refine your search
              </Text>
            </View>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
              iconColor={theme.colors.onSurfaceVariant}
            />
          </View>

          <Divider />

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Sort Section */}
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              >
                Sort By
              </Text>
              <SegmentedButtons
                value={localFilters.sort || "newest"}
                onValueChange={(value) =>
                  setLocalFilters((prev) => ({ ...prev, sort: value as any }))
                }
                buttons={SORT_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                  style: {
                    flex: 1,
                    borderColor: theme.colors.outline,
                  },
                }))}
                style={styles.segmentedButtons}
              />
            </View>

            <Divider style={styles.divider} />

            {/* Price Range */}
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              >
                Price Range
              </Text>
              <View style={styles.priceContainer}>
                <View style={styles.priceInputWrapper}>
                  <TextInput
                    mode="outlined"
                    label="Min Price"
                    placeholder="ETB 0"
                    value={localFilters.minPrice?.toString() || ""}
                    onChangeText={(text) => handlePriceChange("min", text)}
                    keyboardType="numeric"
                    style={styles.priceInput}
                    left={<TextInput.Icon icon="currency-eth" size={20} />}
                    outlineColor={theme.colors.outline}
                    activeOutlineColor={theme.colors.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.priceTo,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  to
                </Text>
                <View style={styles.priceInputWrapper}>
                  <TextInput
                    mode="outlined"
                    label="Max Price"
                    placeholder={
                      priceRange
                        ? `ETB ${priceRange.max.toLocaleString()}`
                        : "ETB 10M"
                    }
                    value={localFilters.maxPrice?.toString() || ""}
                    onChangeText={(text) => handlePriceChange("max", text)}
                    keyboardType="numeric"
                    style={styles.priceInput}
                    left={<TextInput.Icon icon="currency-eth" size={20} />}
                    outlineColor={theme.colors.outline}
                    activeOutlineColor={theme.colors.primary}
                  />
                </View>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Body Type */}
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              >
                Body Type
              </Text>
              <View style={styles.chipContainer}>
                {BODY_TYPES.map((type) => (
                  <Chip
                    key={type}
                    selected={localFilters.bodyType === type}
                    onPress={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        bodyType: prev.bodyType === type ? undefined : type,
                      }))
                    }
                    style={[
                      styles.chip,
                      { borderColor: theme.colors.outline },
                      localFilters.bodyType === type && {
                        backgroundColor: theme.colors.primary,
                      },
                    ]}
                    textStyle={{
                      color:
                        localFilters.bodyType === type
                          ? "#fff"
                          : theme.colors.onSurface,
                    }}
                    showSelectedCheck
                    mode="outlined"
                  >
                    {type}
                  </Chip>
                ))}
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Fuel Type */}
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              >
                Fuel Type
              </Text>
              <View style={styles.chipContainer}>
                {FUEL_TYPES.map((type) => (
                  <Chip
                    key={type}
                    selected={localFilters.fuelType === type}
                    onPress={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        fuelType: prev.fuelType === type ? undefined : type,
                      }))
                    }
                    style={[
                      styles.chip,
                      { borderColor: theme.colors.outline },
                      localFilters.fuelType === type && {
                        backgroundColor: theme.colors.primary,
                      },
                    ]}
                    textStyle={{
                      color:
                        localFilters.fuelType === type
                          ? "#fff"
                          : theme.colors.onSurface,
                    }}
                    showSelectedCheck
                    mode="outlined"
                  >
                    {type}
                  </Chip>
                ))}
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Transmission */}
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              >
                Transmission
              </Text>
              <View style={styles.chipContainer}>
                {TRANSMISSIONS.map((type) => (
                  <Chip
                    key={type}
                    selected={localFilters.transmission === type}
                    onPress={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        transmission:
                          prev.transmission === type ? undefined : type,
                      }))
                    }
                    style={[
                      styles.chip,
                      { borderColor: theme.colors.outline },
                      localFilters.transmission === type && {
                        backgroundColor: theme.colors.primary,
                      },
                    ]}
                    textStyle={{
                      color:
                        localFilters.transmission === type
                          ? "#fff"
                          : theme.colors.onSurface,
                    }}
                    showSelectedCheck
                    mode="outlined"
                  >
                    {type}
                  </Chip>
                ))}
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Negotiable */}
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              >
                Price Type
              </Text>
              <View style={styles.chipContainer}>
                <Chip
                  selected={localFilters.negotiable === true}
                  onPress={() =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      negotiable: prev.negotiable === true ? undefined : true,
                    }))
                  }
                  style={[
                    styles.chip,
                    { borderColor: theme.colors.outline },
                    localFilters.negotiable === true && {
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                  textStyle={{
                    color:
                      localFilters.negotiable === true
                        ? "#fff"
                        : theme.colors.onSurface,
                  }}
                  showSelectedCheck
                  mode="outlined"
                  icon="handshake"
                >
                  Negotiable Only
                </Chip>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <Button
              mode="outlined"
              onPress={handleClear}
              style={[styles.clearButton, { borderColor: theme.colors.error }]}
              textColor={theme.colors.error}
              icon="filter-off"
              contentStyle={styles.buttonContent}
            >
              Clear All
            </Button>
            <Button
              mode="contained"
              onPress={handleApply}
              style={styles.applyButton}
              icon="check"
              contentStyle={styles.buttonContent}
            >
              Apply Filters
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "System",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "System",
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "System",
    marginBottom: 16,
  },
  segmentedButtons: {
    borderRadius: 12,
  },
  divider: {
    marginVertical: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceInputWrapper: {
    flex: 1,
  },
  priceInput: {
    borderRadius: 12,
  },
  priceTo: {
    fontSize: 16,
    fontFamily: "System",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    marginBottom: 8,
    borderRadius: 12,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  clearButton: {
    flex: 1,
    borderRadius: 12,
  },
  applyButton: {
    flex: 1,
    borderRadius: 12,
  },
  buttonContent: {
    height: 48,
  },
});

export default FilterModal;
