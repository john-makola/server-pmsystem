const { AuthenticationError, UserInputError } = require("apollo-server");

const JobGroup = require("../../models/jobgroup");
const checkAuth = require("../../util/check-auth");

module.exports = {
  Query: {
    async getJobGroups() {
      try {
        const jobgroups = await JobGroup.find().sort({ createdAt: -1 });
        return jobgroups;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getJobGroup(_, { jobGroupId }) {
      try {
        const jobGroup = await JobGroup.findById(jobGroupId);
        if (jobGroup) {
          return jobGroup;
        } else {
          throw new Error("JobGroup not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async createJobGroup(
      _,
      { JobGroupInput: { jobgroupno, jobgroupname, jobgroupdescription } },
      context
    ) {
      const user = checkAuth(context);

      if (jobgroupno.trim() === "") {
        throw new Error("JobGroup must not be empty");
      }
      if (!user.role === "admin") {
        throw new Error("User must be an Admin to Create a Department");
      }

      const newJobGroup = new JobGroup({
        jobgroupno,
        jobgroupname,
        jobgroupdescription,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      });

      const jobgroup = await newJobGroup.save();

      context.pubsub.publish("NEW_JOBGROUP", {
        newJobGroup: jobgroup,
      });

      return jobgroup;
    },
    async deleteJobGroup(_, { jobGroupId }, context) {
      const user = checkAuth(context);

      try {
        const jobgroup = await JobGroup.findById(jobGroupId);
        if (user.username === jobgroup.username) {
          await jobgroup.delete();
          return "JobGroup deleted successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Subscription: {
    newJobGroup: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("NEW_JOBGROUp"),
    },
  },
};
