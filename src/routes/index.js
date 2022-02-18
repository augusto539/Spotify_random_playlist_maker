// REQUIRES
const express = require('express');

// VARIABLES
const router = express.Router();


var SpotifyWebApi = require('spotify-web-api-node');

// This file is copied from: https://github.com/thelinmichael/spotify-web-api-node/blob/master/examples/tutorial/00-get-access-token.js

const scopes = [
    'ugc-image-upload',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'app-remote-control',
    'user-read-email',
    'user-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',
    'user-library-modify',
    'user-library-read',
    'user-top-read',
    'user-read-playback-position',
    'user-read-recently-played',
    'user-follow-read',
    'user-follow-modify'
  ];
  
// credentials are optional
var spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: 'http://localhost:8888/callback'
});



// GETS
// index
router.get('/', (req, res) => {
  if (req.cookies.token){
    res.redirect('/home')
  } else {
    res.render('index.html', {title: ''}); // render de index page
  }
});

  
  
router.get('/login', (req, res) => {
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});
  
router.get('/callback', (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const state = req.query.state;
  
  if (error) {
    console.error('Callback Error:', error);
    res.send(`Callback Error: ${error}`);
    return;
  };
  
  spotifyApi.authorizationCodeGrant(code).then(data => {
    const access_token = data.body['access_token'];
    const refresh_token = data.body['refresh_token'];
    const expires_in = data.body['expires_in'];
  
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);
  
    //console.log('access_token:', access_token);
    //console.log('refresh_token:', refresh_token);
  
    console.log(`Sucessfully retreived access token. Expires in ${expires_in} s.`);

    res.cookie('token',access_token)
    res.redirect('/home');
  
    setInterval(async () => {
      const data = await spotifyApi.refreshAccessToken();
      const access_token = data.body['access_token'];
  
      console.log('The access token has been refreshed!');
      console.log('access_token:', access_token);
      spotifyApi.setAccessToken(access_token);
    }, expires_in / 2 * 1000);
  }).catch(error => {
    console.error('Error getting Tokens:', error);
    res.send(`Error getting Tokens: ${error}`);
  });
});

router.get('/home', (req, res) => {
  let token = req.cookies.token
  spotifyApi.setAccessToken(token);   // set acces token

  // get a list of genres
  spotifyApi.getAvailableGenreSeeds().then(function(data) {
    let genreSeeds = data.body.genres;
    //console.log(genreSeeds);
  }, function(err) {
    console.log('Something went wrong!', err);
  });

  spotifyApi.searchTracks('genre: jazz', {limit:3})
  .then(function(data) {
    console.log('Search tracks by "gospel" in the genre', data.body.tracks.items);
  }, function(err) {
    console.log('Something went wrong!', err);
  });

  

  res.render('index.html', {title: ''}); // render de index page
});


module.exports = router;