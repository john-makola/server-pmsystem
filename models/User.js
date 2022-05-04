const { model, Schema } = require("mongoose");

const userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  mobileno: String,
  payrollno: String,
  surname: String,
  firstname: String,
  othernames: String,
  designation: String,
  department: { type: Schema.Types.ObjectId, ref: "Department" },
  jobgroup: { type: Schema.Types.ObjectId, ref: "JobGroup" },
  role: { type: Schema.Types.ObjectId, ref: "Role" },
  task: { type: Schema.Types.ObjectId, ref: "Task" },
  target: { type: Schema.Types.ObjectId, ref: "Target" },
  training: { type: Schema.Types.ObjectId, ref: "Training" },
  createdAt: String,
});

module.exports = model("User", userSchema);
