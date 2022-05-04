const { GraphQLScalarType, Kind } = require("graphql");
module.exports = {
  DateTime: new GraphQLScalarType({
    name: "DateTime",
    description: "Date custom scalar type",
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      const date = new Date(value); // value sent to the client
      return date.toISOString();
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value); // ast value is always in string format
      }
      return null;
    },
  }),
};
