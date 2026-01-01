import React from "react";
import { Text, View } from "react-native";

const PRIMARY = "#dc2828";

export const SplashScreen: React.FC = () => {
  return (
    <View style={{ flex: 1, backgroundColor: "#f8f6f6" }}>
      {/* decorative gradient top */}
      <View
        style={{
          position: "absolute",
          top: 0,
          height: "65%",
          width: "100%",
          backgroundColor: "rgba(220, 40, 40, 0.05)",
        }}
      />
      <View
        style={{
          position: "absolute",
          top: -128,
          right: -128,
          height: 260,
          width: 260,
          borderRadius: 130,
          backgroundColor: "rgba(220, 40, 40, 0.15)",
          opacity: 0.9,
        }}
      />

      {/* center content */}
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              position: "absolute",
              inset: 12,
              borderRadius: 32,
              backgroundColor: "rgba(220, 40, 40, 0.3)",
              transform: [{ scale: 0.9 }],
            }}
          />
          <View
            style={{
              height: 112,
              width: 112,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 32,
              backgroundColor: PRIMARY,
              shadowColor: PRIMARY,
              shadowOpacity: 0.3,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 8,
            }}
          >
            <Text style={{ fontSize: 56, color: "white", fontWeight: "bold" }}>
              🚗
            </Text>
          </View>
        </View>

        <Text
          style={{
            marginTop: 16,
            fontSize: 32,
            fontWeight: "800",
            color: "#0f172a",
          }}
        >
          EthioCars
        </Text>
        <Text
          style={{
            marginTop: 8,
            maxWidth: 280,
            textAlign: "center",
            fontSize: 16,
            lineHeight: 22,
            color: "#64748b",
          }}
        >
          Connecting you to Ethiopia&apos;s automotive marketplace
        </Text>
      </View>

      {/* bottom loading bar */}
      <View style={{ paddingHorizontal: 32, paddingBottom: 48 }}>
        <Text
          style={{
            marginBottom: 12,
            textAlign: "center",
            fontSize: 11,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: 2.5,
            color: "#94a3b8",
          }}
        >
          LOADING...
        </Text>
        <View
          style={{
            height: 6,
            width: "100%",
            overflow: "hidden",
            borderRadius: 3,
            backgroundColor: "#e2e8f0",
          }}
        >
          <View style={{ width: "60%", height: "100%", borderRadius: 3 }}>
            <View
              style={{
                height: "100%",
                width: "100%",
                borderRadius: 3,
                backgroundColor: PRIMARY,
              }}
            />
          </View>
        </View>

        {/* shield icon at bottom */}
        <View style={{ marginTop: 16, alignItems: "center" }}>
          <Text style={{ fontSize: 16, color: "#e2e8f0" }}>🛡️</Text>
        </View>
      </View>
    </View>
  );
};
