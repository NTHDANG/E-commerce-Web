import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  // nơi lưu trữ ảnh
  destination: (req, file, cb) => {
    const destinationPath = path.join(process.cwd(), "uploads/");
    cb(null, destinationPath);
  },
  // trả về tên các file ảnh = Timestamp + tên gốc
  filename: (req, file, cb) => {
    const newFileName = `${Date.now()}-${file.originalname}`;
    cb(null, newFileName);
  },
});

// ktra lỗi và trả về thông báo lỗi
function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Chỉ được upload ảnh"), false);
  } else {
    cb(null, true);
  }
}

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // tối đa 5MB mỗi ảnh
  },
  fileFilter,
});

export const uploadImagesMiddleware = upload.array("images", 10); // tối đa 10 ảnh
