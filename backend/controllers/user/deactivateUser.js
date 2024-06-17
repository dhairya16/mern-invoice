import asyncHandler from "express-async-handler";
import User from "../../models/userModel.js";

// $-title   Deactivate User Account
// $-path    PATCH /api/v1/user/:id/deactivate
// $-auth    Private/Admin
// An admin user can deactivate any other user account.

const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.active = false;
  const updatedUser = await user.save();
  res.json(updatedUser);
});

export default deactivateUser;
