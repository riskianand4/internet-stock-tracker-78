// Simple mock services to avoid API response wrapper issues
import { Asset } from '@/types/assets';

export const getAllAssets = async (): Promise<Asset[]> => {
  // Mock data - in real app this would call API
  return [];
};

export const getAssetById = async (id: string): Promise<Asset> => {
  throw new Error('Not implemented');
};

export const createAsset = async (asset: any): Promise<Asset> => {
  throw new Error('Not implemented');
};

export const updateAsset = async (id: string, asset: any): Promise<Asset> => {
  throw new Error('Not implemented');
};

export const deleteAsset = async (id: string): Promise<void> => {
  throw new Error('Not implemented');
};

export const getAssetsByCategory = async (category: string): Promise<Asset[]> => {
  return [];
};

export const getAssetsByStatus = async (status: string): Promise<Asset[]> => {
  return [];
};

export const getAvailableAssets = async (): Promise<Asset[]> => {
  return [];
};

export const getBorrowedAssets = async (): Promise<Asset[]> => {
  return [];
};

export const borrowAsset = async (id: string, borrowData: any): Promise<Asset> => {
  throw new Error('Not implemented');
};

export const returnAsset = async (id: string, returnData: any): Promise<Asset> => {
  throw new Error('Not implemented');
};

export const addMaintenanceRecord = async (id: string, maintenanceData: any): Promise<Asset> => {
  throw new Error('Not implemented');
};

export default {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetsByCategory,
  getAssetsByStatus,
  getAvailableAssets,
  getBorrowedAssets,
  borrowAsset,
  returnAsset,
  addMaintenanceRecord,
};