const User = require("../models/User");
const Repair = require("../models/Repair");

async function getAllUsers(req, res) {
  const { page = 1, limit = 10 } = req.query;
  try {
    const users = await User.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalUsers = await User.countDocuments();
    res.status(200).json({
      status: 200,
      message: "Users fetched successfully",
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalRecords: totalUsers,
        recordsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
}

async function getUserDetails(req, res) {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }
    const repairs = await Repair.find({
      "user_list.email": user.nation_users.email,
    }).sort({ date: -1 });
    const repairForms = repairs.map((repair) => ({
      model: repair.form_list.model,
      serialNum: repair.form_list.serialNum,
      modalImage: repair.form_list.modelImage,
      description: repair.form_list.description,
      workOrderNumber: repair.workOrderNumber,
      status: repair.status,
      date: repair.date,
    }));

    res.status(200).json({
      status: 200,
      message: "User details fetched successfully",
      data: {
        user: {
          nation_users: user.nation_users,
          _id: user._id,
          date: user.date,
        },
        repairs: repairForms,
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
}

async function editCustomer(req, res) {
  const userId = req.params.id;
  const updateFields = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }
    if (updateFields.nation_users) {
      Object.keys(updateFields.nation_users).forEach((key) => {
        user.nation_users[key] = updateFields.nation_users[key];
      });
    }
    const updatedUser = await user.save();
    res.status(200).json({
      status: 200,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
}

async function deleteCustomer(req, res) {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }
    res.status(200).json({
      status: 200,
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
}

async function getCounts(req, res) {
  try {
    const totalUsers = await User.countDocuments();
    const totalForms = await Repair.countDocuments();
    const completedForms = await Repair.countDocuments({ status: "completed" });
    const pendingForms = await Repair.countDocuments({ status: "pending" });
    const shipForms = await Repair.countDocuments({ status: "ship" });
    const recievedForms = await Repair.countDocuments({ status: "received" });

    const currentYear = new Date().getFullYear();
    const monthlyUserCounts = [];
    const monthlyFormCounts = [];

    for (let month = 0; month < 12; month++) {
      const startOfMonth = new Date(currentYear, month, 1);
      const endOfMonth = new Date(currentYear, month + 1, 1);

      const usersThisMonth = await User.countDocuments({
        date: { $gte: startOfMonth, $lt: endOfMonth },
      });
      const formsThisMonth = await Repair.countDocuments({
        createdAt: { $gte: startOfMonth, $lt: endOfMonth },
      });

      monthlyUserCounts.push({ month: month + 1, count: usersThisMonth });
      monthlyFormCounts.push({ month: month + 1, count: formsThisMonth });
    }

    res.status(200).json({
      status: 200,
      message: "Counts fetched successfully",
      data: {
        totalUsers,
        totalForms,
        completedForms,
        pendingForms,
        shipForms,
        recievedForms,
        monthlyUserCounts,
        monthlyFormCounts,
      },
    });
  } catch (error) {
    console.error("Error fetching counts:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
}

module.exports = {
  getAllUsers,
  getUserDetails,
  editCustomer,
  deleteCustomer,
  getCounts,
};
