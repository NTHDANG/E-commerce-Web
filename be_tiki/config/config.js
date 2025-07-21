import dotenv from "dotenv";
dotenv.config();

// Cấu hình cơ bản cho tất cả môi trường
const commonConfig = {
  dialect: "postgres",
  logging: false, // Log chỉ bật ở development để debug
  dialectOptions: {
    ssl: {
      require: true, // Yêu cầu SSL cho kết nối an toàn (Render yêu cầu)
      rejectUnauthorized: false, // Bỏ qua lỗi chứng chỉ không tin cậy (tùy chọn cho Render)
    },
  },
  // Quản lý pool kết nối để tối ưu hiệu năng
  pool: {
    max: 10, // Số kết nối tối đa trong pool
    min: 0, // Số kết nối tối thiểu
    acquire: 30000, // Thời gian tối đa để lấy kết nối (ms)
    idle: 10000, // Thời gian tối đa một kết nối không dùng bị đóng (ms)
  },
};

// Cấu hình cho từng môi trường
const config = {
  development: {
    ...commonConfig,
    url:
      process.env.SUPABASE_DB_URL || "postgres://localhost:5432/development_db",
  },
  production: {
    ...commonConfig,
    url: process.env.SUPABASE_DB_URL,
  },
  // test: {
  //   ...commonConfig,
  //   url: process.env.TEST_DATABASE_URL || "postgres://localhost:5432/test_db", // Cấu hình test (tùy chọn)
  // },
};

export default config;
