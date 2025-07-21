import db from "../models/index.js";
import { Sequelize } from "sequelize";
const { Op } = Sequelize;
import { generateImageUrl } from "../helpers/imageHelper.js";

// Hàm chuẩn bị điều kiện where cho tìm kiếm
const prepareWhereClause = (search = "") => {
  const whereClause = {};
  if (search.trim() !== "") {
    whereClause[Op.or] = [
      { "$product.name$": { [Op.like]: `%${search}%` } },
      { "$banner.name$": { [Op.like]: `%${search}%` } },
    ];
  }
  return whereClause;
};

// Lấy tất cả BannerDetail, hỗ trợ tìm kiếm và phân trang
export async function getBannerDetails(req, res) {
  const { search = "", page = 1 } = req.query;
  const pageSize = 5; // Số lượng bản ghi mỗi trang
  const offset = (parseInt(page, 10) - 1) * pageSize;

  const whereClause = prepareWhereClause(search);

  // Thực hiện truy vấn đồng thời để tăng hiệu năng
  const [data, total] = await Promise.all([
    db.BannerDetail.findAll({
      where: whereClause,
      include: [{ model: db.Product, as: "product" }, { model: db.Banner, as: "banner" }],
      limit: pageSize,
      offset,
    }),
    db.BannerDetail.count({
      where: whereClause,
      include: [{ model: db.Product, as: "product" }, { model: db.Banner, as: "banner" }],
    }),
  ]);

  // Thêm URL ảnh nếu cần (tùy chỉnh theo logic hiện tại)
  const formattedData = data.map((detail) => {
    const detailData = detail.toJSON();
    if (detailData.product?.image) {
      detailData.product.image = generateImageUrl(
        req,
        detailData.product.image
      );
    }
    if (detailData.banner?.image) {
      detailData.banner.image = generateImageUrl(req, detailData.banner.image);
    }
    return detailData;
  });

  res.status(200).json({
    message: "Lấy danh sách liên kết banner - sản phẩm thành công!",
    data: formattedData,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(total / pageSize),
    total,
  });
}

// Lấy BannerDetail theo ID
export async function getBannerDetailById(req, res) {
  const { id } = req.params;
  const detail = await db.BannerDetail.findByPk(id, {
    include: [{ model: db.Product, as: "product" }, { model: db.Banner, as: "banner" }], // Bao gồm thông tin liên quan
  });

  if (!detail) {
    return res
      .status(404)
      .json({ message: "Không tìm thấy bản ghi chi tiết." });
  }

  const detailData = detail.toJSON();
  // Thêm URL ảnh nếu có
  if (detailData.product?.image) {
    detailData.product.image = generateImageUrl(req, detailData.product.image);
  }
  if (detailData.banner?.image) {
    detailData.banner.image = generateImageUrl(req, detailData.banner.image);
  }

  res.status(200).json({
    message: "Lấy chi tiết bản ghi thành công!",
    data: detailData,
  });
}

// Thêm mới BannerDetail, kiểm tra tồn tại và không trùng
export async function insertBannerDetail(req, res) {
  const { product_id, banner_id } = req.body;

  // Kiểm tra tồn tại của Product và Banner
  const [product, banner] = await Promise.all([
    db.Product.findByPk(product_id),
    db.Banner.findByPk(banner_id),
  ]);

  if (!product || !banner) {
    return res.status(400).json({
      message: "Sản phẩm hoặc banner không tồn tại.",
    });
  }

  // Kiểm tra cặp product_id - banner_id có bị trùng không
  const existing = await db.BannerDetail.findOne({
    where: { product_id, banner_id },
  });

  if (existing) {
    return res.status(409).json({
      message: "Liên kết sản phẩm - banner đã tồn tại.",
    });
  }

  const detail = await db.BannerDetail.create({ product_id, banner_id });

  res.status(201).json({
    message: "Tạo liên kết sản phẩm - banner thành công!",
    data: detail,
  });
}

// Cập nhật BannerDetail
export async function updateBannerDetail(req, res) {
  const { id } = req.params;
  const { product_id, banner_id } = req.body;

  // Kiểm tra tồn tại của Product và Banner
  const [product, banner] = await Promise.all([
    db.Product.findByPk(product_id),
    db.Banner.findByPk(banner_id),
  ]);

  if (!product || !banner) {
    return res.status(400).json({
      message: "Sản phẩm hoặc banner không tồn tại.",
    });
  }

  // Kiểm tra trùng lặp với bản ghi khác
  const duplicate = await db.BannerDetail.findOne({
    where: {
      product_id,
      banner_id,
      id: { [Op.ne]: id },
    },
  });

  if (duplicate) {
    return res.status(409).json({
      message: "Liên kết sản phẩm - banner đã tồn tại ở bản ghi khác.",
    });
  }

  const [updated] = await db.BannerDetail.update(
    { product_id, banner_id },
    { where: { id } }
  );

  if (!updated) {
    return res.status(404).json({
      message: "Không tìm thấy bản ghi để cập nhật.",
    });
  }

  const updatedDetail = await db.BannerDetail.findByPk(id, {
    include: [{ model: db.Product, as: "product" }, { model: db.Banner, as: "banner" }],
  });
  const updatedData = updatedDetail.toJSON();
  // Thêm URL ảnh nếu có
  if (updatedData.product?.image) {
    updatedData.product.image = generateImageUrl(
      req,
      updatedData.product.image
    );
  }
  if (updatedData.banner?.image) {
    updatedData.banner.image = generateImageUrl(req, updatedData.banner.image);
  }

  res.status(200).json({
    message: "Cập nhật liên kết thành công!",
    data: updatedData,
  });
}

// Xóa BannerDetail
export async function deleteBannerDetail(req, res) {
  const { id } = req.params;
  const deleted = await db.BannerDetail.destroy({ where: { id } });

  if (!deleted) {
    return res.status(404).json({
      message: "Không tìm thấy bản ghi để xoá.",
    });
  }

  res.status(200).json({
    message: "Xóa bản ghi thành công!",
  });
}
