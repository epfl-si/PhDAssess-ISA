import debug_ from 'debug'
import got from 'got';

import {ISAStudentAssessmentResult} from "./isa-types.js";

const debug = debug_('isa-connector')

const isaRequestTimeoutMS = 40000  // 40 seconds

export const postStudentResult = async (
  url: string,
  username: string,
  password: string,
  result: ISAStudentAssessmentResult,
)=> {

  debug(`Calling postStudentResult function with data : ${ JSON.stringify(result) }..`)

  const form = new FormData()

  form.set('sciper', result.sciper);
  form.set('date', result.date);
  form.set('evaluation', result.evaluation);

  const b64Password = Buffer.from(`${username}:${password}`, 'binary').toString('base64')
  debug(`Built base64 token with ${username}:(HIDDEN) : ${ JSON.stringify(b64Password) }`)

  const isaReturn = await got.post(
    url!,
    {
      hooks: {
        beforeRequest: [function (options: any) {
          debug(options);
        }]
      },
      body: form,
      headers: {
        //'Content-Type': 'multipart/form-data',
        Authorization: `Basic ${ b64Password }`
      },
      timeout: {
        request: isaRequestTimeoutMS
      },
      retry: {
        limit: 0
      },
    }
  )
}
