// passport.use(
//   new PinterestStrategy(
//     {
//       clientID: PINTEREST_APP_ID,
//       clientSecret: PINTEREST_APP_SECRET,
//       scope: ['read_public', 'read_relationships'],
//       callbackURL: 'https://localhost:3000/auth/pinterest/callback',
//       state: true,
//     },
//     function (accessToken, refreshToken, profile, done) {
//       User.findOrCreate({ pinterestId: profile.id }, function (err, user) {
//         return done(err, user);
//       });
//     },
//   ),
// );
