import { Sequelize } from "sequelize";
const { Op } = Sequelize;
import db from "../models/index.js";
import { generateImageUrl } from "../helpers/imageHelper.js";

// Hàm chuẩn bị điều kiện where cho tìm kiếm
const prepareWhereClause = (search = "") => {
  const whereClause = {};
  if (search.trim() !== "") {
    whereClause[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { content: { [Op.like]: `%${search}%` } },
    ];
  }
  return whereClause;
};

// Hàm định dạng dữ liệu tin tức với URL ảnh
const formatNewsData = (news, req) => {
  const data = news.toJSON();
  data.image = generateImageUrl(req, data.image);
  return data;
};

// Lấy danh sách tin tức, hỗ trợ tìm kiếm và phân trang
export async function getNews(req, res) {
  const { search = "", page = 1 } = req.query;
  const pageSize = 5; // Số lượng tin tức mỗi trang
  const offset = (parseInt(page, 10) - 1) * pageSize;

  const whereClause = prepareWhereClause(search);

  // Thực hiện truy vấn đồng thời để tăng hiệu năng
  const [newsList, totalNews] = await Promise.all([
    db.News.findAll({
      where: whereClause,
      limit: pageSize,
      offset,
    }),
    db.News.count({ where: whereClause }),
  ]);

  const transformedNews = newsList.map((news) => formatNewsData(news, req));

  res.status(200).json({
    message: "Lấy danh sách tin tức thành công!",
    data: transformedNews,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalNews / pageSize),
    total: totalNews,
  });
}

// Lấy tin tức theo ID
export async function getNewsById(req, res) {
  const { id } = req.params;
  const news = await db.News.findByPk(id);

  if (!news) {
    return res.status(404).json({
      message: "Tin tức không tìm thấy",
    });
  }

  const data = formatNewsData(news, req);

  res.status(200).json({
    message: "Lấy thông tin tin tức thành công!",
    data,
  });
}

// Thêm mới tin tức với liên kết sản phẩm
export async function insertNews(req, res) {
  const transaction = await db.sequelize.transaction(); // Bắt đầu transaction

  try {
    const news = await db.News.create(req.body, { transaction });

    // Lấy và kiểm tra product_ids hợp lệ
    let validProductIds = [];
    if (Array.isArray(req.body.product_ids) && req.body.product_ids.length) {
      const products = await db.Product.findAll({
        where: { id: { [Op.in]: req.body.product_ids } },
        attributes: ["id"],
        transaction,
      });
      validProductIds = products.map((p) => p.id);
    }

    // Tạo các bản ghi NewsDetail cho các product_ids hợp lệ
    if (validProductIds.length) {
      const newsDetailPromises = validProductIds.map((product_id) =>
        db.NewsDetail.create({ product_id, news_id: news.id }, { transaction })
      );
      await Promise.all(newsDetailPromises);
    }

    await transaction.commit(); // Commit transaction

    const data = formatNewsData(news, req);

    res.status(201).json({
      message: "Thêm mới tin tức thành công!",
      data,
    });
  } catch (error) {
    await transaction.rollback(); // Rollback nếu có lỗi
    res.status(500).json({
      message: "Lỗi khi thêm tin tức",
      error: error.message,
    });
  }
}

// Cập nhật tin tức
export async function updateNews(req, res) {
  const { id } = req.params;
  const { title, image } = req.body;

  const updateData = {};

  if (title !== undefined) {
    // Kiểm tra trùng tiêu đề với tin tức khác
    const existingNews = await db.News.findOne({
      where: {
        title,
        id: { [Op.ne]: id },
      },
    });

    if (existingNews) {
      return res.status(400).json({
        message: "Tiêu đề tin tức đã tồn tại.",
      });
    }

    updateData.title = title;
  }

  if (image !== undefined) {
    updateData.image = image; // Lưu filename
  }

  const [updatedRows] = await db.News.update(updateData, {
    where: { id },
  });

  if (updatedRows === 0) {
    return res.status(404).json({
      message: "Không tìm thấy tin tức để cập nhật.",
    });
  }

  const updatedNews = await db.News.findByPk(id);
  const data = formatNewsData(updatedNews, req);

  res.status(200).json({
    message: "Cập nhật tin tức thành công!",
    data,
  });
}

// Xóa tin tức và các liên kết NewsDetail tương ứng
export async function deleteNews(req, res) {
  const transaction = await db.sequelize.transaction(); // Bắt đầu transaction

  try {
    const { id } = req.params;

    // Xóa các bản ghi liên kết trong NewsDetail
    await db.NewsDetail.destroy({
      where: { news_id: id },
      transaction,
    });

    // Xóa bản ghi trong News
    const deletedRows = await db.News.destroy({
      where: { id },
      transaction,
    });

    if (deletedRows === 0) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Không tìm thấy tin tức để xóa.",
      });
    }

    await transaction.commit(); // Commit transaction

    res.status(200).json({
      message: "Xóa tin tức thành công!",
    });
  } catch (error) {
    await transaction.rollback(); // Rollback nếu có lỗi
    res.status(500).json({
      message: "Đã xảy ra lỗi khi xóa tin tức.",
      error: error.message,
    });
  }
}