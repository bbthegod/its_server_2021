import httpStatus from 'http-status';
import User from '../user/model';
const { successResponse, errorResponse } = require('../../utils/response');

export async function login(req, res) {
  const { studentCode, password } = req.body;
  const user = await User.findOne({ studentCode });
  if (!user) return errorResponse(res);
  if (user.isOnline) return errorResponse(res);
  if (user.role === 'admin') {
    let loginResult = await User.Login(user, password);
    if (!loginResult) return errorResponse(res);
  } else {
    if (user.password !== password) return errorResponse(res);
  }
  return successResponse(user, res);
}

export function check(req, res) {
  res.status(httpStatus.OK).end();
}

export async function signup(req, res) {
  const { studentCode, studentName, studentClass, studentPhone, password } = req.body;
  const duplicate = await User.findOne({ studentCode });
  if (duplicate) return res.status(httpStatus.CONFLICT).json('StudentCode already exist');
  let user = new User({ studentCode, studentName, studentClass, studentPhone, password });
  user = await user.save();
  return res.json(user);
}
