import httpStatus from 'http-status';
import User from '../user/model';
import Question from '../question/model';
import Play from './model';

export async function list(req, res) {
  const { limit = 50, skip = 0, filter, sort } = req.query;
  const plays = await Play.List({ limit, skip, filter, sort });
  return res.json(plays);
}

export async function remove(req, res) {
  const { id } = req.params;
  const play = await Play.findOne({ userID: id });
  if (!play) return res.status(httpStatus.NOT_FOUND).end();
  play.remove();
  return res.json(play);
}

export async function getInfo(req, res) {
  const { id } = req.params;
  const play = await Play.findOne({ userID: id })
    .populate({
      path: 'userID',
      select: 'studentName studentCode',
      populate: [{ path: '_id', select: 'content' }],
    })
    .populate({
      path: 'questions.questionId',
      select: '-correctAnswer',
    });
  return res.json(play);
}

export async function interview(req, res) {
  const { interviewScore, comment, interviewer } = req.body;
  const play = await Play.findById(req.params.id);
  if (!play) return res.status(httpStatus.NOT_FOUND).end();
  if (play.isInterviewed === false) {
    play.interviewScore = interviewScore;
    play.comment = comment;
    play.interviewer = interviewer;
    play.isInterviewed = true;
    return play.save().then(result => res.status(httpStatus.OK).json(result));
  }
  return res.status(httpStatus.FORBIDDEN).json({ message: 'Sinh viên đã được phỏng vấn' });
}

export async function GetSingle(req, res) {
  const { studentCode } = req.auth;
  const user = await User.findOne({ studentCode });
  if (!user) return res.status(httpStatus.NOT_FOUND).end();
  const play = await Play.findOne({ userID: user._id }, { interviewScore: 0, isInterviewed: 0, createdAt: 0, updatedAt: 0, __v: 0 });
  if (!play) return res.status(httpStatus.NOT_FOUND).end();
  return res.json(play);
}

export async function GetPlay(req, res) {
  const { studentCode } = req.auth;
  if (studentCode) {
    const user = await User.findOne({ studentCode });
    if (!user) return res.status(httpStatus.NOT_FOUND);
    if (user && user.role === 'user') {
      const play = await Play.findOne({ userID: user._id });
      if (play) return res.status(httpStatus.CONFLICT).end();
      const newPlay = new Play({
        userID: user._id,
        questions: await Question.random(),
        timeOut: new Date(Date.now() + 25 * 60000),
      });
      return newPlay.save().then(async result => {
        const r = await result.populate('questions.questionId', 'options content');
        res.status(httpStatus.OK).json(r);
      });
    }
  }
}

export async function EndPlay(req, res) {
  const { studentCode } = req.auth;
  if (studentCode) {
    const user = await User.findOne({ studentCode });
    if (!user) return res.status(httpStatus.NOT_FOUND);
    if (user && user.role === 'user') {
      const play = await Play.findOne({ userID: user._id });
      if (!play) return res.status(httpStatus.NOT_FOUND).end();
      play.timeOut = new Date(Date.now());
      return play.save().then(async result => {
        const r = await result.populate('questions.questionId', 'options content');
        res.status(httpStatus.OK).json(r);
      });
    }
  }
}

export async function ContinuePlay(req, res) {
  const { studentCode } = req.auth;
  if (studentCode) {
    const user = await User.findOne({ studentCode });
    if (!user) return res.status(httpStatus.NOT_FOUND);
    if (user && user.role === 'user') {
      const play = await Play.findOne({ userID: user._id }, { interviewScore: 0, isInterviewed: 0, createdAt: 0, updatedAt: 0, __v: 0 }).populate(
        'questions.questionId',
        'options content',
      );
      if (play) return res.status(httpStatus.OK).json(play);
      return res.status(httpStatus.NOT_FOUND).end();
    }
  }
}

export async function leader(req, res) {
  const newPlay = await Play.aggregate()
    .project({
      userID: 1,
      interviewer: 1,
      totalScore: 1,
      interviewScore: 1,
      isInterviewed: 1,
      comment: 1,
      score: { $add: ['$totalScore', '$interviewScore'] },
    })
    .sort('-score');
  await Play.populate(newPlay, { path: 'userID', select: { studentCode: 1, studentName: 1, image: 1 } });
  res.json(newPlay);
}
