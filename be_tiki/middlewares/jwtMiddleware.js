import jwt from "jsonwebtoken";
import db from "../models/index.js";
import userRole from "../constants/userRole.js";

/**
 * Middleware kiểm tra token và quyền truy cập
 * @param  {...string} allowedRoleNames (VD: "ADMIN", "USER" hoặc để trống nếu không cần check quyền)
 */
export function jwtMiddleware(...allowedRoleNames) {
  return async function (req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token không được cung cấp" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // chứa { id, iat, exp }
      req.user = decoded;

      const user = await db.User.findByPk(decoded.id);
      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }

      if (user.is_locked === 1) {
        return res.status(403).json({ message: "Tài khoản đã bị khóa!" });
      }

      // Kiểm tra token được tạo trước khi đổi mật khẩu hay không
      if (user.password_changed_at) {
        const passwordChangedAtTime =
          new Date(user.password_changed_at).getTime() / 1000; // về giây
        if (decoded.iat < passwordChangedAtTime) {
          return res.status(401).json({
            message: "Token không còn hợp lệ vì mật khẩu đã được thay đổi.",
          });
        }
      }

      // Nếu không yêu cầu quyền → bỏ qua check role
      if (allowedRoleNames.length === 0) {
        req.user.role = user.role;
        return next();
      }

      // Map từ chuỗi tên role sang số (từ userRole.js)
      const allowedRoleValues = allowedRoleNames
        .map((name) => userRole[name])
        .filter(Boolean); // loại bỏ undefined nếu viết sai

      if (!allowedRoleValues.includes(user.role)) {
        return res
          .status(403)
          .json({ message: "Bạn không có quyền truy cập chức năng này" });
      }

      req.user.role = user.role;
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
  };
}
