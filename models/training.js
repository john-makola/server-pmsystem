const { model, Schema } = require("mongoose");

const trainingSchema = new Schema({
  username: String,
  task: { type: Schema.Types.ObjectId, ref: "Task" },
  trainingno: String,
  trainingname: String,
  trainingdescription: String,
  venue: String,
  resources: String,
  startdate: String,
  enddate: String,
  comments: String,
  createdAt: String,
});

module.exports = model("Training", trainingSchema);
