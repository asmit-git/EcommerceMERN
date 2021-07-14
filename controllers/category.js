const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const { errorHandler } = require("../helpers/dbErrorHandler");
const Category = require("../models/category");



exports.categoryById = (req, res, next, id) => {
  Category.findById(id).exec((err, category) => {
    if (err || !category) {
      return res.status(400).json({
        error: "category not found",
      });
    }
    req.category = category;
    console.log(req.category);
    next();
  });
};

//CATEGORIES CRUD

function createCategories(data, parentId = null) {
  const categories = [];
  let category;
  if (parentId === null) {
    category = data.filter((cat) => cat.parentId == undefined);
  } else {
    category = data.filter((cat) => cat.parentId == parentId);
  }
  for (let cate of category) {
    categories.push({
      _id: cate._id,
      name: cate.name,
      slug: cate.slug,
      isFeatured: cate.isFeatured,
      isActive: cate.isActive,
      // image: cate.image,
      description: cate.description,
      meta_title: cate.meta_title,
      meta_description: cate.meta_description,
      meta_keywords: cate.meta_keywords,
      sub_categories: createCategories(data, cate._id),
    });
  }

  return categories;
}

exports.create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image Couldnot be uploaded",
      });
    }

    //check for fields
    const { name, slug, description, meta_title, meta_description } = fields;

    if (!name || !slug || !description || !meta_title || !meta_description) {
      return res.status(400).json({
        eror: "Seems like you have missed some required fields",
      });
    }
    let category = new Category(fields);
    if (files.image) {
      if (files.image.size > 1000000) {
        return res.status(400).json({
          error: "Maximum image size allowed is 1 MB only",
        });
      }
      category.image.data = fs.readFileSync(files.image.path);
      category.image.contentType = files.image.type;
    }

    category.save((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(data);
    });
  });
};

exports.list = (req, res) => {
  Category.find().exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    const categories = createCategories(data);
    res.json({
      categories,
    });
  });
};



exports.read = (req, res) => {
  req.category.image = undefined
  return res.json(req.category);
};


exports.update = (req, res) => {
  const category = req.category;
  category.name = req.body.name;
  category.save((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }
    res.json(data);
  })
};

exports.remove = (req, res) => {
  const category = req.category;
  category.remove((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }
    res.json({
      message: "Category Deleted Successfully"
    });
  })
};
