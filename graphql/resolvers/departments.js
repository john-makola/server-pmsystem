const { AuthenticationError, UserInputError } = require("apollo-server");

const Department = require("../../models/department");
const checkAuth = require("../../util/check-auth");

module.exports = {
  Query: {
    async getDepartments() {
      try {
        const departments = await Department.find().sort({ createdAt: -1 });
        return departments;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getDepartment(_, { departmentId }) {
      try {
        const department = await Department.findById(departmentId);
        if (department) {
          return department;
        } else {
          throw new Error("Department not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async createDepartment(
      _,
      {
        departmentInput: {
          departmentno,
          departmentname,
          departmentdescription,
        },
      },
      context
    ) {
      const user = checkAuth(context);

      if (departmentno.trim() === "") {
        throw new Error("Department No must not be empty");
      }
      if (departmentname.trim() === "") {
        throw new Error("Department Name  must not be empty");
      }
      if (departmentdescription.trim() === "") {
        throw new Error("Department Description must not be empty");
      }

      if (!user.role === "admin") {
        throw new Error("User must be an Admin to Create a Department");
      }

      const newDepartment = new Department({
        departmentno,
        departmentname,
        departmentdescription,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      });

      const department = await newDepartment.save();

      context.pubsub.publish("NEW_DEPARTMENT", {
        newDepartment: department,
      });

      return department;
    },
    async deleteDepartment(_, { departmentId }, context) {
      const user = checkAuth(context);

      try {
        const department = await Department.findById(departmentId);
        if (user.username === department.username) {
          await department.delete();
          return "Department deleted successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    async updateDepartment(parent, args, context) {
      const user = checkAuth(context);

      try {
        //const department = await Department.findById(args._id);
        if (user.username) {
          const { departmentId } = args;
          const { departmentno, departmentname, departmentdescription } =
            args.department;

          const updates = {};
          if (departmentno !== undefined) {
            updates.departmentno = departmentno;
          }
          if (departmentname !== undefined) {
            updates.departmentname = departmentname;
          }
          if (departmentdescription !== undefined) {
            updates.departmentdescription = departmentdescription;
          }
          const department = await Department.findByIdAndUpdate(
            departmentId,
            updates,
            {
              new: true,
            }
          );
          return department;
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (error) {}
    },
  },
  Subscription: {
    newDepartment: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("NEW_DEPARTMENT"),
    },
  },
};
