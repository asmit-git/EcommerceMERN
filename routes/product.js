const express = require("express");
const router = express.Router();

const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const {
  create,
  productById,
  read,
  remove,
  update,
  list,
  listRelated,
  listCategories,
  listBySearch,
  image
} = require("../controllers/product");

const { userById } = require("../controllers/user");

//CRUD routes in order
router.post("/product/create/:userId", requireSignin, isAuth, isAdmin, create);
router.get("/product/:productId", read);
router.put("/product/:productId/:userId", requireSignin, isAuth, isAdmin, update);
router.delete("/product/:productId/:userId", requireSignin, isAuth, isAdmin, remove);
router.get("/products", list);
router.get("/products/related/:productId", listRelated);
router.get("/products/categories", listCategories);
router.post("/products/bySearch", listBySearch);
router.get("/products/image/:productId", image);

router.param("userId", userById);
router.param("productId", productById);

module.exports = router;
