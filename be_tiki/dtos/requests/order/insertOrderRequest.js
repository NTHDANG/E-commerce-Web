import Joi from "joi";

class insertOrderRequest {
  constructor(data) {
    this.user_id = data.user_id;
    this.status = data.status;
    this.note = data.note;
    this.total = data.total;
    this.phone = data.phone;
    this.address = data.address;
  }

  static validate(data) {
    const schema = Joi.object({
      user_id: Joi.number().integer().optional(),
      status: Joi.number().integer().min(1).optional(),
      note: Joi.string().optional().allow(""),
      total: Joi.number().min(0).required(),
      phone: Joi.string()
        .pattern(/^[0-9]{9,11}$/)
        .required()
        .messages({
          "string.pattern.base":
            "Số điện thoại không hợp lệ (phải từ 9-11 chữ số).",
        }),
      address: Joi.string().allow(null, "").optional(),
    });

    return schema.validate(data); // { error, value }
  }
}

export default insertOrderRequest;
