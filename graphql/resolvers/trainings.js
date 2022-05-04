const { AuthenticationError, UserInputError } = require("apollo-server");

const Training = require("../../models/training");
const Task = require("../../models/task");
const checkAuth = require("../../util/check-auth");

module.exports = {
  Query: {
    async getTrainings(_, { departmentId }) {
      try {
        let filteredTrainings = await Training.find()

          .populate({
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
          })

          .sort({ createdAt: -1 });
        if (departmentId) {
          filteredTrainings = filteredTrainings.filter((training) => {
            return (
              training.task.activity.project.department.id === departmentId
            );
          });
        }
        return filteredTrainings;
      } catch (err) {
        throw new Error(err);
      }
    },

    async getTraining(_, { trainingId }) {
      try {
        const training = await Training.findById(trainingId).populate({
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

        if (training) {
          return training;
        } else {
          throw new Error("Training not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  Mutation: {
    async createTraining(
      _,
      {
        trainingInput: {
          task,
          trainingno,
          trainingname,
          trainingdescription,
          venue,
          resources,
          startdate,
          enddate,
          comments,
        },
      },
      context
    ) {
      const user = checkAuth(context);

      if (task.trim() === "") {
        throw new Error("Task No must not be empty");
      }

      if (trainingno.trim() === "") {
        throw new Error("Training No must not be empty");
      }
      if (trainingname.trim() === "") {
        throw new Error("Training Name must not be empty");
      }
      if (venue.trim() === "") {
        throw new Error("Venue must not be empty");
      }
      if (startdate.trim() === "") {
        throw new Error("Start Date must not be empty");
      }
      if (enddate.trim() === "") {
        throw new Error("End Date must not be empty");
      }

      const taskData = await Task.findById(task).populate({
        path: "activity",
        select: "activityno activityname activitydescription  ",
      });

      if (!taskData) {
        throw new Error("Task not Found");
      }

      const newTraining = new Training({
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
        task: taskData,
        trainingno,
        trainingname,
        trainingdescription,
        venue,
        resources,
        startdate,
        enddate,
        comments,
      });

      let training = await Training.findOne({ trainingno });
      if (training) {
        throw new UserInputError("Training No Already Exists", {
          errors: {
            trainingno: "Training No Already Exists",
          },
        });
      }

      training = await newTraining.save();

      context.pubsub.publish("NEW_TRAINING", {
        newTraining: training,
      });

      return training;
    },

    async deleteTraining(_, { trainingId }, context) {
      const user = checkAuth(context);

      try {
        const training = await Training.findById(trainingId);
        if (user.username === training.username) {
          await training.delete();
          return "Training deleted successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    async updateTraining(parent, args, context) {
      const user = checkAuth(context);
      const { trainingId } = args;
      const {
        task,
        trainingno,
        trainingname,
        trainingdescription,
        venue,
        resources,
        startdate,
        enddate,
        comments,
      } = args.training;

      try {
        //const department = await Target.findById(args._id);
        if (user.username) {
          const updates = {};

          if (task !== undefined) {
            updates.task = task;
          }
          if (trainingno !== undefined) {
            updates.trainingno = trainingno;
          }
          if (trainingname !== undefined) {
            updates.trainingname = trainingname;
          }
          if (trainingdescription !== undefined) {
            updates.trainingdescription = trainingdescription;
          }
          if (venue !== undefined) {
            updates.venue = venue;
          }
          if (resources !== undefined) {
            updates.resources = resources;
          }
          if (startdate !== undefined) {
            updates.startdate = startdate;
          }
          if (enddate !== undefined) {
            updates.enddate = enddate;
          }
          if (comments !== undefined) {
            updates.comments = comments;
          }

          const training = await Training.findByIdAndUpdate(
            trainingId,
            updates,
            {
              new: true,
            }
          );
          return training;
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (error) {}
    },
  },

  Subscription: {
    newTraining: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("NEW_TRAINING"),
    },
  },
};
