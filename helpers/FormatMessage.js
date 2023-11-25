const moment = require("moment");
module.exports = function formatMessage(userName, msg) {
  return {
    userName,
    msg,
    time: moment().format("h:mm a"),
  };
};
