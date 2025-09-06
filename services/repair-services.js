const Repair = require("../models/Repair");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
require("dotenv").config();

console.log("Environment variables:");
console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
console.log("EMAIL_PORT:", process.env.EMAIL_PORT);
console.log("EMAIL_USER:", process.env.EMAIL_USER);

// Email configuration - UPDATE THESE VALUES
const emailConfig = {
  host: process.env.EMAIL_HOST || "smtp.office365.com",
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "support@nationwidelaptoprepair.com",
    pass: process.env.EMAIL_PASS || "SupportAt2802$",
  },
  tls: {
    ciphers: process.env.EMAIL_CIPHERS || "SSLv3",
    rejectUnauthorized: false,
  },
};

console.log("Final email configuration:", {
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  user: emailConfig.auth.user,
});

const transporter = nodemailer.createTransport(emailConfig);

// Test SMTP connection
async function testSMTPConnection() {
  try {
    await transporter.verify();
    console.log("SMTP connection verified successfully");
    return true;
  } catch (error) {
    console.error("SMTP connection failed:", error.message);

    // Provide specific troubleshooting advice based on error
    if (error.code === "EAUTH") {
      console.error("Authentication failed. Please check:");
      console.error("1. Your email username and password in .env file");
      console.error("2. That your email account is active and not locked");
      console.error("3. If you need to use an app-specific password");
    } else if (error.code === "ECONNECTION") {
      console.error("Connection failed. Please check:");
      console.error("1. Your SMTP host and port settings");
      console.error("2. Your internet connection");
      console.error("3. Firewall settings that might block SMTP");
    }

    return false;
  }
}

// Initialize and test connection
testSMTPConnection();

async function generateWorkOrderNumber(state) {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const datePart = `${year}${month}${day}`;
  const lastWorkOrder = await Repair.findOne({
    workOrderNumber: { $regex: `^${state}-${datePart}-` },
  }).sort({ workOrderNumber: -1 });
  let seq = "01";
  if (lastWorkOrder) {
    const lastSeq = lastWorkOrder.workOrderNumber.split("-")[2];
    seq = String(parseInt(lastSeq, 10) + 1).padStart(2, "0");
  }
  return `${state}-${datePart}-${seq}`;
}

async function sendInvoiceEmail(user, repair, workOrderNumber, currentDate) {
  const templatePath = path.join(__dirname, "../templates/invoice.ejs");
  const template = await ejs.renderFile(templatePath, {
    user,
    repair,
    workOrderNumber,
    currentDate,
  });
  const mailOptions = {
    from: "support@nationwidelaptoprepair.com",
    to: user.email,
    subject: "Nationwide Laptop Repair - Your Workorder",
    html: template,
  };
  await transporter.sendMail(mailOptions);
}

async function registerForm(req, res) {
  try {
    const { user_list, form_list } = req.body;
    const existingUser = await User.findOne({
      "nation_users.email": user_list.email,
    });
    if (!existingUser) {
      const newUser = new User({
        nation_users: {
          firstname: user_list.firstname,
          lastname: user_list.lastname,
          phone: user_list.phone,
          email: user_list.email,
          address: user_list.address,
          city: user_list.city,
          state: user_list.state,
          zip: user_list.zip,
        },
      });
      await newUser.save();
    }
    const workOrderNumber = await generateWorkOrderNumber(user_list.state);
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const newRepair = new Repair({
      user_list,
      form_list,
      workOrderNumber,
    });
    await newRepair.save();
    await sendInvoiceEmail(user_list, form_list, workOrderNumber, currentDate);
    res.status(201).json({
      status: 201,
      message: "Repair form submitted successfully",
      data: newRepair,
    });
  } catch (error) {
    console.error("Error submitting repair form:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
}

async function getAllRepairReports(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const repairReports = await Repair.find(
      {},
      "_id workOrderNumber user_list form_list status date"
    )
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const totalRepairReports = await Repair.countDocuments();

    res.status(200).json({
      status: 200,
      message: "Repair reports fetched successfully",
      data: repairReports.map((report) => ({
        id: report._id,
        workOrderNumber: report.workOrderNumber,
        user: report.user_list,
        repairDetails: report.form_list,
        status: report.status,
        date: report.date,
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRepairReports / limit),
        totalRecords: totalRepairReports,
        recordsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching repair reports:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
}

async function sendUpdateInvoiceEmail(
  user,
  repair,
  workOrderNumber,
  currentDate,
  status
) {
  const templatePath = path.join(__dirname, "../templates/update_invoice.ejs");
  const template = await ejs.renderFile(templatePath, {
    user, // Pass the user object
    repair, // Pass the repair object
    workOrderNumber, // Pass the work order number
    currentDate, // Pass the current date
    status, // Pass the status
  });
  const mailOptions = {
    from: "support@nationwidelaptoprepair.com",
    to: user.email,
    subject: "Nationwide Laptop Repair - Your Workorder",
    html: template,
  };
  await transporter.sendMail(mailOptions);
}

async function updateRepairForm(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedRepair = await Repair.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedRepair) {
      return res.status(404).json({
        status: 404,
        message: "Repair form not found",
      });
    }
    res.status(200).json({
      status: 200,
      message: "Repair form updated successfully",
      data: updatedRepair,
    });
    const { user_list, form_list, workOrderNumber, status } = updatedRepair;
    const currentDate = new Date().toLocaleDateString();
    await sendUpdateInvoiceEmail(
      user_list,
      form_list,
      workOrderNumber,
      currentDate,
      status
    );
  } catch (error) {
    console.error("Error updating repair form:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
}

async function deleteRepairForm(req, res) {
  try {
    const { id } = req.params;
    const deletedRepair = await Repair.findByIdAndDelete(id);
    if (!deletedRepair) {
      return res.status(404).json({
        status: 404,
        message: "Repair form not found",
      });
    }
    res.status(200).json({
      status: 200,
      message: "Repair form deleted successfully",
      data: deletedRepair,
    });
  } catch (error) {
    console.error("Error deleting repair form:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
}

async function getRepairFormByWorkOrderNumber(req, res) {
  try {
    const { workOrderNumber } = req.params;
    const repairForm = await Repair.findOne({ workOrderNumber });
    if (!repairForm) {
      return res.status(404).json({
        status: 404,
        message: "Repair form not found",
      });
    }
    res.status(200).json({
      status: 200,
      message: "Repair form fetched successfully",
      data: {
        id: repairForm._id,
        workOrderNumber: repairForm.workOrderNumber,
        user: repairForm.user_list,
        repairDetails: repairForm.form_list,
        status: repairForm.status,
        date: repairForm.date,
      },
    });
  } catch (error) {
    console.error("Error fetching repair form:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
}

module.exports = {
  registerForm,
  getAllRepairReports,
  updateRepairForm,
  deleteRepairForm,
  getRepairFormByWorkOrderNumber,
};
