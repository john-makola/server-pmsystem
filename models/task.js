const { model, Schema } = require("mongoose");

const taskSchema = new Schema({
  username: String,
  taskname: String,
  taskno: String,
  startdate: Date,
  enddate: Date,
  createdAt: String,
  activity: { type: Schema.Types.ObjectId, ref: "Activity" },
});

module.exports = model("Task", taskSchema);
