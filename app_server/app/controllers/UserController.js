exports.register = function (server, options, next) {
  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply('Hello Sharmine!');
    }
  });

  next();
};

exports.register.attributes = {
  name: 'UserController'
};
