import yargs from 'yargs';

yargs // eslint-disable-line no-unused-expressions
  .commandDir('commands')
  .demandCommand()
  .strict()
  .alias('h', 'help')
  .help()
  .argv;
