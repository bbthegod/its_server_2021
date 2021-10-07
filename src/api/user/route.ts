import express from 'express';
import { validate } from 'express-validation';
import validator from './validation';
import * as controller from './controller';
import authentication from '../../middleware/authentication';

const router = express.Router();

router
  .route('/')
  .get(authentication(['admin']), controller.list)
  .post(authentication(['admin']), controller.create);

router
  .route('/:userId')
  .get(authentication(['admin']), controller.get)
  .put(authentication(['admin']), controller.update)
  .delete(authentication(['admin']), controller.remove);

router.param('userId', controller.load);

export default router;
