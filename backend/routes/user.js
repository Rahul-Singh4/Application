const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config");
const { User, Account } = require("../db");
const router = express.Router();
const { authMiddleware } = require("../middleware");
const signupSchema = zod.object({
  username: zod.string(),
  password: zod.string(),
  firstName: zod.string(),
  password: zod.string(),
});

router.post("/signup", async (req, res) => {
  const body = req.body;
  const { success } = signupSchema.safeParse(body);
  if (!success) {
    return res.json({
      message: "Email already taken / Incorrect Inputs",
    });
  }

  const user = User.findOne({
    username: body.username,
  });

  if (user._id) {
    return res.json({
      message: "Email already taken/ incorrect inputs",
    });
  }

  const dbUser = await User.create(body);
  const userId = dbUser._id;
  await Account.create({
    userId,
    balance: 1 + Math.random() * 100000,
  });
  const token = jwt.sign(
    {
      userId,
    },
    JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  res.json({
    message: "User created successfully",
    token: token,
  });
});

const signInSchema = zod.object({
  username: zod.string(),
  password: zod.string(),
});

router.post("/signin", async (req, res) => {
  const { success } = signInSchema.safeParse(req.body);
  if (!success) {
    res.statusCode(411).json({
      message: "Error while logging in",
    });
  }
});

const updateBody = zod.object({
  password: zod.string().optional(),
  firstName: zod.string().optional(),
  lastName: zod.string().optional(),
});
router.put("/", authMiddleware, async (req, res) => {
  const { success } = updateBody.safeParse(req.body);
  if (!success) {
    res.status(411).json({
      message: "Error while updating information",
    });
  }

  await User.updateOne(req.body, {
    id: req.userId,
  });

  res.json({
    message: "Updated successfully",
  });
});

router.get("/bulk", authMiddleware, async (req, res, next) => {
  const filter = req.query.filter || "";

  const users = await User.find({
    $or: [
      {
        firstName: {
          $regex: filter,
        },
      },
      {
        lastName: {
          $regex: filter,
        },
      },
    ],
  });

  res.json({
    user: users.map((user) => ({
      username: user.username,
      firstname: user.firstName,
      lastName: user.lastName,
      _id: user._id,
    })),
  });
});
module.exports = router;
