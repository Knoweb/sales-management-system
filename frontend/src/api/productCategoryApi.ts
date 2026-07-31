import { apiClient as api } from '../services/Api';

export interface ProductCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface ProductCategoryRequest {
  code: string;
  name: string;
  description?: string;
  active: boolean;
}

export const ProductCategoryApi = {
  getActiveCategories: async (): Promise<ProductCategory[]> => {
    const res = await api.get('/product-categories');
    return res.data;
  },

  getAllCategories: async (): Promise<ProductCategory[]> => {
    const res = await api.get('/product-categories/all');
    return res.data;
  },

  createCategory: async (data: ProductCategoryRequest): Promise<ProductCategory> => {
    const res = await api.post('/product-categories', data);
    return res.data;
  },

  updateCategory: async (id: string, data: ProductCategoryRequest): Promise<ProductCategory> => {
    const res = await api.put(`/product-categories/${id}`, data);
    return res.data;
  }
};
