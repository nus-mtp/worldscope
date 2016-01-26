var Adapter = require('../app/adapters/social_media/SocialMediaAdapter');

var token = 'CAACEdEose0cBANGbhrtdJob54GDSkohmoYfEUQvrxN8iHFZC5JPQOgzRG2Mk6IUE5BFLZAohsjAeyGwk07dCSZCM6oSH0GU3ZB4JqoRXTdYV3QO8VhhHzGniJjC9KkOOhFVUNZB4XQjW6U8M5todwscOPPgqZAAZCsRBca2nhVKZAFQGDcrejL3ppHEodh2y3etPBBj7jOLK5AZDZD'
var adapter = new Adapter('facebook', {accessToken: token, appId: '1538685659789985'});

adapter.getUser().then(function (user) {
  console.log(user);
});
