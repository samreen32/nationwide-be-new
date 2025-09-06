const sgMail = require("@sendgrid/mail");
const path = require("path");
const ejs = require("ejs");
const Repair = require("../models/Repair");
const User = require("../models/User");

// Initialize SendGrid with your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
  try {
    const templatePath = path.join(__dirname, "../templates/invoice.ejs");
    const template = await ejs.renderFile(templatePath, {
      user,
      repair,
      workOrderNumber,
      currentDate,
    });

    const msg = {
      to: user.email,
      from: {
        email:
          process.env.SENDGRID_FROM_EMAIL ||
          "support@nationwidelaptoprepair.com",
        name: process.env.SENDGRID_FROM_NAME || "Nationwide Laptop Repair",
      },
      subject: "Nationwide Laptop Repair - Your Workorder",
      html: template,
    };

    await sgMail.send(msg);
    console.log("Invoice email sent to:", user.email);
  } catch (error) {
    console.error("SendGrid error in sendInvoiceEmail:", error);
    throw error; // Re-throw to handle in the calling function
  }
}

async function sendUpdateInvoiceEmail(
  user,
  repair,
  workOrderNumber,
  currentDate,
  status
) {
  try {
    const templatePath = path.join(
      __dirname,
      "../templates/update_invoice.ejs"
    );
    const template = await ejs.renderFile(templatePath, {
      user,
      repair,
      workOrderNumber,
      currentDate,
      status,
    });

    const msg = {
      to: user.email,
      from: {
        email:
          process.env.SENDGRID_FROM_EMAIL ||
          "support@nationwidelaptoprepair.com",
        name: process.env.SENDGRID_FROM_NAME || "Nationwide Laptop Repair",
      },
      subject: `Nationwide Laptop Repair - Workorder Update: ${status}`,
      html: template,
    };

    await sgMail.send(msg);
    console.log("Update email sent to:", user.email);
  } catch (error) {
    console.error("SendGrid error in sendUpdateInvoiceEmail:", error);
    throw error;
  }
}

async function registerForm(req, res) {
  try {
    const { user_list, form_list } = req.body;

    // Validate email exists
    if (!user_list?.email) {
      return res.status(400).json({
        status: 400,
        message: "Email address is required",
      });
    }

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

    // Send email
    await sendInvoiceEmail(user_list, form_list, workOrderNumber, currentDate);

    res.status(201).json({
      status: 201,
      message: "Repair form submitted successfully and email sent",
      data: newRepair,
    });
  } catch (error) {
    console.error("Error submitting repair form:", error);

    // Check if it's a SendGrid error
    if (error.response) {
      console.error("SendGrid error details:", error.response.body);
    }

    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
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

    // Send update email after response
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

    if (error.response) {
      console.error("SendGrid error details:", error.response.body);
    }

    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

// Keep your other functions (getAllRepairReports, deleteRepairForm, getRepairFormByWorkOrderNumber) as they are

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
