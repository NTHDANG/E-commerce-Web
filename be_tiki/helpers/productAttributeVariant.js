import { Sequelize } from "sequelize";
const { Op } = Sequelize;
import db from "../models/index.js";

// Hàm chuẩn bị dữ liệu attribute từ danh sách đầu vào
const prepareAttributeData = (attributes) =>
  attributes
    .filter((attr) => attr.name && attr.value)
    .map((attr) => ({ name: attr.name, value: attr.value }));

// Hàm tạo hoặc cập nhật attributes cho sản phẩm
export async function handleProductAttributes(
  productId,
  attributes,
  transaction = null
) {
  const attributeData = [];
  const preparedAttributes = prepareAttributeData(attributes);

  for (const attr of preparedAttributes) {
    const { name, value } = attr;
    const [attribute] = await db.Attribute.findOrCreate({
      where: { name },
      transaction,
    });

    const [attrValue, created] = await db.ProductAttributeValue.findOrCreate({
      where: { product_id: productId, attribute_id: attribute.id },
      defaults: { value },
      transaction,
    });

    if (!created) {
      await attrValue.update({ value }, { transaction });
    }

    attributeData.push({ name: attribute.name, value: attrValue.value });
  }

  return attributeData;
}

// Hàm lấy thông tin variant values từ danh sách SKU
const getVariantValuesMap = async () => {
  const allVariantValues = await db.VariantValue.findAll({
    include: [{ model: db.Variant, as: "variant" }],
  });
  return allVariantValues.reduce((map, vv) => {
    map[vv.id] = {
      value: vv.value,
      variantName: vv.Variant?.name || "Không xác định",
    };
    return map;
  }, {});
};

// Hàm lấy thông tin sản phẩm với attributes và product_variant_values
export async function getProductWithAttributes(productId) {
  const product = await db.Product.findByPk(productId, {
    attributes: [
      "id",
      "name",
      "description",
      "brand_id",
      "category_id",
      "stock",
      "total_ratings",
      "total_sold",
    ],
    include: [
      {
        model: db.Category,
        as: "category",
        attributes: ["id", "name"],
      },
      {
        model: db.Brand,
        as: "brand",
        attributes: ["id", "name"],
      },
      {
        model: db.ProductAttributeValue,
        as: "product_attribute_values",
        include: [{ model: db.Attribute, as: "attribute" }],
      },
      {
        model: db.ProductVariantValue,
        as: "product_variant_values",
      },
      {
        model: db.ProductImage,
        as: "product_images",
        attributes: ["id", "image_url"],
        required: false,
      },
    ],
  });

  if (!product) {
    throw new Error("Không tìm thấy sản phẩm.");
  }

  const variantValuesMap = await getVariantValuesMap();

  const productData = {
    id: product.id,
    name: product.name,
    description: product.description,
    brand_id: product.brand_id,
    category_id: product.category_id,
    stock: product.stock,
    total_ratings: product.total_ratings,
    total_sold: product.total_sold,
    category: product.category,
    brand: product.brand,
    product_images: product.product_images.sort((a, b) => a.id - b.id).map(image => {
        let imageUrl = image.image_url;
        if (process.env.RENDER_EXTERNAL_URL && imageUrl.startsWith('http://')) {
            imageUrl = imageUrl.replace('http://', 'https://');
        }
        return { ...image.toJSON(), image_url: imageUrl };
    }),
    attributes: product.product_attribute_values.map((item) => ({
      name: item.Attribute?.name || "Không xác định",
      value: item.value,
    })),
    product_variant_values: product.product_variant_values.map((pvv) => {
      const variantValueIds = pvv.sku.split("-").map(Number);
      const variantValues = variantValueIds.map(
        (id) =>
          variantValuesMap[id] || {
            value: "Không xác định",
            variantName: "Không xác định",
          }
      );
      const displayName = variantValues.map((vv) => vv.value).join(" ");

      return {
        id: pvv.id,
        name: displayName,
        price: pvv.price,
        old_price: pvv.old_price,
        stock: pvv.stock,
        sku: pvv.sku,
      };
    }),
  };

  delete productData.product_attribute_values;

  return productData;
}

// Hàm chuẩn bị dữ liệu variant và variant value từ danh sách đầu vào
const prepareVariantData = (variants) =>
  variants.map((variant) => ({ name: variant.name }));

