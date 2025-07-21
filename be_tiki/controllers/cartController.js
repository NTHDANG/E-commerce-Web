import { Sequelize } from "sequelize";
const { Op } = Sequelize;
import db from "../models/index.js";
import { OrderStatus } from "../constants/index.js";
import { generateImageUrl } from "../helpers/imageHelper.js";

// Hàm chuẩn bị điều kiện where cho tìm kiếm và lọc
const prepareWhereClause = (user_id, session_id) => {
  const whereClause = {};
  if (user_id) {
    whereClause.user_id = user_id;
  } else if (session_id) {
    whereClause.session_id = session_id;
  }
  return whereClause;
};

// Hàm xử lý và trả về dữ liệu giỏ hàng với URL ảnh (nếu cần)
const formatCartData = (cart, req) => {
  const data = cart.toJSON();
  if (data.cart_items) {
    data.cart_items = data.cart_items.map((item) => {
      const variant = item.product_variant_value;
      if (variant && variant.product) {
        variant.product_name = variant.product.name;
        // Lấy product_images trước khi xóa product object
        if (variant.product.product_images) {
          variant.product_images = variant.product.product_images.map(
            (img) => ({
              id: img.id,
              image_url: generateImageUrl(req, img.image_u),
            })
          );
        }
        delete variant.product; // Loại bỏ object Product để giảm kích thước dữ liệu
        if (variant.image) {
          variant.image = generateImageUrl(req, variant.image);
        }
      }
      return item;
    });
  }
  return data;
};

// Lấy tất cả giỏ hàng, hỗ trợ phân trang và lọc theo user_id hoặc session_id
export async function getCarts(req, res) {
  const { page = 1, user_id, session_id } = req.query;
  const pageSize = 5; // Số lượng giỏ hàng mỗi trang
  const offset = (parseInt(page, 10) - 1) * pageSize;

  const whereClause = prepareWhereClause(user_id, session_id);

  // Thực hiện truy vấn đồng thời để tăng hiệu năng
  const [carts, totalCarts] = await Promise.all([
    db.Cart.findAll({
      where: whereClause,
      limit: pageSize,
      offset,
      include: [{ model: db.CartItem, as: "cart_items" }],
    }),
    db.Cart.count({ where: whereClause }),
  ]);

  const formattedCarts = carts.map((cart) => formatCartData(cart, req));

  res.status(200).json({
    message: "Lấy danh sách giỏ hàng thành công!",
    data: formattedCarts,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalCarts / pageSize),
    total: totalCarts,
  });
}

