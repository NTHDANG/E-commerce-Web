import { Sequelize } from "sequelize";
const { Op } = Sequelize;
import db from "../models/index.js";
import { generateImageUrl } from "../helpers/imageHelper.js";

// Hàm chuẩn bị điều kiện where cho tìm kiếm và lọc
const prepareWhereClause = (search = "", cart_id) => {
  const whereClause = {};
  if (search.trim() !== "") {
    whereClause[Op.or] = [{ cart_id: { [Op.like]: `%${search}%` } }];
  }
  if (cart_id) {
    whereClause.cart_id = cart_id;
  }
  return whereClause;
};

// Hàm định dạng dữ liệu CartItem với URL ảnh (nếu có)
const formatCartItemData = (item, req) => {
  const data = item.toJSON();
  if (data.product_variant_value && data.product_variant_value.image) {
    data.product_variant_value.image = generateImageUrl(
      req,
      data.product_variant_value.image
    );
  }
  return data;
};

// Lấy tất cả CartItems, hỗ trợ tìm kiếm và phân trang
export async function getCartItems(req, res) {
  const { search = "", page = 1, cart_id } = req.query;
  const pageSize = 5; // Số lượng item mỗi trang
  const offset = (parseInt(page, 10) - 1) * pageSize;

  const whereClause = prepareWhereClause(search, cart_id);

  // Thực hiện truy vấn đồng thời để tăng hiệu năng
  const [items, totalItems] = await Promise.all([
    db.CartItem.findAll({
      where: whereClause,
      limit: pageSize,
      offset,
      include: [
        {
          model: db.ProductVariantValue,
          as: "product_variant_value",
          attributes: ["id", "price", "stock", "sku", "image"],
        },
      ],
    }),
    db.CartItem.count({ where: whereClause }),
  ]);

  const formattedItems = items.map((item) => formatCartItemData(item, req));

  res.status(200).json({
    message: "Lấy danh sách sản phẩm trong giỏ thành công!",
    data: formattedItems,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalItems / pageSize),
    total: totalItems,
  });
}

// Lấy CartItem theo ID
export async function getCartItemById(req, res) {
  const { id } = req.params;
  const item = await db.CartItem.findByPk(id, {
    include: [
      {
        model: db.ProductVariantValue,
        as: "product_variant_value",
        attributes: ["id", "price", "stock", "sku"],
        include: [
          {
            model: db.Product,
            as: "product",
            attributes: ["name"],
          },
        ],
      },
    ],
  });

  if (!item) {
    return res.status(404).json({ message: "Không tìm thấy item trong giỏ" });
  }

  const itemData = item.toJSON();
  let formattedItem = { ...itemData };

  // Xử lý SKU để tạo display name
  const allVariantValueIds = new Set();
  const sku = itemData.product_variant_value?.sku;
  if (sku) {
    sku
      .split("-")
      .map(Number)
      .forEach((id) => allVariantValueIds.add(id));
  }

  const variantValueMap = new Map();
  if (allVariantValueIds.size > 0) {
    const variantValues = await db.VariantValue.findAll({
      where: { id: { [Op.in]: Array.from(allVariantValueIds) } },
      attributes: ["id", "value"],
    });
    variantValues.forEach((vv) => variantValueMap.set(vv.id, vv.value));
  }

  const formattedProductVariantValue = {};
  if (formattedItem.product_variant_value) {
    const productVariantValue = formattedItem.product_variant_value;
    let displayVariantName = "Không xác định";

    if (sku) {
      const variantValueIdsFromSku = sku
        .split("-")
        .map((idStr) => parseInt(idStr.trim(), 10));
      const displayParts = variantValueIdsFromSku
        .map((vId) => variantValueMap.get(vId))
        .filter(Boolean);
      displayVariantName = displayParts.join(" ");
    }

    formattedProductVariantValue.name = displayVariantName;
    formattedProductVariantValue.id = productVariantValue.id;
    formattedProductVariantValue.price = parseFloat(productVariantValue.price);
    formattedProductVariantValue.stock = productVariantValue.stock;
  }

  formattedItem.product_variant_value = formattedProductVariantValue;

  res.status(200).json({
    message: "Lấy thông tin item thành công!",
    data: formattedItem,
  });
}

// Thêm hoặc cập nhật CartItem
export async function insertCartItem(req, res) {
  const { product_variant_id, cart_id, quantity } = req.body;

  // 1. Kiểm tra tồn tại của giỏ hàng
  const cart = await db.Cart.findByPk(cart_id);
  if (!cart) {
    return res.status(400).json({ message: "Giỏ hàng không tồn tại!" });
  }

  // 2. Kiểm tra tồn tại của product variant
  const productVariant = await db.ProductVariantValue.findByPk(
    product_variant_id
  );
  if (!productVariant) {
    return res
      .status(400)
      .json({ message: "Phiên bản sản phẩm không tồn tại!" });
  }

  // 3. Kiểm tra và xử lý item hiện có
  const existingItem = await db.CartItem.findOne({
    where: { cart_id, product_variant_id },
  });

  if (existingItem) {
    if (quantity === 0) {
      await existingItem.destroy();
      return res
        .status(200)
        .json({ message: "Đã xóa item khỏi giỏ hàng do quantity = 0" });
    } else if (quantity > productVariant.stock) {
      return res.status(400).json({
        message: `Số lượng yêu cầu vượt quá tồn kho! Chỉ còn ${productVariant.stock} sản phẩm.`,
      });
    } else {
      existingItem.quantity = quantity;
      await existingItem.save();
      return res.status(200).json({
        message: "Cập nhật số lượng item trong giỏ thành công!",
        data: existingItem,
      });
    }
  }

  // 4. Thêm mới item
  if (quantity === 0) {
    return res
      .status(400)
      .json({ message: "Không thể thêm item với quantity = 0" });
  } else if (quantity > productVariant.stock) {
    return res.status(400).json({
      message: `Số lượng yêu cầu vượt quá tồn kho! Chỉ còn ${productVariant.stock} sản phẩm.`,
    });
  }

  const newItem = await db.CartItem.create({
    product_variant_id,
    cart_id,
    quantity,
  });
  return res.status(201).json({
    message: "Thêm item vào giỏ thành công!",
    data: newItem,
  });
}

// Xóa CartItem
export async function deleteCartItem(req, res) {
  const { id } = req.params;
  const deletedRows = await db.CartItem.destroy({ where: { id } });

  if (deletedRows === 0) {
    return res.status(404).json({ message: "Không tìm thấy item để xóa" });
  }

  res.status(200).json({ message: "Xóa item khỏi giỏ thành công!" });
}
