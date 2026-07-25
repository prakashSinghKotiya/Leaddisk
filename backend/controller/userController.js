import User from "../model/userModel.js";

export const userSubmission = async (req, res, next) => {
  try {
    const { name, email, budget, message } = req.body;

    // Server-side validation
    const errors = [];

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      errors.push("Name is required and must be at least 2 characters");
    }

    if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      errors.push("A valid email address is required");
    }

    if (!budget || isNaN(Number(budget)) || Number(budget) < 0) {
      errors.push("Budget is required and must be a positive number");
    }

    if (!message || typeof message !== "string" || message.trim().length < 10) {
      errors.push("Message is required and must be at least 10 characters");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        status: "fail",
        errors,
      });
    }

    const userDb = await User.create({
      email: email.toLowerCase().trim(),
      name: name.trim(),
      budget: Number(budget),
      message: message.trim(),
    });

    res.status(201).json({
      status: "success",
      message: "Your lead has been submitted successfully",
      data: userDb,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: "fail",
        errors: ["This email has already submitted a lead"],
      });
    }
    console.log(error);
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: allUsers.length,
      data: allUsers,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        status: "fail",
        message: "Please provide a search query",
      });
    }

    const searchRegex = new RegExp(q.trim(), "i");

    const users = await User.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { message: searchRegex },
        { status: searchRegex },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: users.length,
      data: users,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    const validStatuses = ["new", "Contacted", "Closed"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        status: "fail",
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "Lead not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
