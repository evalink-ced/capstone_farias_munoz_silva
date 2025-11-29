import api from "@/services/google/axiosInstance";
import { User } from "@/types/types";

export const fetchUserProfile = async (): Promise<User | null> => {
  const response = await api.get("/proyecto/api/user/");

  return response.data;
};
