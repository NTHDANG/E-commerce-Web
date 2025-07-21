import Joi from "joi";

class insertBannerDetailRequest {
  constructor(data) {
    this.banner_id = data.banner_id;
    this.product_id = data.product_id;
  }

  static validate(data) {
    const schema = Joi.object({
      banner_id: Joi.number().integer().required(),
      product_id: Joi.number().integer().required()
    });

    return schema.validate(data); // { error, value }
  }
}

export default insertBannerDetailRequest;
