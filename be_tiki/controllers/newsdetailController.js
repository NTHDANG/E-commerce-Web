import db from "../models/index.js";
import { Sequelize } from "sequelize";
const { Op } = Sequelize;
import { generateImageUrl } from "../helpers/imageHelper.js";

// Hàm chuẩn bị điều kiện where cho tìm kiếm
const prepareWhereClause = (search = "") => {
  const whereClause = {};
  if (search.trim() !== "") {
    whereClause[Op.or] = [
      { "$news.title$": { [Op.like]: `%${search}%` } },
      { "$product.name$": { [Op.like]: `%${search}%` } },
    ];
  }
  return whereClause;
};

// Hàm định dạng dữ liệu NewsDetail với URL ảnh (nếu có)
const formatNewsDetailData = (detail, req) => {
  const data = detail.toJSON();
  if (data.product?.image) {
    data.product.image = generateImageUrl(req, data.product.image);
  }
  if (data.news?.image) {
    data.news.image = generateImageUrl(req, data.news.image);
  }
  return data;
};

// Lấy tất cả NewsDetail, hỗ trợ tìm kiếm và phân trang
export async function getNewsDetails(req, res) {
  const { search = "", page = 1 } = req.query;
  const pageSize = 5; // Số lượng bản ghi mỗi trang
  const offset = (parseInt(page, 10) - 1) * pageSize;

  const whereClause = prepareWhereClause(search);

  // Thực hiện truy vấn đồng thời để tăng hiệu năng
  const [data, total] = await Promise.all([
    db.NewsDetail.findAll({
      where: whereClause,
      include: [{ model: db.Product, as: "product" }, { model: db.News, as: "news" }],
      limit: pageSize,
      offset,
    }),
    db.NewsDetail.count({
      where: whereClause,
      include: [{ model: db.Product, as: "product" }, { model: db.News, as: "news" }],
    }),
  ]);

  const formattedData = data.map((detail) => formatNewsDetailData(detail, req));

  res.status(200).json({
    message: "Lấy danh sách liên kết tin tức - sản phẩm thành công!",
    data: formattedData,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(total / pageSize),
    total,
  });
}

// Lấy NewsDetail theo ID
export async function getNewsDetailById(req, res) {
  const { id } = req.params;
  const detail = await db.NewsDetail.findByPk(id, {
    include: [{ model: db.Product, as: "product" }, { model: db.News, as: "news" }],
  });

  if (!detail) {
    return res
      .status(404)
      .json({ message: "Không tìm thấy bản ghi chi tiết." });
  }

  const detailData = formatNewsDetailData(detail, req);

  res.status(200).json({
    message: "Lấy chi tiết bản ghi thành công!",
    data: detailData,
  });
}

// Thêm mới NewsDetail (có kiểm tra id tồn tại)
export async function insertNewsDetail(req, res) {
  const { product_id, news_id } = req.body;

  // Kiểm tra tồn tại của Product và News
  const [product, news] = await Promise.all([
    db.Product.findByPk(product_id),
    db.News.findByPk(news_id),
  ]);

  if (!product || !news) {
    return res.status(400).json({
      message: "Sản phẩm hoặc tin tức không tồn tại.",
    });
  }

  // Kiểm tra xem cặp product_id và news_id đã tồn tại trong NewsDetail chưa
  const existingDetail = await db.NewsDetail.findOne({
    where: {
      product_id,
      news_id,
    },
  });

  if (existingDetail) {
    return res.status(409).json({
      message: "Liên kết giữa sản phẩm và tin tức đã tồn tại.",
    });
  }

  // Tạo mới bản ghi nếu không trùng
  const detail = await db.NewsDetail.create({ product_id, news_id });

  res.status(201).json({
    message: "Tạo liên kết sản phẩm - tin tức thành công!",
    data: detail,
  });
}

// Cập nhật NewsDetail
export async function updateNewsDetail(req, res) {
  const { id } = req.params;
  const { product_id, news_id } = req.body;

  // Kiểm tra tồn tại của Product và News
  const [product, news] = await Promise.all([
    db.Product.findByPk(product_id),
    db.News.findByPk(news_id),
  ]);

  if (!product || !news) {
    return res.status(400).json({
      message: "Sản phẩm hoặc tin tức không tồn tại.",
    });
  }

  // Kiểm tra xem cặp product_id và news_id đã tồn tại ở bản ghi khác chưa
  const duplicateDetail = await db.NewsDetail.findOne({
    where: {
      product_id,
      news_id,
      id: { [Op.ne]: id }, // Không trùng với chính bản ghi đang cập nhật
    },
  });

  if (duplicateDetail) {
    return res.status(400).json({
      message: "Liên kết sản phẩm - tin tức này đã tồn tại.",
    });
  }

  const [updated] = await db.NewsDetail.update(
    { product_id, news_id },
    { where: { id } }
  );

  if (!updated) {
    return res.status(404).json({
      message: "Không tìm thấy bản ghi để cập nhật.",
    });
  }

  const updatedDetail = await db.NewsDetail.findByPk(id, {
    include: [{ model: db.Product, as: "product" }, { model: db.News, as: "news" }],
  });
  const updatedData = formatNewsDetailData(updatedDetail, req);

  res.status(200).json({
    message: "Cập nhật liên kết thành công!",
    data: updatedData,
  });
}

// Xóa NewsDetail
export async function deleteNewsDetail(req, res) {
  const { id } = req.params;
  const deleted = await db.NewsDetail.destroy({ where: { id } });

  if (!deleted) {
    return res.status(404).json({
      message: "Không tìm thấy bản ghi để xoá.",
    });
  }

  res.status(200).json({
    message: "Xóa bản ghi thành công!",
  });
}
