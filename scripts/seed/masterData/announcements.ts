export const getAnnouncements = (timestamp: string): Record<string, any> => {
  return {
    "public_content/announcements/welcome": {
      id: "welcome",
      type: "system",
      title: "Welcome to Beacon Platform",
      content: "Explore career paths, manage your tasks, and build your future.",
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  };
};
