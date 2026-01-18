const { validationResult } = require("express-validator");
const {
  createUser,
  listUsers,
  updateUser,
  disableUser,
} = require("./users.service");

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
}

async function createUserController(req, res) {
  const invalid = handleValidation(req, res);
  if (invalid) return;

  try {
    const result = await createUser(req.body);
    return res.status(201).json(result);
  } catch (e) {
    return res.status(e.statusCode || 500).json({ message: e.message });
  }
}

async function listUsersController(req, res) {
  try {
    const result = await listUsers();
    return res.json(result);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}

async function updateUserController(req, res) {
  const invalid = handleValidation(req, res);
  if (invalid) return;

  try {
    const result = await updateUser(req.params.id, req.body);
    return res.json(result);
  } catch (e) {
    return res.status(e.statusCode || 500).json({ message: e.message });
  }
}

async function disableUserController(req, res) {
  const invalid = handleValidation(req, res);
  if (invalid) return;

  try {
    const result = await disableUser(req.params.id);
    return res.json(result);
  } catch (e) {
    return res.status(e.statusCode || 500).json({ message: e.message });
  }
}

module.exports = {
  createUserController,
  listUsersController,
  updateUserController,
  disableUserController,
};