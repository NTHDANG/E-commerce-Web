import db from "../models/index.js";

// Hàm chuẩn bị điều kiện where cho lọc theo order_id
const prepareWhereClause = (order_id) => {
  const whereClause = {};
  if (order_id) {
    whereClause.order_id = order_id;
  }
  return whereClause;
};

// Lấy danh sách chi tiết đơn hàng, hỗ trợ lọc theo order_id và phân trang
export async function getOrderDetails(req, res) {
  const { order_id, page = 1 } = req.query;
  const pageSize = 10; // Số lượng chi tiết mỗi trang, có thể điều chỉnh
  const offset = (parseInt(page, 10) - 1) * pageSize;

  const whereClause = prepareWhereClause(order_id);

  // Thực hiện truy vấn với phân trang để tối ưu hiệu năng
  const [details, total] = await Promise.all([
    db.OrderDetail.findAll({
      where: whereClause,
      limit: pageSize,
      offset,
      include: [
        {
          model: db.ProductVariantValue,
          as: "product_variant_value",
          attributes: ["id", "sku", "price", "stock"],
        },
      ],
    }),
    db.OrderDetail.count({ where: whereClause }),
  ]);

  res.status(200).json({
    message: "Lấy danh sách chi tiết đơn hàng thành công!",
    data: details,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(total / pageSize),
    total,
  });
}

// Lấy chi tiết đơn hàng theo ID
export async function getOrderDetailById(req, res) {
  const { id } = req.params;
  const detail = await db.OrderDetail.findByPk(id, {
    include: [
      {
        model: db.ProductVariantValue,
        as: "product_variant_value",
        attributes: ["id", "sku", "price", "stock"],
      },
    ],
  });

  if (!detail) {
    return res.status(404).json({
      message: "Chi tiết đơn hàng không tìm thấy",
    });
  }

  res.status(200).json({
    message: "Lấy thông tin chi tiết đơn hàng thành công!",
    data: detail,
  });
}

// Tạo mới chi tiết đơn hàng
export async function insertOrderDetail(req, res) {
  const detail = await db.OrderDetail.create(req.body);

  res.status(201).json({
    message: "Thêm chi tiết đơn hàng thành công!",
    data: detail,
  });
}

// Cập nhật chi tiết đơn hàng
export async function updateOrderDetail(req, res) {
  const { id } = req.params;
  const [updatedRows] = await db.OrderDetail.update(req.body, {
    where: { id },
  });

  if (updatedRows === 0) {
    return res.status(404).json({
      message: "Không tìm thấy chi tiết đơn hàng để cập nhật.",
    });
  }

  const updatedDetail = await db.OrderDetail.findByPk(id, {
    include: [
      {
        model: db.ProductVariantValue,
        as: "product_variant_value",
        attributes: ["id", "sku", "price", "stock"],
      },
    ],
  });

  res.status(200).json({
    message: "Cập nhật chi tiết đơn hàng thành công!",
    data: updatedDetail,
  });
}

// Xóa chi tiết đơn hàng
export async function deleteOrderDetail(req, res) {
  const { id } = req.params;
  const deletedRows = await db.OrderDetail.destroy({
    where: { id },
  });

  if (deletedRows === 0) {
    return res.status(404).json({
      message: "Không tìm thấy chi tiết đơn hàng để xóa.",
    });
  }

  res.status(200).json({
    message: "Xóa chi tiết đơn hàng thành công!",
  });
}