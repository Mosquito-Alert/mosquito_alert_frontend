import axios from 'axios'

import {
  AuthApi,
  Configuration,
  CountriesApi,
  IdentificationTasksApi,
  PermissionsApi,
  TaxaApi,
  UsersApi,
} from 'mosquito-alert'
import { attachAuthInterceptor } from 'mosquito-alert/interceptors'

const apiConfig = new Configuration({
  ...(import.meta.env.VITE_API_BASE_URL ? { basePath: import.meta.env.VITE_API_BASE_URL } : {}),
  accessToken: () => localStorage.getItem('access_token') || '',
})

const axiosInstance = axios.create({})
attachAuthInterceptor(axiosInstance, {
  configuration: apiConfig,
  refreshToken: () => localStorage.getItem('refresh_token') || '',
  updateAccessToken: (newAccessToken) => localStorage.setItem('access_token', newAccessToken),
})

export const authApi = new AuthApi(apiConfig, undefined, axiosInstance)
export const countryApi = new CountriesApi(apiConfig, undefined, axiosInstance)
export const identificationTasksApi = new IdentificationTasksApi(
  apiConfig,
  undefined,
  axiosInstance,
)
export const permissionsApi = new PermissionsApi(apiConfig, undefined, axiosInstance)
export const taxaApi = new TaxaApi(apiConfig, undefined, axiosInstance)
export const userApi = new UsersApi(apiConfig, undefined, axiosInstance)
