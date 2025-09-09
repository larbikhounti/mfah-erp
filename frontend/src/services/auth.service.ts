import { AxiosError } from "axios";
import { axiosInstance } from "@/lib/utils";
import { LoginFormData } from "@/types/validation.types";
import { AuthError } from "@/types/auth.types";

export interface LoginResponse {
  email: string;
  name: string;
  access_token: string;
}

export class AuthService {
  static async login(credentials: LoginFormData): Promise<LoginResponse> {
    try {
      const response = await axiosInstance.post<LoginResponse>("auth/login", credentials);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data as AuthError;
      }
      throw new Error("An unexpected error occurred");
    }
  }
}
