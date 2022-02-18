// REQUIRES
const express = require('express');

// VARIABLES
const router = express.Router();


const genres = [
  'acoustic',          'afrobeat',       'alt-rock',
  'alternative',       'ambient',        'anime',
  'black-metal',       'bluegrass',      'blues',
  'bossanova',         'brazil',         'breakbeat',
  'british',           'cantopop',       'chicago-house',
  'children',          'chill',          'classical',
  'club',              'comedy',         'country',
  'dance',             'dancehall',      'death-metal',
  'deep-house',        'detroit-techno', 'disco',
  'disney',            'drum-and-bass',  'dub',
  'dubstep',           'edm',            'electro',
  'electronic',        'emo',            'folk',
  'forro',             'french',         'funk',
  'garage',            'german',         'gospel',
  'goth',              'grindcore',      'groove',
  'grunge',            'guitar',         'happy',
  'hard-rock',         'hardcore',       'hardstyle',
  'heavy-metal',       'hip-hop',        'holidays',
  'honky-tonk',        'house',          'idm',
  'indian',            'indie',          'indie-pop',
  'industrial',        'iranian',        'j-dance',
  'j-idol',            'j-pop',          'j-rock',
  'jazz',              'k-pop',          'kids',
  'latin',             'latino',         'malay',
  'mandopop',          'metal',          'metal-misc',
  'metalcore',         'minimal-techno', 'movies',
  'mpb',               'new-age',        'new-release',
  'opera',             'pagode',         'party',
  'philippines-opm',   'piano',          'pop',
  'pop-film',          'post-dubstep',   'power-pop',
  'progressive-house', 'psych-rock',     'punk',
  'punk-rock',         'r-n-b',          'rainy-day',
  'reggae',            'reggaeton',      'road-trip',
  'rock',              'rock-n-roll',    'rockabilly',
  'romance',           'sad',            'salsa',
  'samba',             'sertanejo',      'show-tunes',
  'singer-songwriter', 'ska',            'sleep',
  'songwriter',        'soul',           'soundtracks',
  'spanish',           'study',          'summer',
  'swedish',           'synth-pop',      'tango',
  'techno',            'trance',         'trip-hop',
  'turkish',           'work-out',       'world-music'
]


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
    redirectUri: process.env.REDIRECT_URL
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

  res.render('home.html', {title: '- home',status:''}); // render de index page
});

router.get('/home/:info', (req, res) => {
  let token = req.cookies.token
  spotifyApi.setAccessToken(token);   // set acces token

  if (req.params.info == 'crear') {

    get_sogns().then(songs => {
      //console.log(songs)
      create_playlist(songs)
      res.render('home.html', {title: '- home', status:'succes'})
    });
    
  };
});


async function get_sogns(){
  let list_of_sogns = []
  for (let i = 0; i < 10; i++) {
    let number = Math.floor(Math.random() * (genres.length))  
    
    let recommendations = await spotifyApi.getRecommendations({
      min_energy: 0.4,
      seed_genres: [genres[number]],
      limit: 2
    })

    for (let i = 0; i < recommendations.body.tracks.length; i++) {
      list_of_sogns.push(recommendations.body.tracks[i].uri)
    }
  }; 
  return list_of_sogns 
};


function create_playlist(songs){ // songs = ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh", "spotify:track:1301WleyT98MSxVHPZCA6M"]
  const d = new Date();
  let text_date = d.toLocaleDateString();

  spotifyApi.createPlaylist(`All random (${text_date})`, { 'description': 'This playlist contains 20 aleatory songs', 'public': true })
  .then(function(data) {
    //console.log(data.body.id)
    //spotifyApi.uploadCustomPlaylistCoverImage(data.body.id, img)
    spotifyApi.addTracksToPlaylist(data.body.id, songs)
    
  }, function(err) {
    console.log('Something went wrong!', err);
  });
}


module.exports = router;