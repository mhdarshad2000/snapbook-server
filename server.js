const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();

const { readdirSync } = require("fs");

app.use(express.json());
app.use(cors());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

readdirSync("./routes").map((r) => app.use("/", require("./routes/" + r)));

//Database
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
  })
  .then(() => console.log("Database connected Succesffully"))
  .catch((err) => console.log("error connecting MongoDB" + err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server Connected ${PORT}`);
});
