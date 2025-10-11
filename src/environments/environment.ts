

export const environment = {
  production: false, // Changed to false for development
  apiUrl: 'https://deploymentbackend-yndf.onrender.com', // Back to original backend with CORS configured
  cloudinary:{
    cloudName: 'dsheuvqdc'
  },
  // Performance monitoring
  enablePerformanceMonitoring: false,
  // Error reporting
  enableErrorReporting: false,
  // Analytics
  enableAnalytics: false
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.   