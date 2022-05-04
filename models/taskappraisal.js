const { model, Schema } = require("mongoose");

const taskAppraisalSchema = new Schema({
  username: String,
  target: { type: Schema.Types.ObjectId, ref: "Target" },
  achievedResult: String,
  selfScore: String,
  usercomment: String,
  createdAt: String,
});

module.exports = model("TaskAppraisal", taskAppraisalSchema);
