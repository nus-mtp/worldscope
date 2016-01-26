var Auth = require('../app/policies/Authenticator');

var appId = '1538685659789985';
var token = 'CAACEdEose0cBADyZC60oK0zUm5AMkpUMerKBo13L0wMyAXTZAbV7Fyc2i9LuW27pDY5aS3aE3SGWg7ftDmzkZBhwEGYxy05RzERSuZCasp3hKvavlcZBp6nyPWVwu9MY7OsqwdIdNimszOyXdDiVMGDZCSvLZB5xjL7UnW6QRoJeblShWZAwP0SK5Kl0DVzmODS6kvXDktfqfQZDZD';

var credentials = {
  appId: appId,
  accessToken: token
};

Auth.authenticateUser('facebook', credentials)
.then(function (user) {
  console.log(user);
});
