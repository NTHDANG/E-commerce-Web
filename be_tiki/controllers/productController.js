import { Sequelize } from "sequelize";
const { Op } = Sequelize;
import db from "../models/index.js";
import {
  handleProductAttributes,
  getProductWithAttributes,
  handleProductVariants,
  handleProductReferences,
} from "../helpers/productAttributeVariant.js";

// Hàm chuẩn bị điều kiện where cho tìm kiếm
const prepareWhereClause = (search = "") => {
  const whereClause = {};
  if (search.trim() !== "") {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
      { specification: { [Op.like]: `%${search}%` } },
    ];
  }
  return whereClause;
};

// Lấy danh sách sản phẩm, hỗ trợ tìm kiếm và phân trang
export async function getProducts(req, res) {
  const {
    page = 1,
    limit = 12,
    category,
    brand,
    minPrice,
    maxPrice,
    sortBy,
    order,
    search,
  } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = {};
  if (category) {
    whereClause.category_id = category;
  }
  if (brand) {
    whereClause.brand_id = brand;
  }

  let orderClause = [];
  if (sortBy && order) {
    orderClause.push([sortBy, order.toUpperCase()]);
  }

  if (search) {
    whereClause.name = {
      [Op.like]: `%${search}%`,
    };
  }

  try {
    const { count, rows: products } = await db.Product.findAndCountAll({
      attributes: [
        "id",
        "name",
        "description",
        "brand_id",
        "category_id",
        "stock",
        "total_ratings",
        "total_sold",
      ],
      where: whereClause,
      include: [
        {
          model: db.Category,
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: db.Brand,
          as: "brand",
          attributes: ["id", "name"],
        },
        {
          model: db.ProductImage,
          as: "product_images",
          attributes: ["id", "image_url"],
          required: false,
        },
        {
          model: db.ProductVariantValue,
          as: "product_variant_values",
          required: false,
        },
      ],
      distinct: true,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: orderClause,
    });

    const totalPages = Math.ceil(count / limit);
    const totalProducts = count;

    const productsWithFullDetails = await Promise.all(
      products.map(async (product) => {
        return await getProductWithAttributes(product.id);
      })
    );

    res.status(200).json({
      products: productsWithFullDetails,
      currentPage: parseInt(page),
      totalPages,
      totalProducts,
    });
  } catch (error) {
    console.error("Error in getProducts function:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Lấy sản phẩm theo ID, kèm ảnh phụ và attributes
export async function getProductById(req, res) {
  const { id } = req.params;

  try {
    const productData = await getProductWithAttributes(id);

    if (!productData) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    res.status(200).json({
      message: "Lấy thông tin sản phẩm thành công!",
      data: productData,
    });
  } catch (error) {
    console.error("Error in getProductById function:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Thêm mới sản phẩm
export async function insertProduct(req, res) {
  const {
    attributes = [],
    variants,
    variant_values,
    product_variant_values,
  } = req.body;

  const t = await db.sequelize.transaction();
  try {
    const product = await db.Product.create(req.body, { transaction: t });

    await handleProductAttributes(product.id, attributes, t);

    await handleProductVariants(
      product.id,
      variants,
      variant_values,
      product_variant_values,
      t
    );

    await t.commit();

    // Hiển thị kết quả
    const productData = await getProductWithAttributes(product.id);

    res.status(201).json({
      message: "Thêm mới sản phẩm thành công!",
      data: productData,
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      message: "Lỗi khi thêm mới sản phẩm.",
      error: error.message,
    });
  }
}

// Cập nhật sản phẩm
export async function updateProduct(req, res) {
  const { id } = req.params;

  // Lấy toàn bộ req.body để kiểm tra các trường
  const requestBody = req.body;

  const currentProduct = await db.Product.findByPk(id);
  if (!currentProduct) {
    return res.status(404).json({
      message: "Không tìm thấy sản phẩm để cập nhật.",
    });
  }

  const updateFields = {};
  const productDirectFields = [
    "name",
    "description",
    "brand_id",
    "category_id",
    "stock",
    "total_ratings",
    "total_sold",
  ];

  for (const field of productDirectFields) {
    // Kiểm tra xem trường có tồn tại (khác undefined) trong requestBody hay không
    if (requestBody[field] !== undefined) {
      updateFields[field] = requestBody[field];
    }
  }

  // Kiểm tra tên sản phẩm trùng lặp chỉ khi 'name' được cung cấp
  if (updateFields.name !== undefined) {
    const existingProduct = await db.Product.findOne({
      where: {
        name: updateFields.name,
        id: { [Op.ne]: id },
      },
    });

    if (existingProduct) {
      return res.status(400).json({
        message: "Tên sản phẩm đã tồn tại.",
      });
    }
  }

  const t = await db.sequelize.transaction();
  try {
    // Chỉ cập nhật nếu có bất kỳ trường nào trong updateFields
    if (Object.keys(updateFields).length > 0) {
      await db.Product.update(updateFields, { where: { id }, transaction: t });
    }

    await handleProductAttributes(id, requestBody.attributes, t);
    await handleProductVariants(
      id,
      requestBody.variants,
      requestBody.variant_values,
      requestBody.product_variant_values,
      t
    );

    await t.commit();

    // Hiển thị kết quả
    const productData = await getProductWithAttributes(id);

    res.status(200).json({
      message: "Cập nhật sản phẩm thành công!",
      data: productData,
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      message: "Lỗi khi cập nhật sản phẩm.",
      error: error.message,
    });
  }
}

// Xóa sản phẩm
export async function deleteProduct(req, res) {
  const { id } = req.params;
  const t = await db.sequelize.transaction();

  // Kiểm tra và xử lý tất cả tham chiếu
  const { blockingReferences } = await handleProductReferences(id, t);

  if (blockingReferences.length > 0) {
    await t.rollback();
    return res.status(400).json({
      message: `Không thể xóa sản phẩm vì đang được sử dụng trong: ${blockingReferences.join(
        ", "
      )}`,
    });
  }

  // Xóa sản phẩm chính
  await db.Product.destroy({ where: { id }, transaction: t });
  await t.commit();

  res.status(200).json({ message: "Xóa sản phẩm thành công" });
}
