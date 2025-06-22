const sanitize = require("mongo-sanitize");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { tokenValidationSchema } = require("../../model/student_account.model");
const {
  studentModel,
  verifyTokenModel,
} = require("../../model/student_account.model");
const { generateAccessToken } = require("../../middleware/tokens");

const verifyStudentAccount = async (req, res) => {
  try {
    const rawToken = req.method === "GET" ? req.query.token : req.body.token;
    const sanitizedData = {
      token: sanitize(rawToken),
    };

    const { error, value } = tokenValidationSchema.validate(sanitizedData);
    if (error)
      return res.status(401).json({ message: error.details[0].message });

    const mainToken = value.token;

    //hash the token
    const hashed = crypto.createHash("sha256").update(mainToken).digest("hex");

    // //check if hashed token matches
    const record = await verifyTokenModel.findOne({ hash: hashed });

    if (!record) {
      return res.status(400).send(`Invalid or expired token.`);
    }

    //verify the token with jwt
    let decodedUser;
    try {
      decodedUser = jwt.verify(mainToken, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(403).json({ message: "Token expired" });
      }
      if (error.name === "JsonWebTokenError") {
        return res.status(403).json({ message: "Invalid token" });
      }
      throw error; // re-throw for general catch
    }
    // you can also use this from the middleware
    // const decodedUser = req.user; // The token is valid and req.user is available
    // update the field verifed once the token has been verified
    await studentModel.updateOne({ _id: decodedUser.id }, { verified: true });
    await verifyTokenModel.deleteMany({ tokenId: decodedUser.id });

    const account = await studentModel.findOne({
      _id: decodedUser.id,
    });

    const accesstoken = generateAccessToken(account);

    res.status(201).json({
      message:
        "your account has been verififed, you can now login with your login details",
      newtoken: accesstoken,
      token: value.token,
      hash: record.hash,
      hashed: hashed,
    });
  } catch (error) {
    res.status(500).json({ message: "could not verify student", data: error });
  }
};

module.exports = verifyStudentAccount;
