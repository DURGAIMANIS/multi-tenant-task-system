import dotenv from "dotenv";
dotenv.config();

import { setupPassport } from "./config/passport.js";
setupPassport(); // must run after dotenv.config()

import connectMainDB from "./config/db.js";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

connectMainDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
