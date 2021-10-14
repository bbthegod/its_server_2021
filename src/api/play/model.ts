import { Model, Schema, model } from 'mongoose';
import { Play } from 'src/types/Play';

interface PlayModel extends Model<Play> {
  List(filter: { limit: number; skip: number; filter: object; sort: string }): any;
}

const playSchema = new Schema<Play, PlayModel>(
  {
    userID: { type: Schema.Types.ObjectId, ref: 'User', unique: true },
    questions: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: 'Question' },
        answered: Boolean,
        answer: Number,
      },
    ],
    timeOut: { type: Date, default: new Date(Date.now() + 20 * 60000) },
    totalScore: { type: Number, default: 0 },
    interviewScore: { type: Number, default: 0 },
    interviewer: { type: String },
    comment: { type: String },
    isInterviewed: { type: Boolean, default: false },
  },
  { collection: 'plays', timestamps: true },
);

playSchema.statics.List = async function ({ skip = 0, limit = 500, sort = { createdAt: -1 }, filter = {} }) {
  const data = await this.find(filter, { createdAt: 0, updatedAt: 0, password: 0 })
    .populate({
      path: 'userID',
      select: 'studentName studentCode studentClass studentPhone',
      populate: [{ path: '_id', select: 'content' }],
    })
    .populate({
      path: 'questions.questionId',
      select: '-correctAnswer',
    })
    .sort(sort)
    .skip(+skip)
    .limit(+limit)
    .exec();
  const count = await this.find(filter).count();
  return { data, count, limit, skip };
};

export default model('Play', playSchema);
