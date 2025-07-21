import Joi from "joi";

class insertNewsDetailRequest {
  constructor(data) {
    this.news_id = data.news_id;
    this.product_id = data.product_id;
  }

  static validate(data) {
    const schema = Joi.object({
      news_id: Joi.number().integer().required(),
      product_id: Joi.number().integer().required()
    });

    return schema.validate(data); // { error, value }
  }
}

export default insertNewsDetailRequest;
