// src/services/sourceService.ts
import apiClient from '@/lib/api'; // Sử dụng instance đã được cấu hình với interceptor

// Interface cho dữ liệu logo từ Strapi
interface Logo {
  id: number;
  url: string;
}

// Định nghĩa interface cho Source, khớp với cấu trúc dữ liệu từ Strapi
interface Source {
  id: number;
  name: string;
  URL: string;
  logo?: Logo; // Logo có thể không có
}

export const sourceService = {
  /**
   * Lấy tất cả các nguồn từ API.
   * @param params Các tham số truy vấn tùy chọn (ví dụ: { sort: 'id:asc' })
   * @returns Promise<Source[]> Mảng các đối tượng nguồn
   */
  async getAll(params?: Record<string, any>): Promise<Source[]> { // 🔴 Đã thêm tham số 'params' tùy chọn
    try {
      // Gửi yêu cầu GET đến endpoint /sources với các tham số tùy chọn
      // Thêm populate=logo để lấy dữ liệu logo
      const response = await apiClient.get('/sources', { 
        params: { ...params, populate: 'logo' } 
      });
      // Ánh xạ dữ liệu từ phản hồi của Strapi để phù hợp với interface Source
      return response.data.data.map((item: any) => ({
        id: item.id,
        name: item.attributes.name,
        URL: item.attributes.URL,
        logo: item.attributes.logo?.data?.attributes, // Lấy dữ liệu logo, kiểm tra null
      }));
    } catch (error) {
      console.error('Error in sourceService.getAll:', error);
      throw error; // Ném lỗi để component gọi có thể xử lý
    }
  },

  /**
   * Tạo một nguồn mới.
   * @param data Dữ liệu của nguồn mới (name, url)
   * @returns Promise<Source> Đối tượng nguồn đã được tạo
   */
  async create(data: { name: string; URL: string }): Promise<Source> {
    try {
      const response = await apiClient.post('/sources', { data });
      return {
        id: response.data.data.id,
        name: response.data.data.attributes.name,
        URL: response.data.data.attributes.URL,
      };
    } catch (error) {
      console.error('Error in sourceService.create:', error);
      throw error;
    }
  },

  /**
   * Cập nhật một nguồn hiện có.
   * @param id ID của nguồn cần cập nhật
   * @param data Dữ liệu cập nhật (name, url)
   * @returns Promise<Source> Đối tượng nguồn đã được cập nhật
   */
  async update(id: number, data: { name?: string; URL?: string }): Promise<Source> {
    try {
      const response = await apiClient.put(`/sources/${id}`, { data });
      return {
        id: response.data.data.id,
        name: response.data.data.attributes.name,
        URL: response.data.data.attributes.URL,
      };
    } catch (error) {
      console.error('Error in sourceService.update:', error);
      throw error;
    }
  },

  /**
   * Xóa một nguồn.
   * @param id ID của nguồn cần xóa
   * @returns Promise<void>
   */
  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/sources/${id}`);
    } catch (error) {
      console.error('Error in sourceService.delete:', error);
      throw error;
    }
  },
};
