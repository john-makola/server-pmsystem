const { model, Schema } = require("mongoose");

const appraisalreviewSchema = new Schema({
  username: String,
  meetingno: String,
  meetingdate: String,
  meetingtitle: String,
  memberspresent: String,
  meetingnotes: String,
  createdAt: String,
});

module.exports = model("AppraisalreviewMeeting", appraisalreviewSchema);
