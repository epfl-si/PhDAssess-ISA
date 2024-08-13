export type Evaluation = "EXCEEDS_EXPECTATIONS" |
                         "MEETS_EXPECTATIONS" |
                         "NEEDS_SOME_IMPROVEMENT" |
                         "UNSATISFACTORY";

export type ISAStudentAssessmentResult = {
  sciper: string;
  date: string;
  evaluation: Evaluation;
};
