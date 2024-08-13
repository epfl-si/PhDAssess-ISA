import debug_ from 'debug'

import {ZBClient} from "zeebe-node";
import {Duration, ZBWorkerTaskHandler} from 'zeebe-node'

import type {PhDAssessVariables} from "phd-assess-meta/types/variables.js";
import {decryptVariables, encrypt} from "./encryption.js";
import {flatPick, preCheckConnectionConfigurationOrExit} from "./utils.js";

// @ts-ignore
import {version} from './version.js';
import {postStudentResult} from "./isa-connector.js";
import {Evaluation, ISAStudentAssessmentResult} from "./isa-types.js";

const debug = debug_('phd-assess/zeebeWorker')

const taskType = process.env.ZEEBE_TASK_TYPE ?? ''

console.log(process.env.ISA_URL)

const ISAUrl = new URL(process.env.ISA_URL ?? '')
const fullUrl: string = ISAUrl.origin + ISAUrl.pathname
const username: string = ISAUrl.username
const password: string = ISAUrl.password

debug('Precheck for valid app configuration')
preCheckConnectionConfigurationOrExit(
  taskType,
  fullUrl,
  username,
  password
)

export const zBClient = new ZBClient({
  pollInterval: Duration.seconds.of(10),
})

const handler: ZBWorkerTaskHandler = async (
  job
) => {
  debug(`Task variables ${job.variables}`)
  debug(`Job "${taskType}" started`);

  console.log("Received and starting task", {
    taskType,
    job: flatPick(job,
      [
        'key',
        'processInstanceKey',
        'processDefinitionVersion',
        'elementId',
        'worker',
        'variables.created_at',
        'variables.created_by',
      ]
    )
  })

  const jobVariables: PhDAssessVariables = decryptVariables(job, [])

  const phdStudentSciper = jobVariables.phdStudentSciper ?? ''

  const currentDate = new Date('2026-11-19');
  const currentDay = String(currentDate.getDate()).padStart(2, '0');
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  const currentYear = currentDate.getFullYear();
  const phdEvaluationDate = `${currentDay}.${currentMonth}.${currentYear}`;

  // has this field come as text and not as code, we convert it back for ISA
  const phdEvaluationRaw = jobVariables.generalAppraisalOfTheProgress ?? ''

  const evaluationConverter: { [key: string]: Evaluation }  = {
    'exceeds expectations': 'EXCEEDS_EXPECTATIONS',
    'meets expectations': 'MEETS_EXPECTATIONS',
    'needs some improvement': 'NEEDS_SOME_IMPROVEMENT',
    'unsatisfactory': 'UNSATISFACTORY',
  }

  try {
    await postStudentResult(
      fullUrl,
      username,
      password,
      {
        sciper: phdStudentSciper,
        date: phdEvaluationDate,
        evaluation: evaluationConverter[phdEvaluationRaw]
      } as ISAStudentAssessmentResult
    )
    console.log(`Successfully posted the student result of ${phdStudentSciper}`)

    const updateBrokerVariables = {
      isaResultPostedDate: encrypt(new Date().toISOString()),
    }

    return job.complete(updateBrokerVariables)

  } catch (e: any) {
    console.error(`Failed to post student results on ${fullUrl}. Error was ${e.message}`)
    return job.error('505', `Unable to post student result into ISA. ${e.message}`)
  }
}

export const startWorker = () => {
  console.log(`starting phd-assess-isa version ${version}...`)
  console.log(`starting worker for type '${taskType}'...`)

  const worker = zBClient.createWorker<PhDAssessVariables>({
    taskType: taskType,
    maxJobsToActivate: 5,
    // Set timeout, the same as we will ask yourself if the job is still up
    timeout: Duration.minutes.of(2),
    // @ts-ignore
    taskHandler: handler,
    fetchVariable: ['phdStudentSciper', 'generalAppraisalOfTheProgress'],
  })

  console.log(`worker started, awaiting for ${taskType} jobs...`)
  return worker
}
