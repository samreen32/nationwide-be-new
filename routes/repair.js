const express = require("express");
const {
  registerForm,
  getAllRepairReports,
  updateRepairForm,
  deleteRepairForm,
  getRepairFormByWorkOrderNumber,
} = require("../services/repair-services");
const validateRequest = require("../middleware/validateRequest");
const { insertUserInfoValidationRules } = require("../validator/bodyValidator");
const router = express.Router();

// register user
router.post(
  "/register-form",
  insertUserInfoValidationRules,
  validateRequest,
  registerForm
);

router.get("/repair-reports", getAllRepairReports);

router.patch("/update-repair/:id", validateRequest, updateRepairForm);

router.delete("/delete-repair/:id", deleteRepairForm);
router.get("/workorder/:workOrderNumber", getRepairFormByWorkOrderNumber);

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
