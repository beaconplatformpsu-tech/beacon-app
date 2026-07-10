export const getPlatformSettings = (timestamp: string): Record<string, any> => {
  return {
    "platform_settings/public": {
      maintenanceMode: false,
      allowRegistration: true,
      defaultUserRole: "student",
      platformVersion: "1.0.0",
      enableAiMentor: true,
      enableInternships: true,
      enablePortfolioGen: true,
      createdAt: timestamp,
      updatedAt: timestamp
    },
    "platform_settings/private": {
      adminEmails: [],
      updatedAt: timestamp
    }
  };
};
