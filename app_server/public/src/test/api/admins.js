var rootAdmin = {
  userId: 'mockAdminId',
  username: 'mockAdminUser',
  password: 'mockAdminPass',
  email: 'mockAdmin@mock.com',
  permissions: [
    'admin', 'metrics', 'streams',
    'users', 'admins', 'settings'
  ]
};

var streamAdmin = {
  userId: 'streamAdminId',
  username: 'streamAdminUser',
  password: 'streamAdminPass',
  email: 'streamAdmin@mock.com',
  permissions: ['admin', 'streams']
};

var getAdminFields = function (fields, admin) {
  admin = admin || rootAdmin;
  var newAdmin = {};
  Object.keys(rootAdmin)
        .filter(function (f) {
          return fields.indexOf(f) !== -1;
        })
        .forEach(function (f) {
          newAdmin[f] = admin[f];
        });
  return newAdmin;
};

module.exports = {
  admins: {
    rootAdmin: rootAdmin,
    streamAdmin: streamAdmin
  },
  login: function (admin) {
    admin = admin || rootAdmin;
    return {
      url: /api\/admins\/login/,
      method: 'POST',
      responseBody: getAdminFields([
        'userId',
        'permissions'
      ], admin)
    };
  },
  logout: function () {
    return {
      url: /api\/admins\/logout/,
      method: 'GET',
      responseBody: 'Logged out'
    };
  },
  create: function (admin) {
    admin = admin || rootAdmin;
    return {
      url: /api\/admins/,
      method: 'POST',
      responseBody: getAdminFields([
        'userId',
        'username',
        'password',
        'email',
        'permissions'
      ], admin)
    };
  },
  get: function (admin) {
    admin = admin || rootAdmin;
    return {
      url: /api\/admins\/([0-9A-Za-z\-]+\?)/,
      method: 'GET',
      responseBody: getAdminFields([
        'userId',
        'username',
        'email',
        'permissions'
      ], admin)
    };
  },
  list: function (admins) {
    admins = admins || [rootAdmin, streamAdmin];
    return {
      url: /api\/admins/,
      method: 'GET',
      responseBody: admins.map(function (admin) {
        return getAdminFields([
          'userId',
          'username',
          'email',
          'permissions'
        ], admin);
      })
    };
  },
  update: function (admin) {
    admin = admin || rootAdmin;
    return {
      url: /api\/admins\/([0-9A-Za-z\-]+\?)/,
      method: 'PUT',
      responseBody: getAdminFields([
        'userId',
        'username',
        'password',
        'email',
        'permissions'
      ], admin)
    };
  },
  delete: function () {
    return {
      url: /api\/admins\/([0-9A-Za-z\-]+\?)/,
      method: 'DELETE'
    };
  }
};
