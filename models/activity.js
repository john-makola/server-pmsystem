const { model, Schema } = require("mongoose");

const activitySchema = new Schema({
  username: String,
  activityno: String,
  activityname: String,
  activitydescription: String,
  project: { type: Schema.Types.ObjectId, ref: "Project" },
  createdAt: String,
});

module.exports = model("Activity", activitySchema);
