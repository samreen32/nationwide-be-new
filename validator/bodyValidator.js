const { body } = require("express-validator");

const insertUserInfoValidationRules = [
    body("user_list.firstname").notEmpty().withMessage("First name is required"),
    body("user_list.lastname").notEmpty().withMessage("Last name is required"),
    body("user_list.phone").notEmpty().withMessage("Phone is required"),
    body("user_list.email").notEmpty().withMessage("Email is required"),
    body("user_list.address").notEmpty().withMessage("Address is required"),
    body("user_list.city").notEmpty().withMessage("City is required"),
    body("user_list.state").notEmpty().withMessage("State is required"),
    body("user_list.zip").notEmpty().withMessage("Zip code is required"),
    body("form_list.model").notEmpty().withMessage("Model is required"),
    body("form_list.serialNum").notEmpty().withMessage("Serial number is required"),
    body("form_list.description").notEmpty().withMessage("Description is required"),
];

module.exports = {
    insertUserInfoValidationRules,
};