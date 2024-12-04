import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import ZoomOutMap from "@mui/icons-material/ZoomOutMap";
import type { PhraseRaw } from "~/types";
import { useCallback, useEffect, useRef, useState } from "react";

export default function PhraseInReview({ phrase, image, index }: { phrase: PhraseRaw, image: string, index: number }) {
  const [currentImage, setCurrentImage] = useState(image);
  const [currentImagePrompt, setCurrentImagePrompt] = useState(phrase.imagePrompt);
  const [isImageFeedbackModalOpen, setIsImageFeedbackModalOpen] = useState(false);
  const [imageFeedback, setImageFeedback] = useState("");
  const imageFeedbackInputRef = useRef<HTMLInputElement>(null);
  const [currentPhrase, setCurrentPhrase] = useState(phrase);
  const [isPhraseFeedbackModalOpen, setIsPhraseFeedbackModalOpen] = useState(false);
  const [phraseFeedback, setPhraseFeedback] = useState("");
  const phraseFeedbackInputRef = useRef<HTMLInputElement>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isPhraseLoading, setIsPhraseLoading] = useState(false);
  const [isFullScreenImageModalOpen, setIsFullScreenImageModalOpen] = useState(false);
  useEffect(() => {
    if (isPhraseFeedbackModalOpen) {
      setTimeout(() => {
        if (phraseFeedbackInputRef.current) {
          phraseFeedbackInputRef.current.focus();
        }
      }, 100);
    }
  }, [isPhraseFeedbackModalOpen]);

  useEffect(() => {
    if (isImageFeedbackModalOpen) {
      setTimeout(() => {
        if (imageFeedbackInputRef.current) {
          imageFeedbackInputRef.current.focus();
        }
      }, 100);
    }
  }, [isImageFeedbackModalOpen]);

  const handleRerunImage = useCallback(async (phrase: PhraseRaw, feedback: string) => {
    try {
      setIsImageLoading(true);
      const response = await fetch(`/api/rerun-image?phrase=${encodeURIComponent(phrase.imagePrompt)}&feedback=${encodeURIComponent(feedback)}`);
      const data = await response.json();
      setCurrentImage(data.image);
    } catch (error) {
      console.error('Failed to rerun image generation:', error);
    } finally {
      setIsImageLoading(false);
      setImageFeedback("");
    }
  }, []);

  const handleRerunPhrase = useCallback(async (phrase: PhraseRaw, feedback: string, shouldRedoImage: boolean) => {
    try {
      setIsPhraseLoading(true);
      if (shouldRedoImage) {
        setIsImageLoading(true);
      }
      const response = await fetch(`/api/rerun-phrase?english=${encodeURIComponent(phrase.english)}&spanish=${encodeURIComponent(phrase.spanish)}&feedback=${encodeURIComponent(feedback)}&redoImage=${shouldRedoImage}`);
      const data: { phrase: PhraseRaw, image: string } = await response.json();
      const newPhrase = data.phrase;
      setCurrentPhrase(newPhrase);
      if (shouldRedoImage && data.image) {
        setCurrentImage(data.image);
        setCurrentImagePrompt(newPhrase.imagePrompt);
      }
    } catch (error) {
      console.error('Failed to rerun phrase generation:', error);
    } finally {
      setIsPhraseLoading(false);
      if (shouldRedoImage) {
        setIsImageLoading(false);
        setImageFeedback("");
      }
      setPhraseFeedback("");
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
            label="Feedback (optional)"
            multiline
            rows={4}
            inputRef={phraseFeedbackInputRef}
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
        <DialogContent sx={{ mt: -2, mb: -2, pb: 0, fontSize: "14px", width: "446px" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%" }}>
            <Typography sx={{ fontSize: "14px", pr: 2 }}>*Images do not have history, so provide feedback that is generic rather than referencing the current image.</Typography>
            <img src={`data:image/jpeg;base64,${currentImage}`} width={80} height={80} alt={phrase.english} />
          </Stack>
          <Typography sx={{ fontSize: "14px", mt: 2, mb: 1, fontWeight: "bold" }}>Prompt: {currentImagePrompt}</Typography>
        </DialogContent>
        <DialogContent>
          <TextField
            label="Feedback (optional)"
            multiline
            rows={4}
            placeholder="What's wrong with this image?"
            sx={{ width: "400px", mt: 1 }}
            inputRef={imageFeedbackInputRef}
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
      <Dialog open={isFullScreenImageModalOpen} onClose={() => {
        setIsFullScreenImageModalOpen(false);
      }}>
        <DialogContent>
          <img src={`data:image/jpeg;base64,${currentImage}`} width={450} height={450} alt={phrase.english} />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mt: -2 }}>
          <Button
            sx={{ width: "200px", mb: 1.5 }}
            variant="contained"
            color="warning"
            onClick={() => {
              setIsImageFeedbackModalOpen(true);
              setIsFullScreenImageModalOpen(false);
            }}
          >
            Redo Image
          </Button>
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
          <Stack spacing={2} alignItems="center">
            <Button aria-label="View Image" disabled={isImageLoading} component={Box} sx={{
              position: "relative", "&:hover": {
                "& > svg": {
                  opacity: 1
                }
              }
            }} onClick={() => {
              setIsFullScreenImageModalOpen(true);
            }}>
              <img
                src={`data:image/jpeg;base64,${currentImage}`}
                width={250}
                height={250}
                alt={phrase.english}
                style={{ opacity: isImageLoading ? 0.5 : 1 }}
              />
              {!isImageLoading && <ZoomOutMap color="action" sx={{ position: "absolute", top: "10px", right: "10px", width: 30, height: 30, opacity: 0, fill: "black" }} />}
            </Button>
            <Stack direction="row" justifyContent="flex-start" sx={{ width: "250px" }}>
              <Typography sx={{ fontSize: "14px", mt: -1 }}>Prompt: {currentImagePrompt}</Typography>
            </Stack>
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
