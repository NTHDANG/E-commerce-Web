import path from "path";
import fs from "fs";

// Ktra ảnh có trong local ko
export default function validateImageExists(req, res, next) {
  const imageName = req.body.image;

  // Nếu ko có image hoặc là link online thì bỏ qua
  if (
    !imageName ||
    imageName.startsWith("http://") ||
    imageName.startsWith("https://")
  ) {
    return next();
  }

  // Tạo path tới thư mục uploads
  const imagePath = path.join(process.cwd(), "uploads", imageName);

  // Nếu file không tồn tại thì trả lỗi
  if (!fs.existsSync(imagePath)) {
    const error = new Error("Tệp hình ảnh không tồn tại");
    error.statusCode = 404;
    return next(error);
  }

  // Nếu hợp lệ, tiếp tục
  next();
}