const prepareVariantValueData = (variantValues, variantMap) =>
  variantValues.map((vv) => ({
    variant_id: variantMap.get(vv.variant_name),
    value: vv.value,
    image: vv.image || "",
  }));

// Hàm xử lý thêm/cập nhật variants cho sản phẩm
export async function handleProductVariants(
  productId,
  variants,
  variantValues,
  productVariantValues,
  transaction
) {
  // Kiểm tra dữ liệu đầu vào
  if (
    (!variants || !variantValues || !productVariantValues) &&
    (variants || variantValues || productVariantValues)
  ) {
    throw new Error(
      "Phải cung cấp cả variants, variant_values và product_variant_values hoặc không cung cấp cả ba."
    );
  }

  if (variants && variantValues && productVariantValues) {
    // Xóa dữ liệu cũ
    const existingProductVariantValues = await db.ProductVariantValue.findAll({
      where: { product_id: productId },
      transaction,
    });

    if (existingProductVariantValues.length > 0) {
      const variantValueIds = new Set();
      existingProductVariantValues.forEach((pvv) =>
        pvv.sku
          .split("-")
          .map(Number)
          .forEach((id) => variantValueIds.add(id))
      );

      const [variantValuesData, allOtherVariants] = await Promise.all([
        db.VariantValue.findAll({
          where: { id: { [Op.in]: Array.from(variantValueIds) } },
          transaction,
        }),
        db.ProductVariantValue.findAll({
          where: {
            product_id: { [Op.ne]: productId },
            sku: { [Op.regexp]: Array.from(variantValueIds).join("|") },
          },
          attributes: ["sku"],
          transaction,
        }),
      ]);

      const variantIds = new Set(variantValuesData.map((vv) => vv.variant_id));
      const variantValuesInUse = new Set();
      allOtherVariants.forEach((pvv) =>
        pvv.sku
          .split("-")
          .map(Number)
          .forEach((id) => {
            if (variantValueIds.has(id)) variantValuesInUse.add(id);
          })
      );

      const variantValuesToDelete = Array.from(variantValueIds).filter(
        (id) => !variantValuesInUse.has(id)
      );

      await db.ProductVariantValue.destroy({
        where: { product_id: productId },
        transaction,
      });

      if (variantValuesToDelete.length > 0) {
        const variantValues = await db.VariantValue.findAll({
          where: { id: variantValuesToDelete },
          include: [{ model: db.Variant, attributes: ["id"] }],
          transaction,
        });

        const variantIdsToDelete = new Set(
          variantValues.map((vv) => vv.variant_id)
        );

        await db.VariantValue.destroy({
          where: { id: variantValuesToDelete },
          transaction,
        });

        for (const variantId of variantIdsToDelete) {
          const remaining = await db.VariantValue.count({
            where: { variant_id: variantId },
            transaction,
          });
          if (remaining === 0) {
            await db.Variant.destroy({ where: { id: variantId }, transaction });
          }
        }
      }
    }

    // Thêm dữ liệu mới
    const variantMap = new Map();
    const preparedVariants = prepareVariantData(variants);
    for (const variant of preparedVariants) {
      const [newVariant] = await db.Variant.findOrCreate({
        where: { name: variant.name },
        defaults: { name: variant.name },
        transaction,
      });
      variantMap.set(variant.name, newVariant.id);
    }

    const preparedVariantValues = prepareVariantValueData(
      variantValues,
      variantMap
    );
    const variantValueMap = new Map();
    for (const vv of preparedVariantValues) {
      const [newVariantValue] = await db.VariantValue.findOrCreate({
        where: { variant_id: vv.variant_id, value: vv.value },
        defaults: {
          variant_id: vv.variant_id,
          value: vv.value,
          image: vv.image,
        },
        transaction,
      });
      variantValueMap.set(vv.value, newVariantValue.id);
    }

    for (const pvv of productVariantValues) {
      const { name, price, old_price, stock } = pvv;
      const variantNames = name.split(" ").filter((n) => n);
      if (variantNames.length !== 2) {
        throw new Error(`Tên biến thể không hợp lệ: ${name}`);
      }

      const variantValueIds = variantNames.map((value) => {
        const variantValueId = variantValueMap.get(value);
        if (!variantValueId) {
          throw new Error(
            `Không tìm thấy variant value cho ${value} trong ${name}`
          );
        }
        return variantValueId;
      });

      const sku = `${variantValueIds[0]}-${variantValueIds[1]}`;
      await db.ProductVariantValue.create(
        { product_id: productId, price, old_price, stock, sku },
        { transaction }
      );
    }
  }
}

