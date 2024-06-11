import asyncHandler from "express-async-handler";
import User from "../../models/userModel.js";
import VerificationToken from "../../models/verifyResetTokenModel.js";
import sendEmail from "../../utils/sendEmail.js";
const domainURL = process.env.DOMAIN;
const { randomBytes } = await import("crypto");

// $-title   Resend Email Verification Tokens
// $-path    POST /api/v1/auth/resend_email_token
// $-auth    Public

const resendEmailVerificationToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("An email must be provided");
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User with this email not found");
  }

  if (user.isEmailVerified) {
    res.status(400);
    throw new Error("This account has already been verified. Please login.");
  }

  let verificationToken = await VerificationToken.findOne({
    _userId: user._id,
  });

  if (verificationToken) {
    await verificationToken.deleteOne();
  }

  const newVerificationToken = randomBytes(32).toString("hex");
  let emailToken = await new VerificationToken({
    _userId: user._id,
    token: newVerificationToken,
  }).save();

  const emailLink = `${domainURL}/api/v1/auth/verify/${emailToken.token}/${user._id}`;

  const payload = {
    name: user.firstName,
    link: emailLink,
  };

  await sendEmail(
    user.email,
    "Account Verification",
    payload,
    "./emails/template/accountVerification.handlebars"
  );

  res.json({
    success: true,
    message: `${user.firstName}, an email has been sent to your account, please verify within 15 minutes`,
  });
});

export default resendEmailVerificationToken;
