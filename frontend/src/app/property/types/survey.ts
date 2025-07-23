export interface SurveyDTO {
  id: number;
  score: number;
  comment: string;
  inquiryId: number;
}

export type CreateSurveyDTO = Omit<SurveyDTO, "id">;