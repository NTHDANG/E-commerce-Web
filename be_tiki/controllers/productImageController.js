import db from "../models/index.js";
import path from "path";
import fs from "fs";
import { generateImageUrl } from "../helpers/imageHelper.js";

// Lấy danh sách hình ảnh sản phẩm có phân trang, tìm kiếm (alt là image_url), kèm Product
export async function getProductImages(req, res) {
  const { product_id, page = 1 } = req.query;
  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  const whereClause = {};
  if (product_id) {
    whereClause.product_id = product_id;
  }

  const [images, total] = await Promise.all([
    db.ProductImage.findAll({
      where: whereClause,
      limit: pageSize,
      offset,
      order: [["id", "DESC"]],
    }),
    db.ProductImage.count({ where: whereClause }),
  ]);

  const imagesWithFullUrl = images.map((img) => ({
    ...img.toJSON(),
    image_url: generateImageUrl(req, img.image_url),
  }));

  return res.status(200).json({
    message: "Lấy danh sách hình ảnh sản phẩm thành công!",
    data: imagesWithFullUrl,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(total / pageSize),
    total,
  });
}

// Lấy 1 hình ảnh theo ID kèm thông tin Product
export async function getProductImageById(req, res) {
  const { id } = req.params;

  const image = await db.ProductImage.findByPk(id, {
    include: [
      {
        model: db.Product,
        as: "product",
        attributes: ["id", "name"],
      },
    ],
  });

  if (!image) {
    return res.status(404).json({
      message: "Không tìm thấy hình ảnh sản phẩm.",
    });
  }

  const imageWithFullUrl = {
    ...image.toJSON(),
    image_url: generateImageUrl(req, image.image_url),
  };

  return res.status(200).json({
    message: "Lấy chi tiết hình ảnh sản phẩm thành công!",
    data: imageWithFullUrl,
  });
}

// Thêm mới hình ảnh
export async function insertProductImage(req, res) {
  const { image_url, product_id } = req.body;

  const existingImage = await db.ProductImage.findOne({
    where: { image_url, product_id },
  });

  if (existingImage) {
    return res.status(400).json({
      message: "Ảnh này đã tồn tại cho sản phẩm này",
    });
  }

  const imagePath = path.join(__dirname, "../uploads/", image_url);

  if (!fs.existsSync(imagePath)) {
    return res.status(400).json({
      message:
        "Ảnh không tồn tại trong thư mục uploads. Vui lòng upload trước.",
    });
  }

  const image = await db.ProductImage.create({ image_url, product_id });

  const imageWithFullUrl = {
    ...image.toJSON(),
    image_url: generateImageUrl(req, image.image_url),
  };

  return res.status(201).json({
    message: "Thêm hình ảnh sản phẩm thành công!",
    data: imageWithFullUrl,
  });
}

// Xoá hình ảnh theo ID
export async function deleteProductImage(req, res) {
  const { id } = req.params;

  const deletedRows = await db.ProductImage.destroy({
    where: { id },
  });

  if (deletedRows === 0) {
    return res.status(404).json({
      message: "Không tìm thấy hình ảnh để xóa.",
    });
  }

  return res.status(200).json({
    message: "Xóa hình ảnh sản phẩm thành công!",
  });
}
