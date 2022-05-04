const { model, Schema } = require("mongoose");

const departmentsSchema = new Schema({
  username: String,
  departmentno: String,
  departmentname: String,
  departmentdescription: String,
  createdAt: String,
});

module.exports = model("Department", departmentsSchema);
