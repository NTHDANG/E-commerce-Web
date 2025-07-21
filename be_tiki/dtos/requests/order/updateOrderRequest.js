import Joi from "joi";
import { OrderStatus } from "../../../constants/index.js";

class updateOrderRequest {
  constructor(data) {
    this.status = data.status;
    this.note = data.note;
    this.total = data.total;
  }

  static validate(data) {
    const schema = Joi.object({
      status: Joi.number()
        .valid(...Object.values(OrderStatus)) // kiểm tra đúng enum
        .optional(),
      note: Joi.string().allow("").optional(),
      total: Joi.number().min(0).optional(),
    });

    return schema.validate(data, { abortEarly: false }); // tránh dừng ở lỗi đầu tiên
  }
}

export default updateOrderRequest;
