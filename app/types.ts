export interface PhraseBase {
  spanish: string;
  english: string;
}

export interface PhraseRaw extends PhraseBase {
  imagePrompt: string;
}

export interface PhraseForReview extends PhraseBase {
  image: string;
  imagePrompt: string;
}

export interface PhraseSaved extends PhraseBase {
  image: string;
}
