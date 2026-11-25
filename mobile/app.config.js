const { existsSync } = require("node:fs");
const { join } = require("node:path");

module.exports = ({ config }) => {
  const localGoogleServicesFile = "./google-services.json";
  const googleServicesFile =
    process.env.GOOGLE_SERVICES_JSON ||
    (existsSync(join(__dirname, localGoogleServicesFile))
      ? localGoogleServicesFile
      : undefined);

  return {
    ...config,
    plugins: [
      ...(config.plugins || []),
      "@react-native-community/datetimepicker",
    ],
    android: {
      ...config.android,
      ...(googleServicesFile ? { googleServicesFile } : {}),
    },
  };
};
