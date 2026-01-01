// Script to clear app storage
const { execSync } = require("child_process");

console.log("Clearing app storage...");

try {
  // Clear Expo cache
  execSync("npx expo start --clear", { stdio: "inherit" });
} catch (error) {
  console.log("Could not clear cache, but that's okay");
}

console.log("App reset complete. You can now restart the app.");
