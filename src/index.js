// require("dotenv").config();
import dotenv from "dotenv";

import connectDB from "./db/index.js";

dotenv.config({
  path: "./env",
});
const PORT = process.env.PORT || 8000;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("mongo connection fail", err);
  });

// const app = express()(async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}`);
//     app.on("error", (error) => {
//       console.log("ERROR : ", error);
//       throw error;
//     });
//     app.listen(process.env.PORT, () => {
//       console.log(`App is listening on port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.error("ERROR: ", error);
//     throw error;
//   }
// })();
