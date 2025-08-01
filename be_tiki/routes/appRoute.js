import express from "express";
import asyncHandler from "../middlewares/asyncHandler.js";
import validate from "../middlewares/validate.js";
import validateImageExists from "../middlewares/validateImageExists.js";
import { jwtMiddleware } from "../middlewares/jwtMiddleware.js";

import * as productController from "../controllers/productController.js";
import * as categoryController from "../controllers/categoryController.js";
import * as brandController from "../controllers/brandController.js";
import * as orderController from "../controllers/orderController.js";
import * as orderdetailController from "../controllers/orderdetailController.js";
import * as cartController from "../controllers/cartController.js";
import * as cartitemController from "../controllers/cartItemController.js";
import * as userController from "../controllers/userController.js";
import * as newsController from "../controllers/newsController.js";
import * as newsdetailController from "../controllers/newsdetailController.js";
import * as bannerController from "../controllers/bannerController.js";
import * as bannerdetailController from "../controllers/bannerdetailController.js";
import * as imageController from "../controllers/imageController.js";
import * as productImageController from "../controllers/productImageController.js";

import insertProductRequest from "../dtos/requests/product/insertProductRequest.js";
import updateProductRequest from "../dtos/requests/product/updateProductRequest.js";
// import insertOrderRequest from "../dtos/requests/order/insertOrderRequest";
import updateOrderRequest from "../dtos/requests/order/updateOrderRequest.js";
import insertUserRequest from "../dtos/requests/user/insertUserRequest.js";
import insertNewsRequest from "../dtos/requests/news/insertNewsRequest.js";
import insertNewsDetailRequest from "../dtos/requests/newsdetail/insertNewsDetailRequest.js";
import updateNewsRequest from "../dtos/requests/news/updateNewsRequest.js";
import insertBannerRequest from "../dtos/requests/banner/insertBannerRequest.js";
import insertBannerDetailRequest from "../dtos/requests/bannerdetail/insertBannerDetailRequest.js";
import { uploadImagesMiddleware } from "../middlewares/uploadImagesMiddleware.js";
import insertProductImageRequest from "../dtos/requests/product_images/insertProductImageRequest.js";
import insertCartRequest from "../dtos/requests/carts/insertCartRequest.js";
import insertCartItemRequest from "../dtos/requests/cartitems/insertCartItemRequest.js";
import loginUserRequest from "../dtos/requests/user/loginUserRequest.js";

const router = express.Router();

