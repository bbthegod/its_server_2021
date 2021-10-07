import httpStatus from 'http-status';
import User from './model';

export async function load(req, res, next, id) {
  const user = await User.findById(id);
  if (!user) return res.status(httpStatus.NOT_FOUND).end();
  req.user = user;
  return next();
}

export function get(req, res) {
  return res.json(req.user);
}

export async function create(req, res, next) {
  const { studentCode, studentName, studentClass, studentPhone, password } = req.body;
  const duplicate = await User.findOne({ studentCode });
  if (duplicate) return res.status(httpStatus.CONFLICT).json('StudentCode already exist');
  const user = new User({ studentCode, studentName, studentClass, studentPhone, password, role: 'user' });
  user.save();
  return res.json(user);
}

export function update(req, res) {
  const { studentCode, studentName, studentClass, studentPhone } = req.body;
  const { user } = req;
  user.studentCode = studentCode;
  user.studentName = studentName;
  user.studentClass = studentClass;
  user.studentPhone = studentPhone;
  user.save();
  return res.json(user);
}

export async function list(req, res) {
  const { limit = 50, skip = 1, filter, sort } = req.query;
  const users = await User.List({ limit, skip, filter, sort });
  return res.json(users);
}

export function remove(req, res) {
  const { user } = req;
  user.remove();
  return res.json(user);
}
