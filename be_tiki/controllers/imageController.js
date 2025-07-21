import path from "path";
import fs from "fs";
import db from "../models/index.js";

// upload ảnh
export async function uploadImages(req, res) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "Vui lòng chọn ảnh để upload" });
  }

  if (req.files.length > 10) {
    return res
      .status(400)
      .json({ message: "Tối đa chỉ được upload 10 ảnh mỗi lần" });
  }

  const imagePaths = req.files.map((file) => ({
    filename: file.filename,
    size: (file.size / 1024).toFixed(2) + " KB",
  }));

  return res.status(200).json({
    message: "Upload thành công",
    images: imagePaths,
  });
}

// xem ảnh đã upload
export async function viewImage(req, res) {
  const { fileName } = req.params;
  const imagePath = path.join(process.cwd(), "uploads", fileName);

  try {
    await fs.promises.access(imagePath, fs.constants.F_OK);
    res.sendFile(imagePath);
  } catch (err) {
    const error = new Error("Image not found");
    error.statusCode = 404;
    throw error;
  }
}

// xóa ảnh
export async function deleteImage(req, res) {
  const { fileName } = req.body;
  const imagePath = path.join(process.cwd(), "uploads", fileName);

  const usedIn = [];

  const modelEntries = Object.entries(db).filter(
    ([name, model]) =>
      typeof model.findOne === "function" &&
      !["sequelize", "Sequelize"].includes(name)
  );

  for (const [modelName, model] of modelEntries) {
    const attributes = Object.keys(model.rawAttributes);
    const imageFields = attributes.filter((field) =>
      ["image", "image_url", "avatar"].some((key) =>
        field.toLowerCase().includes(key)
      )
    );

    for (const field of imageFields) {
      const found = await model.findOne({ where: { [field]: fileName } });
      if (found) {
        usedIn.push(`${modelName}.${field}`);
        break;
      }
    }
  }

  if (usedIn.length > 0) {
    const error = new Error(
      `Không thể xóa ảnh. Ảnh đang được sử dụng trong: ${usedIn.join(", ")}`
    );
    error.statusCode = 400;
    throw error;
  }

  try {
    await fs.promises.access(imagePath, fs.constants.F_OK);
    await fs.promises.unlink(imagePath);
    return res.status(200).json({ message: "Xóa ảnh thành công" });
  } catch (err) {
    if (err.code === "ENOENT") {
      const error = new Error("Ảnh không tồn tại");
      error.statusCode = 404;
      throw error;
    } else {
      const error = new Error("Lỗi khi xóa ảnh");
      error.statusCode = 500;
      throw error;
    }
  }
}
