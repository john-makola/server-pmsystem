const { model, Schema } = require("mongoose");

const jobGroupSchema = new Schema({
  jobgroupno: String,
  jobgroupname: String,
  jobgroupdescription: String,
});

module.exports = model("JobGroup", jobGroupSchema);
