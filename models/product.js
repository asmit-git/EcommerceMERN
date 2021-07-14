const { text } = require("body-parser");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    short_description: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      data: Buffer,
      contentType: String,
    },
    stock: {
      type: Number,
      trim: true,
      required: true,
    },
    sold: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      trim: true,
      required: true,
    },
    discount: {
      type: Number,
      trim: true,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
      maxlength: 32,
    },
    unit: {
      type: String,
      maxlength: 32,
      required: false,
    },
    min_weight: {
      type: Number,
      trim: true,
      required: true,
    },
    shape: {
      type: String,
      maxlength: 32,
      required: false,
    },
    flavor: {
      type: String,
      maxlength: 32,
      required: false,
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    category: {
      type: ObjectId,
      ref: "Category",
      required: true,
    },
    meta_title: {
      type: String,
      required: true,
      maxlength: 80,
    },
    meta_description: {
      type: String,
      required: true,
      maxlength: 180,
    },
    meta_keywords: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true
    },
    reviews: [
      {
        userId: ObjectId,
        ref: "User",
        type: String,
      },
    ],
    createdBy: {
      type: ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
