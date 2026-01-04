import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Checkbox,
  RadioButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import {
  useCarMakes,
  useCarModels,
  useCreateCar,
} from "../../features/cars/car.hooks";
import { CreateCarRequest } from "../../features/cars/car.types";

const CreateListingScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const createCarMutation = useCreateCar();
  const { data: makesResponse } = useCarMakes();
  const [selectedMakeId, setSelectedMakeId] = useState<number | null>(null);
  const { data: modelsResponse } = useCarModels(selectedMakeId || 0);

  const makes = makesResponse?.data || [];
  const models = modelsResponse?.data?.models || [];

  // Form state
  const [formData, setFormData] = useState<CreateCarRequest>({
    make_id: 0,
    model_id: 0,
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    fuel_type: "Gasoline",
    transmission: "Manual",
    body_type: "Sedan",
    drive_type: "FWD",
    condition: "Good",
    negotiable: true,
    description: "",
    images: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.make_id) newErrors.make_id = "Please select a make";
    if (!formData.model_id) newErrors.model_id = "Please select a model";
    if (
      !formData.year ||
      formData.year < 1900 ||
      formData.year > new Date().getFullYear() + 1
    ) {
      newErrors.year = "Please enter a valid year";
    }
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Please enter a valid price";
    if (!formData.mileage || formData.mileage < 0)
      newErrors.mileage = "Please enter valid mileage";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await createCarMutation.mutateAsync(formData);
      // Success - navigate back
      router.back();
    } catch (error) {
      // Error is handled by React Query
      console.error("Failed to create listing:", error);
    }
  };

  const updateFormData = (field: keyof CreateCarRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Basic Information</Text>

            {/* Make Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Make *</Text>
              <RadioButton.Group
                onValueChange={(value) => {
                  const makeId = parseInt(value);
                  setSelectedMakeId(makeId);
                  updateFormData("make_id", makeId);
                  updateFormData("model_id", 0); // Reset model when make changes
                }}
                value={formData.make_id.toString()}
              >
                {makes.map((make) => (
                  <RadioButton.Item
                    key={make.make_id}
                    label={make.name}
                    value={make.make_id.toString()}
                  />
                ))}
              </RadioButton.Group>
              {errors.make_id && (
                <Text style={styles.error}>{errors.make_id}</Text>
              )}
            </View>

            {/* Model Selection */}
            {selectedMakeId && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Model *</Text>
                <RadioButton.Group
                  onValueChange={(value) =>
                    updateFormData("model_id", parseInt(value))
                  }
                  value={formData.model_id.toString()}
                >
                  {models.map((model) => (
                    <RadioButton.Item
                      key={model.model_id}
                      label={model.name}
                      value={model.model_id.toString()}
                    />
                  ))}
                </RadioButton.Group>
                {errors.model_id && (
                  <Text style={styles.error}>{errors.model_id}</Text>
                )}
              </View>
            )}

            {/* Year */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Year *</Text>
              <TextInput
                mode="outlined"
                value={formData.year.toString()}
                onChangeText={(value) =>
                  updateFormData("year", parseInt(value) || 0)
                }
                keyboardType="numeric"
                error={!!errors.year}
              />
              {errors.year && <Text style={styles.error}>{errors.year}</Text>}
            </View>

            {/* Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price (ETB) *</Text>
              <TextInput
                mode="outlined"
                value={formData.price.toString()}
                onChangeText={(value) =>
                  updateFormData("price", parseInt(value) || 0)
                }
                keyboardType="numeric"
                error={!!errors.price}
                left={<TextInput.Icon icon="currency-etb" />}
              />
              {errors.price && <Text style={styles.error}>{errors.price}</Text>}
            </View>

            {/* Mileage */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mileage (km) *</Text>
              <TextInput
                mode="outlined"
                value={formData.mileage.toString()}
                onChangeText={(value) =>
                  updateFormData("mileage", parseInt(value) || 0)
                }
                keyboardType="numeric"
                error={!!errors.mileage}
                left={<TextInput.Icon icon="speedometer" />}
              />
              {errors.mileage && (
                <Text style={styles.error}>{errors.mileage}</Text>
              )}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Vehicle Details</Text>

            {/* Fuel Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fuel Type</Text>
              <RadioButton.Group
                onValueChange={(value) => updateFormData("fuel_type", value)}
                value={formData.fuel_type}
              >
                <RadioButton.Item label="Gasoline" value="Gasoline" />
                <RadioButton.Item label="Diesel" value="Diesel" />
                <RadioButton.Item label="Electric" value="Electric" />
                <RadioButton.Item label="Hybrid" value="Hybrid" />
              </RadioButton.Group>
            </View>

            {/* Transmission */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Transmission</Text>
              <RadioButton.Group
                onValueChange={(value) => updateFormData("transmission", value)}
                value={formData.transmission}
              >
                <RadioButton.Item label="Manual" value="Manual" />
                <RadioButton.Item label="Automatic" value="Automatic" />
              </RadioButton.Group>
            </View>

            {/* Body Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Body Type</Text>
              <RadioButton.Group
                onValueChange={(value) => updateFormData("body_type", value)}
                value={formData.body_type}
              >
                <RadioButton.Item label="Sedan" value="Sedan" />
                <RadioButton.Item label="SUV" value="SUV" />
                <RadioButton.Item label="Hatchback" value="Hatchback" />
                <RadioButton.Item label="Truck" value="Truck" />
              </RadioButton.Group>
            </View>

            {/* Drive Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Drive Type</Text>
              <RadioButton.Group
                onValueChange={(value) => updateFormData("drive_type", value)}
                value={formData.drive_type}
              >
                <RadioButton.Item label="FWD" value="FWD" />
                <RadioButton.Item label="RWD" value="RWD" />
                <RadioButton.Item label="AWD" value="AWD" />
                <RadioButton.Item label="4WD" value="4WD" />
              </RadioButton.Group>
            </View>

            {/* Condition */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Condition</Text>
              <RadioButton.Group
                onValueChange={(value) => updateFormData("condition", value)}
                value={formData.condition}
              >
                <RadioButton.Item label="New" value="New" />
                <RadioButton.Item label="Like New" value="Like New" />
                <RadioButton.Item label="Excellent" value="Excellent" />
                <RadioButton.Item label="Good" value="Good" />
                <RadioButton.Item label="Fair" value="Fair" />
              </RadioButton.Group>
            </View>

            {/* Negotiable */}
            <View style={styles.inputGroup}>
              <View style={styles.checkboxRow}>
                <Checkbox
                  status={formData.negotiable ? "checked" : "unchecked"}
                  onPress={() =>
                    updateFormData("negotiable", !formData.negotiable)
                  }
                />
                <Text style={styles.checkboxLabel}>Price is negotiable</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Description */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Description</Text>
            <TextInput
              mode="outlined"
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={(value) => updateFormData("description", value)}
              placeholder="Describe your car's condition, features, and any additional details..."
            />
          </Card.Content>
        </Card>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={createCarMutation.isPending}
          style={styles.submitButton}
          disabled={createCarMutation.isPending}
        >
          {createCarMutation.isPending ? "Creating..." : "Create Listing"}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  error: {
    color: "#B91C1C",
    fontSize: 12,
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  submitButton: {
    paddingVertical: 8,
    borderRadius: 8,
  },
});

export default CreateListingScreen;
