import { Sequelize } from "sequelize";
const { Op } = Sequelize;
import db from "../models/index.js";
import { generateImageUrl } from "../helpers/imageHelper.js";

// Hàm chuẩn bị điều kiện where cho tìm kiếm
const prepareWhereClause = (search = "") => {
  const whereClause = {};
  if (search.trim() !== "") {
    whereClause.name = { [Op.like]: `%${search}%` };
  }
  return whereClause;
};

// Hàm xử lý và trả về dữ liệu thương hiệu với URL ảnh
const formatBrandData = (brand, req) => {
  const data = brand.toJSON();
  data.image = generateImageUrl(req, data.image);
  return data;
};

// Lấy danh sách thương hiệu, hỗ trợ tìm kiếm và phân trang
export async function getBrands(req, res) {
  const { search = "", page = 1 } = req.query;
  const pageSize = 6; // Số lượng thương hiệu mỗi trang
  const offset = (parseInt(page, 10) - 1) * pageSize;

  const whereClause = prepareWhereClause(search);

  // Thực hiện truy vấn đồng thời để tăng hiệu năng
  const [brands, totalBrands] = await Promise.all([
    db.Brand.findAll({
      where: whereClause,
      limit: pageSize,
      offset,
    }),
    db.Brand.count({ where: whereClause }),
  ]);

  const transformedBrands = brands.map((brand) => formatBrandData(brand, req));

  res.status(200).json({
    message: "Lấy danh sách thương hiệu thành công!",
    data: transformedBrands,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalBrands / pageSize),
    total: totalBrands,
  });
}

// Lấy thương hiệu theo ID
export async function getBrandById(req, res) {
  const { id } = req.params;
  const brand = await db.Brand.findByPk(id);

  if (!brand) {
    return res.status(404).json({
      message: "Thương hiệu không tìm thấy",
    });
  }

  const data = formatBrandData(brand, req);

  res.status(200).json({
    message: "Lấy thông tin thương hiệu thành công!",
    data,
  });
}

// Thêm mới thương hiệu
export async function insertBrand(req, res) {
  const brandData = {
    ...req.body,
    // Lưu filename từ client, không chỉnh sửa nội dung
  };

  const brand = await db.Brand.create(brandData);
  const data = formatBrandData(brand, req);

  res.status(201).json({
    message: "Thêm mới thương hiệu thành công!",
    data,
  });
}

// Cập nhật thương hiệu
export async function updateBrand(req, res) {
  const { id } = req.params;
  const { name, image } = req.body;

  const updateData = {};

  if (name !== undefined) {
    // Kiểm tra trùng tên với thương hiệu khác
    const existingBrand = await db.Brand.findOne({
      where: {
        name,
        id: { [Op.ne]: id },
      },
    });

    if (existingBrand) {
      return res.status(400).json({
        message: "Tên thương hiệu đã tồn tại.",
      });
    }

    updateData.name = name;
  }

  if (image !== undefined) {
    updateData.image = image; // Lưu filename từ client
  }

  const [updatedRows] = await db.Brand.update(updateData, {
    where: { id },
  });

  if (updatedRows === 0) {
    return res.status(404).json({
      message: "Không tìm thấy thương hiệu để cập nhật.",
    });
  }

  const updatedBrand = await db.Brand.findByPk(id);
  const data = formatBrandData(updatedBrand, req);

  res.status(200).json({
    message: "Cập nhật thương hiệu thành công!",
    data,
  });
}

// Xóa thương hiệu
export async function deleteBrand(req, res) {
  const { id } = req.params;
  const deletedRows = await db.Brand.destroy({
    where: { id },
  });

  if (deletedRows === 0) {
    return res.status(404).json({
      message: "Không tìm thấy thương hiệu để xóa.",
    });
  }

  res.status(200).json({
    message: "Xóa thương hiệu thành công!",
  });
}
