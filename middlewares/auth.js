import jwt from "jsonwebtoken";

// Authentication middleware
export const auth = (req, res, next) => {
  try {
    // Get the token from the header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No authentication token, access denied" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
