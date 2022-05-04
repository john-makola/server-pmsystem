const { model, Schema } = require("mongoose");

const projectSchema = new Schema({
  username: String,
  projectno: String,
  projectname: String,
  projectdescription: String,
  department: { type: Schema.Types.ObjectId, ref: "Department" },
  createdAt: String,
});

module.exports = model("Project", projectSchema);
