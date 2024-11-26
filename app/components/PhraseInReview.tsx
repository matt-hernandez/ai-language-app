import { Button, Stack, Typography } from "@mui/material";
import type { Phrase } from "~/types";
import { useState } from "react";

export default function PhraseInReview({ phrase, index }: { phrase: Phrase, index: number }) {
  const [currentImage, setCurrentImage] = useState(phrase.image);
  const [currentPhrase, setCurrentPhrase] = useState(phrase);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isPhraseLoading, setIsPhraseLoading] = useState(false);

  const handleRerunImage = async () => {
    try {
      setIsImageLoading(true);
      const response = await fetch(`/api/rerun-image?phrase=${encodeURIComponent(phrase.english)}`);
      const data = await response.json();
      setCurrentImage(data.image);
    } catch (error) {
      console.error('Failed to rerun image generation:', error);
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleRerunPhrase = async () => {
    try {
      setIsPhraseLoading(true);
      const response = await fetch(`/api/rerun-phrase?phrase=${encodeURIComponent(phrase.english)}`);
      const data = await response.json();
      setCurrentPhrase(data);
    } catch (error) {
      console.error('Failed to rerun phrase generation:', error);
    } finally {
      setIsPhraseLoading(false);
    }
  };

  return (
    <Stack sx={{ position: 'relative' }}>
      <Typography variant="h2" sx={{ position: 'absolute', top: 0, right: 0, opacity: 0.5 }}># {index + 1}</Typography>
      <Stack direction="row">
        <Stack width={"50%"} sx={{ paddingRight: 2 }}>
          <Typography variant="h6" sx={{ marginBottom: 1 }}>Spanish</Typography>
          <Typography variant="body1" sx={{ marginBottom: 2 }}>{currentPhrase.spanish}</Typography>
          <input type="hidden" name={`${index}-spanish`} value={currentPhrase.spanish} />
          <Typography variant="h6" sx={{ marginBottom: 1 }}>English</Typography>
          <Typography variant="body1" sx={{ marginBottom: 4 }}>{currentPhrase.english}</Typography>
          <input type="hidden" name={`${index}-english`} value={currentPhrase.english} />
          <Button
            sx={{ width: "200px" }}
            variant="contained"
            color="warning"
            onClick={handleRerunPhrase}
            disabled={isPhraseLoading}
          >
            {isPhraseLoading ? 'Generating...' : 'Rerun Phrase'}
          </Button>
        </Stack>
        <Stack spacing={3} alignItems="center">
          <img
            src={`data:image/jpeg;base64,${currentImage}`}
            width={250}
            height={250}
            alt={phrase.english}
            style={{ opacity: isImageLoading ? 0.5 : 1 }}
          />
          <input type="hidden" name={`${index}-image`} value={currentImage} />
          <Button
            sx={{ width: "200px" }}
            variant="contained"
            color="warning"
            onClick={handleRerunImage}
            disabled={isImageLoading}
          >
            {isImageLoading ? 'Generating...' : 'Rerun Image'}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
