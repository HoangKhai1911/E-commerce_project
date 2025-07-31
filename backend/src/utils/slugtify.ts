export function slugify(text: string): string {
  if (!text) return '';
  text = text.toString().toLowerCase().trim();
  text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Loại bỏ dấu tiếng Việt
  text = text.replace(/đ/g, "d").replace(/Đ/g, "D"); // Xử lý chữ 'đ'
  text = text.replace(/[^a-z0-9\s-]/g, "") // Chỉ giữ lại chữ cái, số, khoảng trắng, gạch ngang
             .replace(/[\s_-]+/g, '-')     // Thay thế nhiều khoảng trắng/gạch ngang bằng một
             .replace(/^-+|-+$/g, '');     // Loại bỏ gạch ngang ở đầu/cuối
  return text;
}