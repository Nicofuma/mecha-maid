module.exports = async (name = 'set-status') => {
  const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
  return await lib.discord.users['@0.1.1'].me.status.update({
    activity_name: `for Tech`,
    activity_type: 'WATCHING',
    status: 'ONLINE',
  });
};