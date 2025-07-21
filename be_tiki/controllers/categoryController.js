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

// Hàm định dạng dữ liệu danh mục với URL ảnh
const formatCategoryData = (category, req) => {
  const data = category.toJSON();
  data.image = generateImageUrl(req, data.image);
  return data;
};

// Lấy danh sách danh mục, hỗ trợ tìm kiếm và phân trang
export async function getCategories(req, res) {
  const { search = "", page = 1 } = req.query;
  const pageSize = 6; // Số lượng danh mục mỗi trang
  const offset = (parseInt(page, 10) - 1) * pageSize;

  const whereClause = prepareWhereClause(search);

  // Thực hiện truy vấn đồng thời để tăng hiệu năng
  const [categories, totalCategories] = await Promise.all([
    db.Category.findAll({
      where: whereClause,
      limit: pageSize,
      offset,
    }),
    db.Category.count({ where: whereClause }),
  ]);

  const transformedCategories = categories.map((category) =>
    formatCategoryData(category, req)
  );

  res.status(200).json({
    message: "Lấy danh sách danh mục thành công!",
    data: transformedCategories,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalCategories / pageSize),
    total: totalCategories,
  });
}

// Lấy danh mục theo ID
export async function getCategoryById(req, res) {
  const { id } = req.params;
  const category = await db.Category.findByPk(id);

  if (!category) {
    return res.status(404).json({
      message: "Danh mục không tìm thấy",
    });
  }

  const data = formatCategoryData(category, req);

  res.status(200).json({
    message: "Lấy thông tin danh mục thành công!",
    data,
  });
}

// Thêm mới danh mục
export async function insertCategory(req, res) {
  const categoryData = {
    ...req.body,
    // Lưu filename từ client, không chỉnh sửa nội dung
  };

  const category = await db.Category.create(categoryData);
  const data = formatCategoryData(category, req);

  res.status(201).json({
    message: "Thêm mới danh mục thành công!",
    data,
  });
}

// Cập nhật danh mục
export async function updateCategory(req, res) {
  const { id } = req.params;
  const { name, image } = req.body;

  const updateData = {};

  if (name !== undefined) {
    // Kiểm tra trùng tên với danh mục khác
    const existingCategory = await db.Category.findOne({
      where: {
        name,
        id: { [Op.ne]: id },
      },
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Tên danh mục đã tồn tại.",
      });
    }

    updateData.name = name;
  }

  if (image !== undefined) {
    updateData.image = image; // Lưu filename từ client
  }

  const [updatedRows] = await db.Category.update(updateData, {
    where: { id },
  });

  if (updatedRows === 0) {
    return res.status(404).json({
      message: "Không tìm thấy danh mục để cập nhật.",
    });
  }

  const updatedCategory = await db.Category.findByPk(id);
  const data = formatCategoryData(updatedCategory, req);

  res.status(200).json({
    message: "Cập nhật danh mục thành công!",
    data,
  });
}

// Xóa danh mục
export async function deleteCategory(req, res) {
  const { id } = req.params;
  const deletedRows = await db.Category.destroy({
    where: { id },
  });

  if (deletedRows === 0) {
    return res.status(404).json({
      message: "Không tìm thấy danh mục để xóa.",
    });
  }

  res.status(200).json({
    message: "Xóa danh mục thành công!",
  });
}
