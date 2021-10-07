import express from 'express';
import * as controller from './controller';
import authentication from '../../middleware/authentication';

const router = express.Router();

router.route('/').get(authentication(['admin']), controller.list);

router.route('/:id').delete(authentication(['admin']), controller.remove);

router.route('/user/:id').get(authentication(['admin']), controller.getInfo);

router.route('/leaderboard').get(controller.leader);

router.route('/get').get(authentication(['user', 'admin']), controller.GetSingle);

router.route('/start').get(authentication(['user']), controller.GetPlay);

router.route('/end').get(authentication(['user']), controller.EndPlay);

router.route('/continue').get(authentication(['user']), controller.ContinuePlay);

router.post('/interview/:id', authentication(['admin', 'judge']), controller.interview);

export default router;
