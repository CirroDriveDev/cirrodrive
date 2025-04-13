import type { UserDTO } from "@cirrodrive/schemas";

export const mockAdminUser: UserDTO = {
  id: 9999,
  username: "admin-mock",
  email: "admin@example.com",
  pricingPlan: "premium",
  usedStorage: 0,
  profileImageUrl: null,
  rootFolderId: 1,
  trashFolderId: 2,
  isAdmin: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