// Lấy giỏ hàng theo ID
export async function getCartById(req, res) {
  const { id } = req.params;
  const cart = await db.Cart.findByPk(id, {
    include: [
      {
        model: db.CartItem,
        as: "cart_items",
        include: [
          {
            model: db.ProductVariantValue,
            as: "product_variant_value",
            attributes: {
              exclude: ["created_at", "updated_at"],
            },
            include: [
              {
                model: db.Product,
                as: "product",
                include: [
                  {
                    model: db.ProductImage,
                    as: "product_images",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!cart) {
    return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
  }

  const cartJSON = formatCartData(cart, req);

  res.status(200).json({
    message: "Lấy thông tin giỏ hàng thành công!",
    data: cartJSON,
  });
}

// Thêm mới giỏ hàng
export async function insertCart(req, res, next) {
  const { session_id, user_id } = req.body;

  // Kiểm tra session_id và user_id không được đồng thời null hoặc đồng thời có giá trị
  const bothNull = !session_id && !user_id;
  const bothHaveValue = session_id && user_id;
  if (bothNull || bothHaveValue) {
    const error = new Error(
      "Chỉ được phép truyền một trong hai: session_id hoặc user_id."
    );
    error.status = 400;
    throw error;
  }

  // Kiểm tra trùng theo session_id hoặc user_id
  const whereClause = session_id ? { session_id } : { user_id };
  const existingCart = await db.Cart.findOne({ where: whereClause });

  if (existingCart) {
    const error = new Error(
      "Giỏ hàng với session_id hoặc user_id này đã tồn tại!"
    );
    error.status = 409;
    throw error;
  }

  const cart = await db.Cart.create(req.body);
  res.status(201).json({
    message: "Thêm mới giỏ hàng thành công!",
    data: cart,
  });
}

// Xóa giỏ hàng
export async function deleteCart(req, res) {
  const { id } = req.params;
  const deletedRows = await db.Cart.destroy({ where: { id } });

  if (deletedRows === 0) {
    return res.status(404).json({ message: "Không tìm thấy giỏ hàng để xóa" });
  }

  res.status(200).json({ message: "Xóa giỏ hàng thành công!" });
}

// Thanh toán giỏ hàng
export async function checkoutCart(req, res) {
  const transaction = await db.sequelize.transaction(); // Bắt đầu transaction

  try {
    const { cart_id, total, note, phone, address } = req.body;

    // 1. Lấy giỏ hàng và các item
    const cart = await db.Cart.findByPk(cart_id, {
      include: [{ model: db.CartItem, as: "cart_items" }],
      transaction,
    });

    if (!cart || cart.cart_items.length === 0) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Giỏ hàng không tồn tại hoặc trống!" });
    }

    // 2. Lấy thông tin người dùng từ giỏ hàng
    const { session_id, user_id } = cart;

    // 3. Lấy danh sách product_variant_id
    const productVariantIds = cart.cart_items.map(
      (item) => item.product_variant_id
    );

    // 4. Lấy thông tin chi tiết các phiên bản sản phẩm
    const productVariants = await db.ProductVariantValue.findAll({
      where: { id: { [Op.in]: productVariantIds } },
      transaction,
    });

    // Tạo Map để tra cứu nhanh
    const productVariantMap = new Map(productVariants.map((pv) => [pv.id, pv]));

    // 5. Kiểm tra tồn kho và tính tổng tiền
    let totalAmount = 0;
    const orderDetailsToCreate = [];

    for (const item of cart.cart_items) {
      const productVariant = productVariantMap.get(item.product_variant_id);

      if (!productVariant) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Phiên bản sản phẩm với ID ${item.product_variant_id} không tồn tại!`,
        });
      }

      if (item.quantity > productVariant.stock) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Số lượng yêu cầu của sản phẩm "${productVariant.name}" vượt quá tồn kho! Chỉ còn ${productVariant.stock} sản phẩm.`,
        });
      }

      const price = productVariant.price || 0;
      totalAmount += price * item.quantity;

      orderDetailsToCreate.push({
        order_id: null, // Sẽ được điền sau khi tạo newOrder
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
        price,
      });

      // Giảm tồn kho
      await productVariant.decrement("stock", {
        by: item.quantity,
        transaction,
      });
    }

    // 6. Sử dụng total từ FE nếu có, nếu không dùng totalAmount đã tính
    if (total != null) {
      totalAmount = total;
    }

    // 7. Tạo đơn hàng mới
    const newOrder = await db.Order.create(
      {
        user_id,
        session_id,
        total: totalAmount,
        note,
        phone,
        address,
        status: OrderStatus.PENDING,
      },
      { transaction }
    );

    // 8. Cập nhật và tạo OrderDetail
    orderDetailsToCreate.forEach((detail) => {
      detail.order_id = newOrder.id;
    });

    await db.OrderDetail.bulkCreate(orderDetailsToCreate, { transaction });

    // 9. Xóa giỏ hàng và các item
    await db.CartItem.destroy({ where: { cart_id }, transaction });
    await db.Cart.destroy({ where: { id: cart_id }, transaction });

    // 10. Commit transaction
    await transaction.commit();

    res.status(201).json({
      message: "Thanh toán thành công!",
      data: {
        order: newOrder,
        orderDetails: orderDetailsToCreate,
      },
    });
  } catch (error) {
    await transaction.rollback(); // Rollback nếu có lỗi
    res.status(500).json({
      message: "Đã có lỗi xảy ra khi thanh toán!",
      error: error.message,
    });
  }
}
