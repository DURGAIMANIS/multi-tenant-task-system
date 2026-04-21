import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Company from "../models/Company.js";
import { getCompanyDB, generateDbName } from "./connectionManager.js";
import { getAdminModel } from "../models/tenant/Admin.js";
import generateToken from "../utils/generateToken.js";

export const setupPassport = () => {
  const clientID     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL  = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";

  if (!clientID || !clientSecret || clientSecret === "your_client_secret_here") {
    console.log("⚠️  Google OAuth not configured — skipping strategy registration");
    return false;
  }

  passport.use(
    new GoogleStrategy(
      { clientID, clientSecret, callbackURL },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email       = profile.emails[0].value;
          const companyName = `org_${profile.id}`;

          let company = await Company.findOne({ companyName });
          if (!company) {
            const dbName = generateDbName(companyName);
            company = await Company.create({ companyName, dbName, email });
          }

          const conn  = await getCompanyDB(company.dbName);
          const Admin = getAdminModel(conn);

          let user = await Admin.findOne({ email });
          if (!user) {
            user = await Admin.create({
              name: profile.displayName, email, role: "admin",
              isOnline: true, lastLoginAt: new Date(), lastActiveAt: new Date(),
            });
          } else {
            await Admin.findByIdAndUpdate(user._id, {
              isOnline: true, lastLoginAt: new Date(), lastActiveAt: new Date(),
            });
          }

          user.jwtToken    = generateToken(user, company.dbName);
          user.companyName = company.companyName;
          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );

  console.log("✅ Google OAuth strategy registered");
  return true;
};

export default passport;
