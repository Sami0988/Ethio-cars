// Temporary tracer to (1) patch RN.SafeAreaView early to the safe-area-context impl
// and (2) capture a stack trace when the deprecation warning is emitted.
import * as RN from "react-native";
import { SafeAreaView as RNCSafeAreaView } from "react-native-safe-area-context";

// 1) If RN has an accessor for SafeAreaView, override it to prevent the deprecated getter
try {
  const desc = Object.getOwnPropertyDescriptor(RN, "SafeAreaView");
  if (desc && (desc.get || desc.set)) {
    Object.defineProperty(RN, "SafeAreaView", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: RNCSafeAreaView,
    });
  }
} catch (e) {
  // noop
}

// 2) Wrap console.warn to capture deprecation stacks
const _origWarn = console.warn.bind(console);
(console as any).warn = (...args: any[]) => {
  try {
    if (
      typeof args[0] === "string" &&
      args[0].includes("SafeAreaView has been deprecated")
    ) {
      // Print stack to Metro/Dev console so we can see which module triggered it
      console.log("SafeAreaView deprecation stack:", new Error().stack);
    }
  } catch (e) {
    // noop
  }

  return _origWarn(...(args as any));
};

// Export a default no-op React component so Expo Router doesn't complain about a missing default export
export default function _SafeAreaTrace(): null {
  return null;
}