export function appRoute(app) {
  // user route
  router.get(
    "/users",
    jwtMiddleware("ADMIN"),
    asyncHandler(userController.getUsers)
  );
  router.get(
    "/users/:id",
    jwtMiddleware("ADMIN", "USER"),
    asyncHandler(userController.getUserById)
  );
  router.post(
    "/users/register",
    validateImageExists,
    validate(insertUserRequest),
    asyncHandler(userController.registerUser)
  );
  router.post(
    "/users/login",
    validate(loginUserRequest),
    asyncHandler(userController.loginUser)
  );
  router.put(
    "/users/:id",
    jwtMiddleware("ADMIN", "USER"),
    asyncHandler(userController.updateUser)
  );
  router.delete(
    "/users/:id",
    jwtMiddleware("ADMIN", "USER"),
    asyncHandler(userController.deleteUser)
  );

  // product route
  router.get("/products/search", asyncHandler(productController.searchProducts)); // Thêm route để tìm kiếm sản phẩm
  router.get("/products", asyncHandler(productController.getProducts));
  router.get("/products/:id", asyncHandler(productController.getProductById));
  router.post(
    "/products",
    jwtMiddleware("ADMIN"),
    validate(insertProductRequest),
    validateImageExists,
    asyncHandler(productController.insertProduct)
  );
  router.put(
    "/products/:id",
    jwtMiddleware("ADMIN"),
    validate(updateProductRequest),
    validateImageExists,
    asyncHandler(productController.updateProduct)
  );
  router.delete(
    "/products/:id",
    jwtMiddleware("ADMIN"),
    asyncHandler(productController.deleteProduct)
  );

  // product image routes
  router.get(
    "/productimages",
    asyncHandler(productImageController.getProductImages)
  );
  router.get(
    "/productimages/:id",
    asyncHandler(productImageController.getProductImageById)
  );
  router.post(
    "/productimages",
    jwtMiddleware("ADMIN"),
    validate(insertProductImageRequest),
    asyncHandler(productImageController.insertProductImage)
  );
  router.delete(
    "/productimages/:id",
    jwtMiddleware("ADMIN"),
    asyncHandler(productImageController.deleteProductImage)
  );

  // category route
  router.get("/categories", asyncHandler(categoryController.getCategories));
  router.get(
    "/categories/:id",
    asyncHandler(categoryController.getCategoryById)
  );
  router.post(
    "/categories",
    jwtMiddleware("ADMIN"),
    validateImageExists,
    asyncHandler(categoryController.insertCategory)
  );
  router.put(
    "/categories/:id",
    jwtMiddleware("ADMIN"),
    validateImageExists,
    asyncHandler(categoryController.updateCategory)
  );
  router.delete(
    "/categories/:id",
    jwtMiddleware("ADMIN"),
    asyncHandler(categoryController.deleteCategory)
  );

  // brand route
  router.get("/brands", asyncHandler(brandController.getBrands));
  router.get("/brands/:id", asyncHandler(brandController.getBrandById));
  router.post(
    "/brands",
    jwtMiddleware("ADMIN"),
    validateImageExists,
    asyncHandler(brandController.insertBrand)
  );
  router.put(
    "/brands/:id",
    jwtMiddleware("ADMIN"),
    validateImageExists,
    asyncHandler(brandController.updateBrand)
  );
  router.delete(
    "/brands/:id",
    jwtMiddleware("ADMIN"),
    asyncHandler(brandController.deleteBrand)
  );

  // order route
  router.get("/orders", asyncHandler(orderController.getOrders));
  router.get("/orders/:id", asyncHandler(orderController.getOrderById));

  router.put(
    "/orders/:id",
    jwtMiddleware("ADMIN", "USER"),
    validate(updateOrderRequest),
    asyncHandler(orderController.updateOrder)
  );
  router.delete(
    "/orders/:id",
    jwtMiddleware("ADMIN"),
    asyncHandler(orderController.deleteOrder)
  );

  // order detail route
  router.get(
    "/orderdetails",
    jwtMiddleware("ADMIN", "USER"),
    asyncHandler(orderdetailController.getOrderDetails)
  );
  router.get(
    "/orderdetails/:id",
    jwtMiddleware("ADMIN", "USER"),
    asyncHandler(orderdetailController.getOrderDetailById)
  );
  router.post(
    "/orderdetails",
    jwtMiddleware("ADMIN"),
    asyncHandler(orderdetailController.insertOrderDetail)
  );
  router.put(
    "/orderdetails/:id",
    jwtMiddleware("ADMIN"),
    asyncHandler(orderdetailController.updateOrderDetail)
  );
  router.delete(
    "/orderdetails/:id",
    jwtMiddleware("ADMIN"),
    asyncHandler(orderdetailController.deleteOrderDetail)
  );

  // cart route
  router.get("/carts", asyncHandler(cartController.getCarts));
  router.get("/carts/:id", asyncHandler(cartController.getCartById));
  router.post(
    "/carts",
    validate(insertCartRequest),
    asyncHandler(cartController.insertCart)
  );
  router.delete("/carts/:id", asyncHandler(cartController.deleteCart));
  router.post("/carts/checkout", asyncHandler(cartController.checkoutCart));

  // cart item route
  router.get(
    "/cartitems",
    jwtMiddleware("ADMIN", "USER"),
    asyncHandler(cartitemController.getCartItems)
  );
  router.get(
    "/cartitems/:id",
    jwtMiddleware("ADMIN", "USER"),
    asyncHandler(cartitemController.getCartItemById)
  );
  router.post(
    "/cartitems",
    validate(insertCartItemRequest),
    asyncHandler(cartitemController.insertCartItem)
  );
  router.put(
    "/cartitems/:id",
    jwtMiddleware("ADMIN"),
    asyncHandler(cartitemController.updateCartItem)
  );
  router.delete(
    "/cartitems/:id",
    jwtMiddleware("ADMIN", "USER"),
    asyncHandler(cartitemController.deleteCartItem)
  );

  // news route
  router.get("/news", asyncHandler(newsController.getNews));
  router.get("/news/:id", asyncHandler(newsController.getNewsById));
  router.post(
    "/news",
    jwtMiddleware("ADMIN", "USER"),
    validate(insertNewsRequest),
    validateImageExists,
    asyncHandler(newsController.insertNews)
  );
  router.put(
    "/news/:id",
    jwtMiddleware("ADMIN", "USER"),
    validate(updateNewsRequest),
    validateImageExists,
    asyncHandler(newsController.updateNews)
  );
  router.delete(
    "/news/:id",
    jwtMiddleware("ADMIN", "USER"),
    asyncHandler(newsController.deleteNews)
  );

  // news detail route
  router.get("/newsdetails", asyncHandler(newsdetailController.getNewsDetails));
  router.get(
    "/newsdetails/:id",
    asyncHandler(newsdetailController.getNewsDetailById)
  );
  router.post(
    "/newsdetails",
    validate(insertNewsDetailRequest),
    jwtMiddleware("ADMIN", "USER"),
    asyncHandler(newsdetailController.insertNewsDetail)
  );
  router.put(
    "/newsdetails/:id",
    jwtMiddleware("ADMIN", "USER"),
    asyncHandler(newsdetailController.updateNewsDetail)
  );
  router.delete(
    "/newsdetails/:id",
    jwtMiddleware("ADMIN", "USER"),
    asyncHandler(newsdetailController.deleteNewsDetail)
  );

  // banner route
  router.get("/banners", asyncHandler(bannerController.getBanners));
  router.get("/banners/:id", asyncHandler(bannerController.getBannerById));
  router.post(
    "/banners",
    jwtMiddleware("ADMIN"),
    validate(insertBannerRequest),
    validateImageExists,
    asyncHandler(bannerController.insertBanner)
  );
  router.put(
    "/banners/:id",
    jwtMiddleware("ADMIN"),
    validateImageExists,
    asyncHandler(bannerController.updateBanner)
  );
  router.delete(
    "/banners/:id",
    jwtMiddleware("ADMIN"),
    asyncHandler(bannerController.deleteBanner)
  );

  // banner detail route
  router.get(
    "/bannerdetails",
    asyncHandler(bannerdetailController.getBannerDetails)
  );
  router.get(
    "/bannerdetails/:id",
    asyncHandler(bannerdetailController.getBannerDetailById)
  );
  router.post(
    "/bannerdetails",
    jwtMiddleware("ADMIN"),
    validate(insertBannerDetailRequest),
    asyncHandler(bannerdetailController.insertBannerDetail)
  );
  router.put(
    "/bannerdetails/:id",
    jwtMiddleware("ADMIN"),
    asyncHandler(bannerdetailController.updateBannerDetail)
  );
  router.delete(
    "/bannerdetails/:id",
    jwtMiddleware("ADMIN"),
    asyncHandler(bannerdetailController.deleteBannerDetail)
  );

  // image route
  router.post(
    "/images/upload",
    jwtMiddleware("ADMIN", "USER"),
    uploadImagesMiddleware,
    asyncHandler(imageController.uploadImages)
  );
  router.get("/images/:fileName", asyncHandler(imageController.viewImage));
  router.delete(
    "/images/delete",
    jwtMiddleware("ADMIN", "USER"),
    asyncHandler(imageController.deleteImage)
  );

  app.use("/api", router);
}
