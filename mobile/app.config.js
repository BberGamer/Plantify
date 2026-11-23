module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins || []),
    "@react-native-community/datetimepicker",
  ],
  android: {
    ...config.android,
    ...(process.env.GOOGLE_SERVICES_JSON ? { googleServicesFile: process.env.GOOGLE_SERVICES_JSON } : {}),
  },
});
