import Joi from "joi";

class updateProductRequest {
  constructor(data) {
    this.name = data.name;
    this.description = data.description;
    this.brand_id = data.brand_id;
    this.category_id = data.category_id;
    this.attributes = data.attributes;
    this.variants = data.variants;
    this.variant_values = data.variant_values;
    this.product_variant_values = data.product_variant_values;
    this.stock = data.stock;
    this.total_ratings = data.total_ratings;
    this.total_sold = data.total_sold;
  }

  static validate(data) {
    // Định nghĩa schema cho variants
    const variantSchema = Joi.object({
      name: Joi.string().required(),
    });

    // Định nghĩa schema cho variant_values
    const variantValueSchema = Joi.object({
      variant_name: Joi.string().required(),
      value: Joi.string().required(),
      image: Joi.string().allow("").optional(),
    });

    // Định nghĩa schema cho product_variant_values
    const productVariantValueSchema = Joi.object({
      name: Joi.string()
        .required()
        .pattern(/^\S+\s+\S+$/), // Đảm bảo tên có dạng "value1 value2" (ví dụ: "Đen L")
      price: Joi.number().positive().required(),
      old_price: Joi.number().positive().optional(),
      stock: Joi.number().integer().min(0).required(),
    });

    // Schema chính
    const schema = Joi.object({
      name: Joi.string().optional(),
      description: Joi.string().optional().allow(""),
      brand_id: Joi.number().integer().optional(),
      category_id: Joi.number().integer().optional(),
      stock: Joi.number().integer().min(0).optional().default(0),
      total_ratings: Joi.number().integer().min(0).optional().default(0),
      total_sold: Joi.number().integer().min(0).optional().default(0),
      attributes: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            value: Joi.string().required(),
          })
        )
        .optional(),
      variants: Joi.array().items(variantSchema).optional(),
      variant_values: Joi.array().items(variantValueSchema).optional(),
      product_variant_values: Joi.array()
        .items(productVariantValueSchema)
        .optional(),
    }).and("variants", "variant_values", "product_variant_values"); // Đảm bảo hoặc cả ba đều có, hoặc không có

    return schema.validate(data, { convert: true });
  }
}

export default updateProductRequest;
