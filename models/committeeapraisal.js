const { model, Schema } = require("mongoose");

const committeeAppraisalSchema = new Schema({
  username: String,
  supervisorappraisal: {
    type: Schema.Types.ObjectId,
    ref: "SupervisorAppraisal",
  },
  committeeScore: String,
  committeecomment: String,
  createdAt: String,
});

module.exports = model("CommitteeAppraisal", committeeAppraisalSchema);
