export const generateImageUrl = (req, fileName) => {
  // Nếu fileName không tồn tại, rỗng, null, undefined, hoặc toàn khoảng trắng thì trả về nguyên giá trị
  if (!fileName || typeof fileName !== "string" || fileName.trim() === "") {
    return fileName;
  }

  const API_PREFIX =
    process.env.RENDER_EXTERNAL_URL || `${req.protocol}://${req.get("host")}`;

  // Đảm bảo URL luôn là HTTPS nếu đang chạy trên Render và không có RENDER_EXTERNAL_URL
  if (
    !process.env.RENDER_EXTERNAL_URL &&
    req.protocol === "http" &&
    req.get("x-forwarded-proto") === "https"
  ) {
    API_PREFIX = `https://${req.get("host")}`;
  }
  return `${API_PREFIX}/uploads/${fileName}`;
};
