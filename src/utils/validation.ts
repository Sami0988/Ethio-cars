// src/utils/validation.ts
import * as Yup from "yup";

// ========== UTILITY FUNCTIONS ==========

/**
 * Format phone number to Ethiopian standard format (+2519XXXXXXXX)
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";

  // Remove all non-digits
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("0") && digits.length === 10) {
    // Format: 09XXXXXXXX → +2519XXXXXXXX
    return `+251${digits.substring(1)}`;
  } else if (digits.startsWith("251") && digits.length === 12) {
    // Format: 2519XXXXXXXX → +2519XXXXXXXX
    return `+${digits}`;
  } else if (
    (digits.startsWith("9") || digits.startsWith("7")) &&
    digits.length === 9
  ) {
    // Format: 9XXXXXXXX or 7XXXXXXXX → +2519XXXXXXXX or +2517XXXXXXXX
    return `+251${digits}`;
  }

  return phone;
};

/**
 * Validate Ethiopian phone number
 */
export const isValidEthiopianPhone = (phone: string): boolean => {
  const formatted = formatPhoneNumber(phone);
  return /^\+251[79][0-9]{8}$/.test(formatted);
};

// ========== VALIDATION SCHEMAS ==========

/**
 * Login validation schema (matches EthioCars API)
 */
export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export type LoginFormData = Yup.InferType<typeof loginSchema>;

/**
 * Registration validation schema
 */
export const registrationSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    )
    .required("Username is required"),

  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),

  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),

  confirm_password: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),

  phone: Yup.string()
    .test("phone", "Please enter a valid Ethiopian phone number", (value) => {
      if (!value) return false;
      return isValidEthiopianPhone(value);
    })
    .required("Phone number is required"),

  first_name: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),

  last_name: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .required("Last name is required"),

  device_info: Yup.string().optional(),

  is_dealer: Yup.boolean().default(false),

  dealer_company_name: Yup.string().when("is_dealer", {
    is: true,
    then: (schema) => schema.required("Company name is required for dealers"),
    otherwise: (schema) => schema.optional(),
  }),

  dealer_license_number: Yup.string().when("is_dealer", {
    is: true,
    then: (schema) => schema.required("License number is required for dealers"),
    otherwise: (schema) => schema.optional(),
  }),

  dealer_address: Yup.string().optional(),
  dealer_city: Yup.string().optional(),
  dealer_region: Yup.string().optional(),
});

export type FullRegistrationFormData = Yup.InferType<typeof registrationSchema>;

// ========== API REQUEST TYPES ==========

export interface LoginRequest {
  email: string;
  password: string;
  device_info?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone: string;
  first_name: string;
  last_name: string;
  device_info?: string;
  is_dealer?: boolean;
  dealer_company_name?: string;
  dealer_address?: string;
  dealer_city?: string;
  dealer_region?: string;
  dealer_license_number?: string;
}

// Helper to convert form data to API request
export const prepareRegisterRequest = (
  formData: FullRegistrationFormData
): RegisterRequest => {
  const {
    confirm_password,
    dealer_company_name,
    dealer_address,
    dealer_city,
    dealer_region,
    dealer_license_number,
    ...baseData
  } = formData;

  const request: RegisterRequest = {
    ...baseData,
    phone: formatPhoneNumber(baseData.phone),
    device_info: baseData.device_info || "EthioCars Mobile App",
  };

  if (baseData.is_dealer) {
    if (dealer_company_name) request.dealer_company_name = dealer_company_name;
    if (dealer_license_number)
      request.dealer_license_number = dealer_license_number;
    if (dealer_address) request.dealer_address = dealer_address;
    if (dealer_city) request.dealer_city = dealer_city;
    if (dealer_region) request.dealer_region = dealer_region;
  }

  return request;
};
