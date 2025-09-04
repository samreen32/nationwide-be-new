const Blog = require("../models/Blogs");

// Create a new blog
async function createBlog(req, res) {
  try {
    const {
      blogTitle,
      blogDesc,
      blogImage,
      blogTag,
      metaTitle,
      metaDescription,
      canonicalUrl,
      keywords,
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle,
      twitterDescription,
      twitterImage,
    } = req.body;

    const newBlog = new Blog({
      nation_blogs: {
        blogTitle,
        blogDesc,
        blogImage,
        blogTag,
        metaTitle: metaTitle,
        metaDescription: metaDescription,
        canonicalUrl: canonicalUrl || "",
        keywords: keywords,
        ogTitle: ogTitle || blogTitle,
        ogDescription: ogDescription || blogDesc?.substring(0, 160),
        ogImage: ogImage || blogImage,
        twitterTitle: twitterTitle || blogTitle,
        twitterDescription: twitterDescription || blogDesc?.substring(0, 160),
        twitterImage: twitterImage || blogImage,
      },
    });
    const savedBlog = await newBlog.save();
    res.status(201).json({
      success: true,
      message: "Blog created successfully!",
      data: savedBlog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// Get all blogs
async function getAllBlogs(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;
    const blogs = await Blog.find().sort({ date: -1 }).skip(skip).limit(limit);
    const totalBlogs = await Blog.countDocuments();
    const totalPages = Math.ceil(totalBlogs / limit);
    res.status(200).json({
      success: true,
      message: "Blogs fetched successfully!",
      data: blogs,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalBlogs: totalBlogs,
        blogsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// Get a specific blog by ID
async function getBlogById(req, res) {
  try {
    const blogId = req.params.id;
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Blog fetched successfully!",
      data: blog,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// Edit a specific blog by ID
async function editBlogById(req, res) {
  try {
    const blogId = req.params.id;
    const { blogTitle, blogDesc, blogImage, blogTag } = req.body;
    const updateFields = {};
    if (blogTitle !== undefined)
      updateFields["nation_blogs.blogTitle"] = blogTitle;
    if (blogDesc !== undefined)
      updateFields["nation_blogs.blogDesc"] = blogDesc;
    if (blogImage !== undefined)
      updateFields["nation_blogs.blogImage"] = blogImage;
    if (blogTag !== undefined) updateFields["nation_blogs.blogTag"] = blogTag;
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update.",
      });
    }
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { $set: updateFields },
      { new: true }
    );
    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Blog updated successfully!",
      data: updatedBlog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// Delete a specific blog by ID
async function deleteBlogById(req, res) {
  try {
    const blogId = req.params.id;
    const deletedBlog = await Blog.findByIdAndDelete(blogId);
    if (!deletedBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Blog deleted successfully!",
      data: deletedBlog,
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  editBlogById,
  deleteBlogById,
};
