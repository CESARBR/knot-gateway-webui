var cloudsContext = require.context(
  '!!file-loader?name=[name].[ext]!.',
  true,
  /\.(svg|png|ico|xml|json|webmanifest)$/
);
cloudsContext.keys().forEach(cloudsContext);
