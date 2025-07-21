import Joi from "joi";

class insertUserRequest {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
    this.name = data.name;
    this.role = data.role;
    this.avatar = data.avatar;
    this.phone = data.phone;
  }

  static validate(data) {
    const schema = Joi.object({
      email: Joi.string().email().optional(),
      password: Joi.string().min(6),
      name: Joi.string().required(),
      avatar: Joi.string().optional().allow(""),
      phone: Joi.string().optional().allow(""),
    });

    return schema.validate(data); // { error, value }
  }
}

export default insertUserRequest;
