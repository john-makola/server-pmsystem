const { model, Schema } = require("mongoose");

const supervisorAppraisalSchema = new Schema({
  username: String,
  taskappraisal: { type: Schema.Types.ObjectId, ref: "TaskAppraisal" },
  supervisorScore: String,
  supervisorcomment: String,
  createdAt: String,
});

module.exports = model("SupervisorAppraisal", supervisorAppraisalSchema);
