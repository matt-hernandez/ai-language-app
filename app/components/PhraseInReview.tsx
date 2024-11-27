import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import type { Phrase } from "~/types";
import { useCallback, useState } from "react";

export default function PhraseInReview({ phrase, index }: { phrase: Phrase, index: number }) {
  const [currentImage, setCurrentImage] = useState(phrase.image);
  const [isImageFeedbackModalOpen, setIsImageFeedbackModalOpen] = useState(false);
  const [imageFeedback, setImageFeedback] = useState("");
  const [currentPhrase, setCurrentPhrase] = useState(phrase);
  const [isPhraseFeedbackModalOpen, setIsPhraseFeedbackModalOpen] = useState(false);
  const [phraseFeedback, setPhraseFeedback] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isPhraseLoading, setIsPhraseLoading] = useState(false);

  const handleRerunImage = useCallback(async (phrase: Phrase, feedback: string) => {
    try {
      setIsImageLoading(true);
      const response = await fetch(`/api/rerun-image?phrase=${encodeURIComponent(phrase.english)}&feedback=${encodeURIComponent(feedback)}`);
      const data = await response.json();
      setCurrentImage(data.image);
    } catch (error) {
      console.error('Failed to rerun image generation:', error);
    } finally {
      setIsImageLoading(false);
    }
  }, []);

  const handleRerunPhrase = useCallback(async (phrase: Phrase, feedback: string, shouldRedoImage: boolean) => {
    try {
      setIsPhraseLoading(true);
      const response = await fetch(`/api/rerun-phrase?phrase=${encodeURIComponent(phrase.english)}&feedback=${encodeURIComponent(feedback)}&redoImage=${shouldRedoImage}`);
      const data = await response.json();
      console.log("MIH: rerun phrase data", data);
      const newPhrase = data.phrase;
      setCurrentPhrase(newPhrase);
      if (shouldRedoImage && data.image) {
        setCurrentImage(data.image);
      }
    } catch (error) {
      console.error('Failed to rerun phrase generation:', error);
    } finally {
      setIsPhraseLoading(false);
    }
  }, []);

  return (
    <>
      <Dialog open={isPhraseFeedbackModalOpen} onClose={() => {
        setIsPhraseFeedbackModalOpen(false);
      }}>
        <DialogTitle>Revise Phrase</DialogTitle>
        <DialogContent>
          <TextField
            label="Feedback"
            multiline
            rows={4}
            placeholder="What's wrong with this phrase?"
            sx={{ width: "400px", mt: 1 }}
            onChange={(e) => {
              setPhraseFeedback(e.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            handleRerunPhrase(currentPhrase, phraseFeedback, false);
            setIsPhraseFeedbackModalOpen(false);
          }}>Submit</Button>
          <Button onClick={() => {
            handleRerunPhrase(currentPhrase, phraseFeedback, true);
            setIsPhraseFeedbackModalOpen(false);
          }}>Submit & Redo Image</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isImageFeedbackModalOpen} onClose={() => {
        setIsImageFeedbackModalOpen(false);
      }}>
        <DialogTitle>Revise Image</DialogTitle>
        {/* Make a subheader */}
        <DialogContent sx={{ mt: -2, mb: -2, pb: 0, fontSize: "14px", width: "400px" }}>
          *Images do not have history, so provide feedback that is generic rather than referencing something in the current image.
        </DialogContent>
        <DialogContent>
          <TextField
            label="Feedback"
            multiline
            rows={4}
            placeholder="What's wrong with this image?"
            sx={{ width: "400px", mt: 1 }}
            onChange={(e) => {
              setImageFeedback(e.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            handleRerunImage(currentPhrase, imageFeedback);
            setIsImageFeedbackModalOpen(false);
          }}>Submit</Button>
        </DialogActions>
      </Dialog>
      <Stack sx={{ position: 'relative' }}>
        <Typography variant="h2" sx={{ position: 'absolute', top: 0, right: 0, opacity: 0.5 }}># {index + 1}</Typography>
        <Stack direction="row">
          <Stack width={"50%"} sx={{ paddingRight: 2 }}>
            <Box sx={{ opacity: isPhraseLoading ? 0.5 : 1 }}>
              <Typography variant="h6" sx={{ marginBottom: 1 }}>Spanish</Typography>
              <Typography variant="body1" sx={{ marginBottom: 2 }}>{currentPhrase.spanish}</Typography>
              <input type="hidden" name={`${index}-spanish`} value={currentPhrase.spanish} />
              <Typography variant="h6" sx={{ marginBottom: 1 }}>English</Typography>
              <Typography variant="body1" sx={{ marginBottom: 4 }}>{currentPhrase.english}</Typography>
              <input type="hidden" name={`${index}-english`} value={currentPhrase.english} />
            </Box>
            <Button
              sx={{ width: "200px" }}
              variant="contained"
              color="warning"
              onClick={() => {
                setIsPhraseFeedbackModalOpen(true);
              }}
              disabled={isPhraseLoading}
            >
              {isPhraseLoading ? 'Generating...' : 'Adjust Phrase'}
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
              onClick={() => {
                setIsImageFeedbackModalOpen(true);
              }}
              disabled={isImageLoading}
            >
              {isImageLoading ? 'Generating...' : 'Redo Image'}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </>
  );
}
