import { Sequelize } from "sequelize";
import db from "../models/index.js";
import { Op } from "sequelize";
import { OrderStatus } from "../constants/index.js";
import { generateImageUrl } from "../helpers/imageHelper.js";

// Hàm chuẩn bị điều kiện where cho tìm kiếm và lọc
const prepareWhereClause = (user_id, session_id) => {
  const whereClause = {};
  if (user_id) {
    whereClause.user_id = user_id;
  } else if (session_id) {
    whereClause.session_id = session_id;
  } else {
    throw new Error("Thiếu user_id hoặc session_id để truy xuất đơn hàng.");
  }
  return whereClause;
};

// Hàm định dạng dữ liệu đơn hàng với thông tin variant value
const formatOrderData = (order, variantValueMap) => {
  const orderData = order.toJSON();
  orderData.order_details = order.order_details.map((detail) => {
    const productVariantValue = detail.product_variant_value;
    let name = "Không xác định";

    if (productVariantValue && productVariantValue.sku) {
      const [id1, id2] = productVariantValue.sku.split("-").map(Number);
      const value1 = variantValueMap.get(id1) || "Không xác định";
      const value2 = variantValueMap.get(id2) || "Không xác định";
      name = `${value1} ${value2}`;
    }

    return {
      ...detail.toJSON(),
      product_variant_value: productVariantValue
        ? {
            id: productVariantValue.id,
            name,
            price: parseFloat(productVariantValue.price),
            stock: productVariantValue.stock,
          }
        : null,
    };
  });
  return orderData;
};

// Lấy tất cả đơn hàng, hỗ trợ phân trang và lọc theo user_id hoặc session_id
export async function getOrders(req, res) {
  const { user_id, session_id, page = 1 } = req.query;
  const pageSize = 5; // Số lượng đơn hàng mỗi trang
  const offset = (parseInt(page, 10) - 1) * pageSize;

  const whereClause = prepareWhereClause(user_id, session_id);

  // Thực hiện truy vấn đồng thời để tăng hiệu năng
  const [orders, totalOrders] = await Promise.all([
    db.Order.findAll({
      where: whereClause,
      limit: pageSize,
      offset,
      order: [["created_at", "DESC"]], // Sắp xếp theo thời gian tạo giảm dần
    }),
    db.Order.count({ where: whereClause }),
  ]);

  res.status(200).json({
    message: "Lấy danh sách đơn hàng thành công!",
    data: orders,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalOrders / pageSize),
    total: totalOrders,
  });
}

// Lấy chi tiết đơn hàng theo ID
export async function getOrderById(req, res) {
  const { id } = req.params;
  const order = await db.Order.findByPk(id, {
    include: [
      {
        model: db.OrderDetail,
        as: "order_details",
        include: [
          {
            model: db.ProductVariantValue,
            as: "product_variant_value",
            attributes: ["id", "sku", "price", "stock"],
          },
        ],
      },
    ],
  });

  if (!order) {
    return res.status(404).json({
      message: "Đơn hàng không tìm thấy",
    });
  }

  // Lấy tất cả variant_value IDs từ sku
  const allVariantValueIds = order.order_details.flatMap((detail) => {
    const sku = detail.product_variant_value?.sku;
    return sku ? sku.split("-").map(Number) : [];
  });

  // Truy vấn VariantValue một lần duy nhất
  const variantValues = await db.VariantValue.findAll({
    where: { id: { [Op.in]: [...new Set(allVariantValueIds)] } },
    attributes: ["id", "value"],
  });

  // Tạo map để ánh xạ variant_value id sang value
  const variantValueMap = new Map();
  variantValues.forEach((vv) => {
    variantValueMap.set(vv.id, vv.value);
  });

  // Định dạng dữ liệu trả về
  const formattedOrder = formatOrderData(order, variantValueMap);

  res.status(200).json({
    message: "Lấy thông tin đơn hàng thành công!",
    data: formattedOrder,
  });
}

// Cập nhật đơn hàng theo ID
export async function updateOrder(req, res) {
  const { id } = req.params;
  const [updatedRows] = await db.Order.update(req.body, {
    where: { id },
  });

  if (updatedRows === 0) {
    return res.status(404).json({
      message: "Không tìm thấy đơn hàng để cập nhật.",
    });
  }

  const updatedOrder = await db.Order.findByPk(id);

  res.status(200).json({
    message: "Cập nhật đơn hàng thành công!",
    data: updatedOrder,
  });
}

// Xóa đơn hàng theo ID (đánh dấu FAILED thay vì xóa hoàn toàn)
export async function deleteOrder(req, res) {
  const { id } = req.params;
  const order = await db.Order.findByPk(id);

  if (!order) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng để xóa." });
  }

  // Cập nhật trạng thái đơn hàng thành FAILED
  order.status = OrderStatus.FAILED;
  await order.save();

  res.status(200).json({
    message: "Đã đánh dấu đơn hàng là FAILED !",
    data: order,
  });
}
