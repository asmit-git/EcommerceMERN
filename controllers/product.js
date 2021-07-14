const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const { errorHandler } = require("../helpers/dbErrorHandler");
const Product = require("../models/product");

exports.productById = (req, res, next, id) => {
  Product.findById(id).exec((err, product) => {
    if (err || !product) {
      return res.status(400).json({
        error: "product not found",
      });
    }
    req.product = product;
    next();
  });
};

//CRUD Operations in order

exports.create = (req, res) => {
  let form = new formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "image couldnot be uploaded"
      })
    }
    let product = new Product(fields)
    if (files.image) {
      if (files.image.size > 1000000) {
        return res.status(400).json({
          error: "Maximum image size allowed is 1 MB only",
        });
      }
      product.image.data = fs.readFileSync(files.image.path);
      product.image.contentType = files.image.type;
    }
    product.save((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(data);
    });
  })
};

exports.read = (req, res) => {
  req.product.image = undefined;
  return res.json(req.product);
};

exports.update = (req, res) => {
  const product = req.product;
  product.save((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    res.json({
      data,
    });
  });
};
exports.remove = (req, res) => {
  let product = req.product
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      })
    }
    res.json({
      message: "product deleted successfully"
    })
  })
};


/** Products by sell and arrivals
 * by sell= /products?sortBy=sold&order=desc&limit=4
 * by arrival = /products?sortBy=createdAt&order=desc&limit=4
 * if no params are sent, all products are returned
**/

exports.list = (req, res) => {
  let order = req.query.order ? req.query.order : "asc"
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id"
  let limit = req.query.limit ? parseInt(req.query.limit) : 6

  Product.find({ isFeatured: true })
    .select("-image")
    .populate("category", "_id name")
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "products not found"
        })
      }
      res.json(products);
    })
}

/**
 * it will find the products based on the req product category
 * other products that has the same category will be returned
 */
exports.listRelated = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 6

  Product.find({ _id: { $ne: req.product }, category: req.product.category })
    .select("-image")
    .limit(limit)
    .populate('category', '_id name')
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "products not found"
        })
      }
      res.json(products);
    });
};

exports.listCategories = (req, res) => {
  Product.distinct("category", {}, (err, categories) => {
    if (err) {
      return res.status(400).json({
        error: "Categories not found"
      });
    }
    res.json(categories);
  });
}

/**
 * list products by search
 * product search for react frontend
 * categories in checkbox and price range in radio buttons
 * make api requests and show the products to users based on what he wants
 */

exports.listBySearch = (req, res) => {
  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip);
  let findArgs = {};

  // console.log(order, sortBy, limit, skip, req.body.filters);
  // console.log("findArgs", findArgs);

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        // gte -  greater than price [0-10]
        // lte - less than
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1]
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  Product.find(findArgs)
    .select("-image")
    .populate("category", "_id name")
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found"
        });
      }
      res.json({
        size: data.length,
        data
      });
    });
};



/**
 * Return the product image
 */
exports.image = (req, res, next) => {
  if (req.product.image.data) {
    res.set('Content-Type', req.product.image.contentType)
    return res.send(req.product.image.data)
  }
  next();
}
