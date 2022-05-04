const { model, Schema } = require("mongoose");

const targetSchema = new Schema({
  username: String,
  task: { type: Schema.Types.ObjectId, ref: "Task" },
  targetno: String,
  targetname: String,
  agreedPerformance: String,
  performanceIndicator: String,
  achievedResult: String,
  selfScore: Number,
  supervisorScore: Number,
  jointScore: Number,
  startdate: String,
  enddate: String,
  createdAt: String,
});

module.exports = model("Target", targetSchema);
