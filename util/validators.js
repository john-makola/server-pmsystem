module.exports.validateRegisterInput = (
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
) => {
  const errors = {};
  if (username.trim() === "") {
    errors.username = "Username must not be empty";
  }
  if (firstname.trim() === "") {
    errors.firstname = "Firstname must not be empty";
  }
  if (surname.trim() === "") {
    errors.surname = "Surname must not be empty";
  }
  if (email.trim() === "") {
    errors.email = "Email must not be empty";
  } else {
    const regEx =
      /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!email.match(regEx)) {
      errors.email = "Email must be a valid email address";
    }
  }
  if (password === "") {
    errors.password = "Password must not empty";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords must match";
  }
  if (payrollno.trim() === "") {
    errors.payrollno = "Payroll No must not be Empty";
  }
  if (designation.trim() === "") {
    errors.designation = "Designation No must not be Empty";
  }
  if (department.trim() === "") {
    errors.department = "Choose Department";
  }
  if (jobgroup.trim() === "") {
    errors.jobgroup = "Choose JobGroup";
  }
  if (role.trim() === "") {
    errors.role = "Choose Role";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateLoginInput = (username, password) => {
  const errors = {};
  if (username.trim() === "") {
    errors.username = "Username must not be empty";
  }
  if (password.trim() === "") {
    errors.password = "Password must not be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateProjectInput = (
  username,
  projectno,
  projectname,
  projectdescription,
  department
) => {
  const errors = {};
  if (username.trim() === "") {
    errors.username = "Username must not be empty";
  }
  if (projectno.trim() === "") {
    errors.projectno = "Project No must not be empty";
  }
  if (projectname.trim() === "") {
    errors.projectname = "Project Name must not be empty";
  }
  if (projectdescription.trim() === "") {
    errors.projectdescription = "Project Desscription must not be empty";
  }
  if (department.trim() === "") {
    errors.department = "Department No must not be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
