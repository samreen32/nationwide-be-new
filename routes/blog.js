const express = require("express");
const validateRequest = require("../middleware/validateRequest");
const {
  createBlog,
  getAllBlogs,
  editBlogById,
  deleteBlogById,
  getBlogById,
} = require("../services/blog-services");
const router = express.Router();

router.post("/", validateRequest, createBlog);

router.get("/", getAllBlogs);

router.get("/:id", getBlogById);

router.patch("/:id", validateRequest, editBlogById);

router.delete("/:id", deleteBlogById);

router.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: "Resource Not Found",
  });
});

router.use((req, res) => {
  res.status(408).json({
    status: 408,
    message: "Request Timeout - The server took too long to respond",
  });
});

module.exports = router;
