/* eslint-disable consistent-return */
import User from '../api/user/model';
import CONST from '../constants/status';

export default function (socket) {
  return function () {
    if (global.socketList.hasOwnProperty(socket.id)) {
      const query = User.findById(global.socketList[socket.id]);
      query
        .then(user => {
          if (user) {
            console.log(user.studentName + ' - ' + user.studentCode + ' now offline');
            user.isOnline = false;
            if (user.role === 'user') {
              global.userCount--;
            }
            socket.broadcast.emit(CONST.NAMESPACE.AUTH, {
              command: CONST.RETURN.AUTH.DISCONNECT,
              user: {
                studentName: user.studentName,
                studentCode: user.studentCode,
              },
            });

            delete global.socketList[socket.id];
            delete global.userList[user._id];
            return user.save();
          }
        })
        .then(() => {
          console.log(global.userCount + ' user online');
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
}
