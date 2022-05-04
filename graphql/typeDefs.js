const { gql } = require("apollo-server");

module.exports = gql`
  scalar DateTime

  type Post {
    id: ID!
    body: String!
    createdAt: String!
    username: String!
    comments: [Comment]!
    likes: [Like]!
    likeCount: Int!
    commentCount: Int!
  }

  type Department {
    id: ID!
    username: String!
    createdAt: String!
    departmentno: String!
    departmentname: String!
    departmentdescription: String!
  }
  type Comment {
    id: ID!
    createdAt: String!
    username: String!
    body: String!
  }

  type Project {
    id: ID!
    username: String!
    projectno: String!
    projectname: String!
    projectdescription: String!
    department: Department
    createdAt: String!
    activities: [Activity]
  }
  type Activity {
    id: ID!
    username: String!
    activityno: String!
    activityname: String!
    activitydescription: String!
    project: Project
    tasks: [Task]
    createdAt: String!
  }
  type Task {
    id: ID!
    username: String!
    taskno: String!
    taskname: String!
    startdate: DateTime!
    enddate: DateTime!
    activity: Activity
    createdAt: String!
  }

  type Target {
    id: ID!
    username: String!
    task: Task
    targetno: String!
    targetname: String!
    agreedPerformance: String!
    performanceIndicator: String!
    startdate: String!
    enddate: String!
    selfScore: String!
    supervisorScore: String!
    jointScore: String!
    createdAt: String!
  }

  type TaskAppraisal {
    id: ID!
    username: String!
    target: Target
    achievedResult: String!
    selfScore: Int
    usercomment: String
    createdAt: String!
    supervisorappraisal(supervisorappraisalId: ID!): SupervisorAppraisal
  }

  type SupervisorAppraisal {
    id: ID!
    username: String!
    taskappraisal: TaskAppraisal
    supervisorScore: Int
    supervisorcomment: String
    createdAt: String!
  }

  type CommitteeAppraisal {
    id: ID!
    username: String!
    supervisorappraisal: SupervisorAppraisal
    committeeScore: Int
    committeecomment: String
    createdAt: String!
  }

  type AppraisalreviewMeeting {
    id: ID!
    username: String!
    meetingno: String
    meetingdate: String!
    meetingtitle: String!
    memberspresent: String!
    meetingnotes: String!
    createdAt: String!
  }

  type JobGroup {
    id: ID!
    createdAt: String!
    jobgroupno: String
    jobgroupname: String!
    jobgroupdescription: String!
  }

  type Role {
    id: ID!
    createdAt: String!
    rolesname: String!
  }
  type Like {
    id: ID!
    createdAt: String!
    username: String!
  }
  type User {
    id: ID!
    email: String!
    mobileno: String!
    token: String!
    username: String!
    payrollno: String!
    surname: String!
    firstname: String!
    othernames: String
    designation: String!
    department: Department
    jobgroup: JobGroup
    role: Role
    tasks: [Task]
    targets: [Target]
    trainings: [Training]
    taskappraisals: [TaskAppraisal]
    createdAt: String!
    targetsCount: Int
  }

  type Training {
    id: ID!
    username: String!
    task: Task!
    trainingno: String!
    trainingname: String!
    trainingdescription: String!
    venue: String!
    resources: String!
    startdate: DateTime!
    enddate: DateTime!
    comments: String!
    createdAt: String!
  }

  # Objects Inputs
  input TrainingInput {
    task: String!
    trainingno: String!
    trainingname: String!
    trainingdescription: String!
    venue: String!
    resources: String!
    startdate: String!
    enddate: String!
    comments: String!
  }

  input DepartmentInput {
    departmentno: String!
    departmentname: String!
    departmentdescription: String!
  }

  input DepartmentInputUpdate {
    departmentno: String
    departmentname: String
    departmentdescription: String
  }

  input ProjectInputUpdate {
    projectno: String
    projectname: String
    projectdescription: String
    department: String
    createdAt: String
    activities: String
  }

  input ActivityInputUpdate {
    activityno: String
    activityname: String
    activitydescription: String
    project: String
    tasks: String
  }

  input TaskInputUpdate {
    taskno: String
    taskname: String
    startdate: DateTime
    enddate: DateTime
    activity: String
  }

  input TrainingInputUpdate {
    task: String
    trainingno: String
    trainingname: String
    trainingdescription: String
    venue: String
    resources: String
    startdate: DateTime
    enddate: DateTime
    comments: String
  }

  input TargetInputUpdate {
    targetno: String
    targetname: String
    agreedPerformance: String
    performanceIndicator: String
    selfScore: String
    supervisorScore: String
    jointScore: String
    achievedResult: String
    startdate: DateTime
    enddate: DateTime
  }

  input RegisterInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
    mobileno: String!
    payrollno: String!
    surname: String!
    firstname: String!
    othernames: String
    designation: String!
    department: String!
    jobgroup: String!
    role: String!
  }

  input CreateProjectInput {
    projectno: String!
    projectname: String!
    projectdescription: String!
    department: String
  }
  input CreateActivityInput {
    activityno: String!
    activityname: String!
    activitydescription: String!
    project: String!
  }

  input CreateTaskInput {
    taskno: String
    taskname: String!
    startdate: DateTime!
    enddate: DateTime!
    activity: String!
  }

  input CreateTargetInput {
    task: String!
    targetno: String!
    targetname: String!
    agreedPerformance: String!
    performanceIndicator: String!
    startdate: String!
    enddate: String!
  }

  input CreateTaskAppraisalInput {
    target: String!
    achievedResult: String!
    selfScore: Int!
    usercomment: String!
  }

  input CreateSupervisorAppraisalInput {
    taskappraisal: String!
    supervisorScore: Int!
    supervisorcomment: String!
  }

  input CreateAppraisalreviewMeetingInput {
    meetingno: String
    meetingdate: String!
    meetingtitle: String!
    memberspresent: String!
    meetingnotes: String!
  }

  input CreateCommitteeAppraisalInput {
    supervisorappraisal: String!
    committeeScore: Int!
    committeecomment: String!
  }
  input JobGroupInput {
    username: String
    jobgroupno: String
    jobgroupname: String!
    jobgroupdescription: String!
  }

  input RoleInput {
    username: String!
    role: String!
  }

  type Query {
    # Get All Items
    getPosts: [Post]
    getUsers(departmentId: ID): [User]
    getJobGroups: [JobGroup]
    getRoles: [Role]
    getDepartments: [Department]
    getProjects(departmentId: ID): [Project]
    getActivities(departmentId: ID): [Activity]
    getTrainings(departmentId: ID): [Training]
    getTasks(departmentId: ID): [Task]
    getTargets: [Target]
    getTaskAppraisals: [TaskAppraisal]
    getSupervisorAppraisals: [SupervisorAppraisal]
    getCommitteeAppraisals: [CommitteeAppraisal]
    getAppraisalreviewMeetings: [AppraisalreviewMeeting]

    #Get Items by ID
    getUser(userId: ID!): User
    getPost(postId: ID!): Post
    getJobGroup(jobgroupId: ID!): JobGroup
    getRole(roleId: ID!): Role
    getDepartment(departmentId: ID!): Department
    getProject(projectId: ID!): Project
    getTraining(trainingId: ID!): Training
    getActivity(activityId: ID!): Activity
    getTask(taskId: ID!): Task
    getTarget(targetId: ID!): Target
    getTaskAppraisal(taskappraisalId: ID!): TaskAppraisal
    getSupervisorAppraisal(supervisorappraisalId: ID!): SupervisorAppraisal
    getCommitteeAppraisal(committeeappraisalId: ID!): CommitteeAppraisal
    getAppraisalreviewMeeting(
      appraisalreviewmeetingId: ID!
    ): [AppraisalreviewMeeting]
  }
  type Mutation {
    #Create Items
    register(registerInput: RegisterInput): User!
    createDepartment(departmentInput: DepartmentInput): Department!
    createJobGroup(jobGroupInput: JobGroupInput): JobGroup!
    createRole(rolesInput: RoleInput): Role!
    createPost(body: String!): Post!
    createProject(createProjectInput: CreateProjectInput): Project!
    createActivity(createActivityInput: CreateActivityInput): Activity!
    createTraining(trainingInput: TrainingInput): Training!
    createTask(createTaskInput: CreateTaskInput): Task!
    createComment(postId: String!, body: String!): Post!
    createTarget(createTargetInput: CreateTargetInput): Target!
    createTaskAppraisal(
      CreateTaskAppraisalInput: CreateTaskAppraisalInput
    ): TaskAppraisal!
    createSupervisorAppraisal(
      CreateSupervisorAppraisalInput: CreateSupervisorAppraisalInput
    ): SupervisorAppraisal!
    createCommitteeAppraisal(
      CreateCommitteeAppraisalInput: CreateCommitteeAppraisalInput
    ): CommitteeAppraisal!

    createAppraisalreviewMeeting(
      CreateAppraisalreviewMeetingInput: CreateAppraisalreviewMeetingInput
    ): AppraisalreviewMeeting!

    #Update Existing Data
    updateDepartment(
      departmentId: ID
      department: DepartmentInputUpdate
    ): Department

    updateProject(projectId: ID, project: ProjectInputUpdate): Project
    updateActivity(activityId: ID, activity: ActivityInputUpdate): Activity
    updateTask(taskId: ID, task: TaskInputUpdate): Task
    updateTarget(targetId: ID, target: TargetInputUpdate): Target
    updateTraining(trainingId: ID, training: TrainingInputUpdate): Training

    #Login Users
    login(username: String!, password: String!): User!

    #Delete Items by ID
    deletePost(postId: ID!): String!
    deleteRole(roleId: ID!): String!
    deleteJobGroup(jobGroupId: ID!): String!
    deleteDepartment(departmentId: ID!): String!
    deleteProject(projectId: ID!): String!
    deleteActivity(activityId: ID!): String!
    deleteTraining(trainingId: ID!): String!
    deleteComment(postId: ID!, commentId: ID!): Post!
    deleteTask(taskId: ID!): String!
    deleteTarget(targetId: ID!): String!
    deleteTaskAppraisal(taskappraisalId: ID!): String!
    deleteSupervisorAppraisal(supervisorappraisalId: ID!): String!
    deleteCommitteeAppraisal(committeeappraisalId: ID!): String!
    deleteAppraisalreviewMeeting(appraisalreviewmeetingId: ID!): String!

    #Like Posts by ID
    likePost(postId: ID!): Post!
  }
  type Subscription {
    newPost: Post!
    newDepartment: Department!
    newRole: Role!
    newJobGroup: JobGroup!
    newProject: Project!
    newActivity: Activity!
    newTarget: Target!
  }
`;
