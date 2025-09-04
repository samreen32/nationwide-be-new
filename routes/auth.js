const express = require("express");
const {
  getAllUsers,
  deleteCustomer,
  getUserDetails,
  editCustomer,
  getCounts,
} = require("../services/auth-services");
const validateRequest = require("../middleware/validateRequest");
const router = express.Router();

// register user
router.get("/usersList", getAllUsers);

router.get("/userDetails/:id", getUserDetails);

router.patch("/edit-user/:id", validateRequest, editCustomer);

router.delete("/delete-customer/:id", deleteCustomer);

router.get("/get-count", getCounts);

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
