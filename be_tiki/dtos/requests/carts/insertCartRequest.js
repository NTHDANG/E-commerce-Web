import Joi from "joi";

class insertCartRequest {
  constructor(data) {
    this.session_id = data.session_id;
    this.user_id = data.user_id;
  }

  static validate(data) {
    const schema = Joi.object({
      session_id: Joi.string().optional(),
      user_id: Joi.number().integer().optional(),
    });

    return schema.validate(data); // { error, value }
  }
}

export default insertCartRequest;
