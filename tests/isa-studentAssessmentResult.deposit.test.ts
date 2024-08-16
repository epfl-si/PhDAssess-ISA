/*
 * Here you can manually test the ISA POST student result.
 * Please set the correct .env, you don't want to send test data on production
 */
import {describe, it} from 'node:test';

import {ISAStudentAssessmentResult} from "../src/isa-types.js";

import dotenv from "dotenv";
dotenv.config();

import {postStudentResult} from "../src/isa-connector.js";

const ISAUrl = new URL(process.env.ISA_URL ?? '')
const fullUrl: string = ISAUrl.origin + ISAUrl.pathname
const username: string = ISAUrl.username
const password: string = ISAUrl.password

const date = process.env.TEST_DATE!
const evaluation = process.env.TEST_EVALUATION!


describe('ISA Connexion', () => {

  // not a real test, as someone has to connect to isa server to check the result
  // at least we can see if the API return an error.
  it('should push a student result and return a status', async () => {

    //const sciper = ''
    const sciper = process.env.TEST_SCIPER!

    if (!sciper) throw new Error("This test means to fail ! " +
      "As you have to manually set the values before using it." +
      "This is a guard so test may not pollute the production.")

    await postStudentResult(
      fullUrl,
      username,
      password,
      {
        sciper,
        date,
        evaluation
      } as ISAStudentAssessmentResult
    )
  })

})
