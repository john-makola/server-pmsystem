const { model, Schema } = require("mongoose");

const rolesSchema = new Schema({
  rolesname: String,
});

module.exports = model("Role", rolesSchema);
