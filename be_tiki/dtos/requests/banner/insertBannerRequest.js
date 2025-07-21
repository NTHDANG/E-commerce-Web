import Joi from "joi";

class insertBannerRequest {
  constructor(data) {
    this.name = data.name;
    this.image = data.image;
    this.status = data.status;
  }

  static validate(data) {
    const schema = Joi.object({
      name: Joi.string().required(),
      image: Joi.string().optional().allow("", null),
      status: Joi.number().integer().min(1).required(), // status > 0
    });

    return schema.validate(data); // { error, value }
  }
}

export default insertBannerRequest;
