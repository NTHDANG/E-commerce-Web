import Joi from "joi";

class loginUserRequest {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
    this.phone = data.phone;
  }

  static validate(data) {
    const schema = Joi.object({
      email: Joi.string().email().optional(),
      password: Joi.string().min(6).required(),
      phone: Joi.string().optional().allow(""),
    });

    return schema.validate(data); // { error, value }
  }
}

export default loginUserRequest;
