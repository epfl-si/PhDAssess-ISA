import _ from "lodash";
import debug_ from 'debug'

const debug = debug_('phd-assess/zeebeWorker/configuration')

/*
 * A mix of lodash _.pick and _.get, thx stackoverflow people
 */
export const flatPick = (object: {}, paths: string[]) => {
  const o = {};

  paths.forEach(path => _.set(
    o,
    <_.PropertyPath>_.last(path.split('.'))!,
    _.get(object, path)
  ));

  return o;
}

export const preCheckConnectionConfigurationOrExit = (
  taskType?: string,
  url?: string,
  username?: string,
  password?: string,
) => {

  debug(`
    Trying to start the app with configuration:
      taskType: ${taskType}
      url: ${url}
      username: ${username}
      password: ${password}
  `);

  if (!taskType) {
    console.log('Missing Zeebe Task type information. Exiting...')
    process.exit()
  }

  if (!url) {
    console.log('Missing url information. Exiting...')
    process.exit()
  }

  if (!username) {
    console.log('Missing username information. Exiting...')
    process.exit()
  }

  if (!password) {
    console.log('Missing password information. Exiting...')
    process.exit()
  }
}
