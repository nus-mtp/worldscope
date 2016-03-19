'use strict';
var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');
var Hapi = require('hapi');

var MediaServerAdapter = rfr('app/adapters/MediaServerAdapter');
var MediaServerConfig = rfr('config/ServerConfig').mediaServer;

lab.experiment('getConnectionCounts', function () {
  let mockedMediaServer = new Hapi.Server();
  mockedMediaServer.connection({port: 8086});

  mockedMediaServer.route({
    method: 'GET',
    path: '/connectioncounts',
    handler: function (request, reply) {
      reply('<?xml version="1.0"?>' +
            '<WowzaStreamingEngine><VHost>' +
            '</VHost></WowzaStreamingEngine>');
    },
  });

  lab.before((done) => {
    mockedMediaServer.start(() => done());
  });

  lab.after((done) => {
    mockedMediaServer.stop(() => done());
  });

  lab.test('Gets stats from mocked media server', function (done) {
    let adapter = new MediaServerAdapter(MediaServerConfig.host,
                                         MediaServerConfig.username,
                                         MediaServerConfig.password);
    adapter.getConnectionCounts()
    .then((result) => {
      Code.expect(result['WowzaStreamingEngine']).to.be.an.object();
      done();
    });
  });
});
