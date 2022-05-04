const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");

const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../util/validators");
const { SECRET_KEY } = require("../../config");
const User = require("../../models/User");
const Target = require("../../models/target");
const Task = require("../../models/task");
const Activity = require("../../models/activity");
const TaskAppraisal = require("../../models/taskappraisal");
const Training = require("../../models/training");

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      mobileno: user.mobileno,
      payrollno: user.payrollno,
      surname: user.surname,
      firstname: user.firstname,
      othernames: user.othernames,
      designation: user.designation,
      department: user.department,
      jobgroup: user.jobgroup,
      role: user.role,
      createdAt: user.createdAt,
    },
    SECRET_KEY,
    { expiresIn: "2h" }
  );
}

module.exports = {
  Query: {
    async getUsers(_, { departmentId }) {
      try {
        let filteredUsers = await User.find()

          .populate({
            path: "department",
            select: " departmentno departmentname departmentdescription  ",
          })
          .populate({
            path: "jobgroup",
            select: "jobgroupname  ",
          })
          .populate({
            path: "role",
            select: "rolesname _id  createdAt ",
          })
          .sort({ createdAt: -1 });
        if (departmentId) {
          filteredUsers = filteredUsers.filter((user) => {
            return user.department.id === departmentId;
          });
        }
        return filteredUsers;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getUser(_, { userId }) {
      try {
        const user = await User.findById(userId)
          .populate({
            path: "department",
            select: "departmentno departmentname departmentdescription  ",
          })
          .populate({
            path: "jobgroup",
            select: "jobgroupname  ",
          })
          .populate({
            path: "role",
            select: "rolesname  ",
          });
        if (user) {
          return user;
        } else {
          throw new Error("User not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  User: {
    targets: async (parent, args, context) => {
      const userId = parent.username;
      const targets = await Target.find({ username: userId }).populate({
        path: "task",
        select:
          "taskname taskno agreedPerformance performanceIndicator startdate enddate",
        populate: {
          path: "activity",
          select: "activityno activityname",
          populate: { path: "project", select: "projectno projectname" },
        },
      });
      return targets;
    },

    tasks: async (parent, args, context) => {
      const userId = parent.username;
      const tasks = await Task.find({ username: userId }).populate({
        path: "activity",
        select: "activityno activityname",
        populate: { path: "project", select: "projectno projectname" },
      });

      return tasks;
    },

    trainings: async (parent, args, context) => {
      const userId = parent.username;
      const trainings = await Training.find({ username: userId }).populate({
        path: "task",
        select: "taskno taskname activity startdate enddate",
        populate: {
          path: "activity",
          select: "activityno activityname activitydescription activity",
          populate: {
            path: "project",
            select: "projectno projectname projectdescription  ",
            populate: {
              path: "department",
              select: "departmentno departmentname departmentdescription  ",
            },
          },
        },
      });

      return trainings;
    },

    taskappraisals: async (parent, args, context) => {
      const userId = parent.username;
      const taskappraisals = await TaskAppraisal.find({
        username: userId,
      }).populate({
        path: "target",
        select:
          "targetno targetname agreedPerformance performanceIndicator startdate enddate",
        populate: {
          path: "task",
          select: "taskname taskno  startdate enddate",
          populate: {
            path: "activity",
            select: "activityno activityname",
            populate: { path: "project", select: "projectno projectname" },
          },
        },
      });
      return taskappraisals;
    },

    targetsCount: async (parent, args, context) => {
      const targetCount = await Target.find();
      return targetCount.length;
    },
  },

  Mutation: {
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const user = await User.findOne({ username });

      if (!user) {
        errors.general = "Wrong Username or Password try again";
        throw new UserInputError("Wrong Username or Password try again", {
          errors,
        });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = "Wrong Username or Password try again";
        throw new UserInputError("Wrong Username or Password try again", {
          errors,
        });
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
    async register(
      _,
      {
        registerInput: {
          username,
          email,
          password,
          confirmPassword,
          mobileno,
          payrollno,
          surname,
          firstname,
          othernames,
          designation,
          department,
          jobgroup,
          role,
        },
      }
    ) {
      // Validate user data
      const { valid, errors } = validateRegisterInput(
        username,
        firstname,
        surname,
        password,
        confirmPassword,
        email,
        payrollno,
        designation,
        department,
        jobgroup,
        role
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      // TODO: Make sure user doesnt already exist
      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError("Username is taken", {
          errors: {
            username: "This username is taken",
          },
        });
      }
      // hash password and create an auth token
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        username,
        password,
        mobileno,
        payrollno,
        surname,
        firstname,
        othernames,
        designation,
        department,
        jobgroup,
        role,
        createdAt: new Date().toISOString(),
      });

      const res = await newUser.save();

      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
};
