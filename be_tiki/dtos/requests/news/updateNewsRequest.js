import Joi from "joi";

class updateNewsRequest {
  constructor(data) {
    this.title = data.title;
    this.image = data.image;
    this.content = data.content;
  }

  static validate(data) {
    const schema = Joi.object({
      title: Joi.string().allow(null, ""), // cho phép null hoặc chuỗi rỗng, nếu có thì phải là string
      image: Joi.string().uri().allow(null, ""), // phải là URL nếu có, hoặc null/chuỗi rỗng
      content: Joi.string().allow(null, ""),
    });

    return schema.validate(data); // { error, value }
  }
}

export default updateNewsRequest;
