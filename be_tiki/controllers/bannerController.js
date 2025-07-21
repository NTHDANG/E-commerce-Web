import { Sequelize } from "sequelize";
const { Op } = Sequelize;
import db from "../models/index.js";
import { generateImageUrl } from "../helpers/imageHelper.js";

// Hàm kiểm tra và chuẩn bị điều kiện where
const prepareWhereClause = (search = "") => {
  const whereClause = {};
  if (search.trim()) {
    whereClause.name = { [Op.like]: `%${search}%` };
  }
  return whereClause;
};

// Hàm xử lý và trả về dữ liệu banner với URL ảnh
const formatBannerData = (banner, req) => {
  const data = banner.toJSON();
  data.image = generateImageUrl(req, data.image);
  return data;
};

// Lấy tất cả banner, hỗ trợ tìm kiếm và phân trang
export async function getBanners(req, res) {
  const { search = "", page = 1 } = req.query;
  const pageSize = 6; // Số lượng banner mỗi trang
  const offset = (parseInt(page, 10) - 1) * pageSize;

  const whereClause = prepareWhereClause(search);

  // Thực hiện truy vấn đồng thời để tăng hiệu năng
  const [bannerList, totalBanners] = await Promise.all([
    db.Banner.findAll({
      where: whereClause,
      limit: pageSize,
      offset,
    }),
    db.Banner.count({ where: whereClause }),
  ]);

  const bannerListWithUrl = bannerList.map((banner) =>
    formatBannerData(banner, req)
  );

  res.status(200).json({
    message: "Lấy danh sách banner thành công!",
    data: bannerListWithUrl,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalBanners / pageSize),
    total: totalBanners,
  });
}

// Lấy banner theo ID
export async function getBannerById(req, res) {
  const { id } = req.params;
  const banner = await db.Banner.findByPk(id, {
    include: { model: db.BannerDetail, as: "banner_details" },
  });

  if (!banner) {
    return res.status(404).json({ message: "Không tìm thấy banner." });
  }

  const bannerData = formatBannerData(banner, req);

  res.status(200).json({
    message: "Lấy banner thành công!",
    data: bannerData,
  });
}

// Thêm mới banner
export async function insertBanner(req, res) {
  const { name } = req.body;

  // Kiểm tra banner đã tồn tại
  const existingBanner = await db.Banner.findOne({
    where: { name: name.trim() },
  });
  if (existingBanner) {
    return res.status(400).json({
      message: "Banner đã tồn tại với tên này.",
    });
  }

  const bannerData = {
    ...req.body,
    image: req.body.image, // Lưu filename từ client
    status: "ACTIVE", // Mặc định trạng thái là ACTIVE
  };

  const banner = await db.Banner.create(bannerData);
  const bannerDataRes = formatBannerData(banner, req);

  res.status(201).json({
    message: "Thêm banner thành công!",
    data: bannerDataRes,
  });
}

// Cập nhật banner
export async function updateBanner(req, res) {
  const { id } = req.params;
  const { name, image } = req.body;

  const updateData = {};

  // Kiểm tra và cập nhật tên nếu có
  if (name !== undefined) {
    const existing = await db.Banner.findOne({
      where: {
        name,
        id: { [Op.ne]: id }, // Loại trừ chính banner đang cập nhật
      },
    });

    if (existing) {
      return res.status(400).json({
        message: "Tên banner đã tồn tại, vui lòng chọn tên khác.",
      });
    }
    updateData.name = name;
  }

  // Cập nhật ảnh nếu có
  if (image !== undefined) {
    updateData.image = image;
  }

  const [updatedRows] = await db.Banner.update(updateData, {
    where: { id },
  });

  if (!updatedRows) {
    return res.status(404).json({
      message: "Không tìm thấy banner để cập nhật.",
    });
  }

  const updated = await db.Banner.findByPk(id);
  const updatedData = formatBannerData(updated, req);

  res.status(200).json({
    message: "Cập nhật banner thành công!",
    data: updatedData,
  });
}

// Xóa banner và BannerDetail
export async function deleteBanner(req, res) {
  const transaction = await db.sequelize.transaction();

  try {
    const { id } = req.params;

    await db.BannerDetail.destroy({
      where: { banner_id: id },
      transaction,
    });

    const deleted = await db.Banner.destroy({
      where: { id },
      transaction,
    });

    if (!deleted) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Không tìm thấy banner để xóa.",
      });
    }

    await transaction.commit();
    res.status(200).json({
      message: "Xóa banner thành công!",
    });
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({
      message: "Lỗi khi xóa banner.",
      error: err.message,
    });
  }
}
