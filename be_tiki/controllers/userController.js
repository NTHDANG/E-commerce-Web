import { Sequelize } from "sequelize";
const { Op } = Sequelize;
import db from "../models/index.js";
import responseUser from "../dtos/responses/user/responseUser.js";
import argon2 from "argon2";
import { userRole } from "../constants/index.js";
import jwt from "jsonwebtoken";
import { generateImageUrl } from "../helpers/imageHelper.js";


// Hàm chuẩn bị điều kiện where cho tìm kiếm
const prepareWhereClause = (search = "") => {
  return search.trim()
    ? {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ],
      }
    : {};
};

// Hàm định dạng dữ liệu người dùng với URL avatar đầy đủ
const formatUserData = (user, req) => {
  const userData = user.toJSON();
  userData.avatar = generateImageUrl(req, userData.avatar);
  return userData;
};

// Lấy danh sách người dùng, hỗ trợ tìm kiếm và phân trang
export async function getUsers(req, res) {
  const { search = "", page = 1 } = req.query;
  const pageSize = 5; // Số lượng người dùng mỗi trang
  const offset = (parseInt(page, 10) - 1) * pageSize;

  const whereClause = prepareWhereClause(search);

  // Thực hiện truy vấn đồng thời để tăng hiệu năng
  const [users, totalUsers] = await Promise.all([
    db.User.findAll({ where: whereClause, limit: pageSize, offset }),
    db.User.count({ where: whereClause }),
  ]);

  const usersWithFullAvatar = users.map((user) => formatUserData(user, req));

  res.status(200).json({
    message: "Lấy danh sách người dùng thành công!",
    data: usersWithFullAvatar,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalUsers / pageSize),
    total: totalUsers,
  });
}

// Lấy thông tin người dùng theo ID
export async function getUserById(req, res) {
  const { id } = req.params;
  const user = await db.User.findByPk(id);

  if (!user) {
    return res.status(404).json({ message: "Người dùng không tìm thấy" });
  }

  const userData = formatUserData(user, req);

  res.status(200).json({
    message: "Lấy thông tin người dùng thành công!",
    data: userData,
  });
}

// Đăng ký người dùng mới
export async function registerUser(req, res) {
  const { email, name, phone, password } = req.body;

  // Kiểm tra ít nhất một trong email hoặc phone được cung cấp
  if (!email && !phone) {
    return res.status(400).json({
      message: "Cần cung cấp ít nhất một trong hai: email hoặc số điện thoại.",
    });
  }

  // Kiểm tra email đã tồn tại (nếu có)
  if (email) {
    const existingUserByEmail = await db.User.findOne({ where: { email } });
    if (existingUserByEmail) {
      return res.status(409).json({
        message: "Email này đã được đăng ký, vui lòng chọn email khác.",
      });
    }
  }

  // Kiểm tra phone đã tồn tại
  if (phone) {
    const existingUserByPhone = await db.User.findOne({ where: { phone } });
    if (existingUserByPhone) {
      return res.status(409).json({
        message: "Số điện thoại này đã được đăng ký, vui lòng chọn số khác.",
      });
    }
  }

  // Hash mật khẩu
  const hashedPassword = await argon2.hash(password);

  // Tạo người dùng mới
  const user = await db.User.create({
    email,
    name,
    phone,
    password: hashedPassword,
    role: userRole.USER,
  });

  const userData = formatUserData(user, req);

  res.status(201).json({
    message: "Đăng ký người dùng mới thành công!",
    data: userData,
  });
}

// Đăng nhập người dùng
export async function loginUser(req, res) {
  const { email, phone, password } = req.body;

  // Kiểm tra có ít nhất email hoặc phone
  if (!email && !phone) {
    return res.status(400).json({
      message: "Vui lòng nhập email hoặc số điện thoại để đăng nhập.",
    });
  }

  // Tìm người dùng theo email hoặc phone
  const whereClause = email ? { email } : { phone };
  const user = await db.User.findOne({ where: whereClause });

  if (!user) {
    return res.status(404).json({
      message: "Không tìm thấy tài khoản với thông tin đã cung cấp.",
    });
  }

  // So sánh mật khẩu
  const isPasswordValid = await argon2.verify(user.password, password);
  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Mật khẩu không đúng, vui lòng thử lại.",
    });
  }

  // Tạo JWT token
  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION }
  );

  // Trả về thông tin người dùng (ẩn mật khẩu)
  res.status(200).json({
    message: "Đăng nhập thành công!",
    token,
    data: new responseUser(user),
  });
}

// Cập nhật thông tin người dùng
export async function updateUser(req, res) {
  const { id } = req.params;
  const { name, avatar, password, oldPassword, phone, address } = req.body;

  // Chỉ cho phép user tự cập nhật thông tin của mình (hoặc admin)
  // Giả sử logic phân quyền đã được xử lý ở middleware
  if (req.user.role !== 'ADMIN' && req.user.id.toString() !== id) {
    return res.status(403).json({
      message: "Không được phép cập nhật thông tin của người dùng khác",
    });
  }

  const user = await db.User.findByPk(id);
  if (!user) {
    return res.status(404).json({ message: "Không tìm thấy người dùng để cập nhật." });
  }

  // Cập nhật các trường nếu chúng được cung cấp
  if (name) user.name = name;
  if (avatar) user.avatar = avatar;
  if (phone) user.phone = phone;
  if (address) user.address = address;

  // Xử lý đổi mật khẩu
  if (password) {
    if (!oldPassword) {
      return res.status(400).json({ message: "Vui lòng nhập mật khẩu cũ để đổi mật khẩu." });
    }

    const isMatch = await argon2.verify(user.password, oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu cũ không đúng." });
    }

    user.password = await argon2.hash(password);
    user.password_changed_at = new Date();
  }

  // Lưu các thay đổi vào database
  // Thao tác .save() sẽ kích hoạt validation của model
  await user.save();

  const updatedUserData = formatUserData(user, req);

  res.status(200).json({
    message: "Cập nhật người dùng thành công!",
    data: updatedUserData,
  });
}

// Xóa người dùng
export async function deleteUser(req, res) {
  const { id } = req.params;
  const deletedRows = await db.User.destroy({ where: { id } });

  if (deletedRows === 0) {
    return res.status(404).json({ message: "Không tìm thấy người dùng để xóa." });
  }

  res.status(200).json({ message: "Xóa người dùng thành công!" });
}