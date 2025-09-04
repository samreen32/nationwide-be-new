const mongoose = require("mongoose");
const { Schema } = mongoose;

const blogSchema = new Schema({
  nation_blogs: {
    blogTitle: { type: String },
    blogDesc: { type: String },
    blogImage: { type: String },
    blogTag: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String },
    canonicalUrl: { type: String },
    keywords: { type: [String], default: [] },
    ogTitle: { type: String },
    ogDescription: { type: String },
    ogImage: { type: String },
    twitterTitle: { type: String },
    twitterDescription: { type: String },
    twitterImage: { type: String },
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Blogs = mongoose.model("nationBlogs", blogSchema);
module.exports = Blogs;