// Xóa sản phẩm và các attribute/variant liên quan
export async function handleProductReferences(productId, transaction = null) {
  // Lấy danh sách productVariantValue.id của sản phẩm
  const productVariantValues = await db.ProductVariantValue.findAll({
    where: { product_id: productId },
    attributes: ["id", "sku"],
    raw: true,
    transaction,
  });

  const productVariantIds = productVariantValues.map((pvv) => pvv.id);

  // Kiểm tra các tham chiếu không cho phép xóa
  const blockingModels = [
    { model: db.OrderDetail, field: "product_variant_id", name: "OrderDetail" },
    { model: db.BannerDetail, field: "product_id", name: "BannerDetail" },
    { model: db.Feedback, field: "product_id", name: "Feedback" },
    { model: db.NewsDetail, field: "product_id", name: "NewsDetail" },
    { model: db.CartItem, field: "product_variant_id", name: "CartItem" },
  ];

  const blockingReferences = [];
  for (const { model, field, name } of blockingModels) {
    const whereClause =
      field === "product_id"
        ? { [field]: productId }
        : { [field]: productVariantIds };
    const count = await model.count({ where: whereClause, transaction });
    if (count > 0) blockingReferences.push(name);
  }

  if (blockingReferences.length > 0) {
    return { blockingReferences };
  }

  // Xử lý các tham chiếu có thể xóa
  await db.ProductAttributeValue.destroy({
    where: { product_id: productId },
    transaction,
  });

  const attributesToDelete = await db.Attribute.findAll({
    attributes: [
      "id",
      [
        db.sequelize.fn(
          "COUNT",
          db.sequelize.col("product_attribute_values.id")
        ),
        "pav_count",
      ],
    ],
    include: [
      {
        model: db.ProductAttributeValue,
        attributes: [],
        where: { product_id: productId },
        required: true,
      },
    ],
    group: ["Attribute.id"],
    having: db.sequelize.literal(`COUNT("product_attribute_values"."id") = 1`),
    transaction,
    raw: true,
  });

  if (attributesToDelete.length > 0) {
    await db.Attribute.destroy({
      where: { id: attributesToDelete.map((a) => a.id) },
      transaction,
    });
  }

  const variantValueIds = new Set();
  productVariantValues.forEach((pvv) =>
    pvv.sku
      ?.split("-")
      .map(Number)
      .forEach((id) => variantValueIds.add(id))
  );

  const allOtherVariants = await db.ProductVariantValue.findAll({
    where: {
      product_id: { [Op.ne]: productId },
      sku: { [Op.regexp]: Array.from(variantValueIds).join("|") },
    },
    attributes: ["sku"],
    transaction,
  });

  const variantValuesInUse = new Set();
  allOtherVariants.forEach((pvv) =>
    pvv.sku
      ?.split("-")
      .map(Number)
      .forEach((id) => {
        if (variantValueIds.has(id)) variantValuesInUse.add(id);
      })
  );

  const variantValuesToDelete = Array.from(variantValueIds).filter(
    (id) => !variantValuesInUse.has(id)
  );

  if (variantValuesToDelete.length > 0) {
    const variantValues = await db.VariantValue.findAll({
      where: { id: variantValuesToDelete },
      include: [{ model: db.Variant, attributes: ["id"] }],
      transaction,
    });

    const variantIds = new Set(variantValues.map((vv) => vv.variant_id));

    await db.VariantValue.destroy({
      where: { id: variantValuesToDelete },
      transaction,
    });

    for (const variantId of variantIds) {
      const remaining = await db.VariantValue.count({
        where: { variant_id: variantId },
        transaction,
      });
      if (remaining === 0) {
        await db.Variant.destroy({ where: { id: variantId }, transaction });
      }
    }
  }

  await db.ProductVariantValue.destroy({
    where: { product_id: productId },
    transaction,
  });

  return { blockingReferences: [] };
}
