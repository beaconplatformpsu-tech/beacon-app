/**
 * Support messages seed data.
 * This should only contain REAL support messages from users.
 * Welcome/system messages must go into public_content/announcements, NOT here.
 */
export const getSupportMessages = (timestamp: string): Record<string, any> => {
  // We seed one minimal placeholder support message to confirm the path is accessible.
  // In production, users submit real messages via the contact form.
  return {
    "support_messages/msg_seed_001": {
      id: "msg_seed_001",
      uid: "system",
      subject: "Platform Initialized",
      message: "Beacon platform was successfully seeded and is ready for use.",
      status: "Closed",
      type: "General",
      createdAt: timestamp,
      updatedAt: timestamp
    }
  };
};
