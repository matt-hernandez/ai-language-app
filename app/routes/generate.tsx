import { Button, CircularProgress, Container, styled, TextField, Typography } from '@mui/material';
import { ActionFunctionArgs } from '@remix-run/node';
import { Outlet, useFetcher, useNavigate } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import { makeImageGenerationPrompt } from '~/utils/make-prompt';
import type { Phrase, PhraseRaw } from '~/types';
import { getChatGPTImage, getChatGPTResponse } from '~/server/chatgpt-api.server';
import { db } from '~/server/db.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const userPrompt: string = formData.get('prompt') as string;

  try {
    const response_assistant = await getChatGPTResponse(userPrompt ?? "");
    const responseAsArray: PhraseRaw[] = JSON.parse(response_assistant).phrases;
    const allResponses = await Promise.all(responseAsArray.map(async (phrase: PhraseRaw) => {
      const imageGenerationPrompt = makeImageGenerationPrompt(phrase.english);
      const image = await getChatGPTImage(imageGenerationPrompt) ?? "";
      return {
        spanish: phrase.spanish,
        english: phrase.english,
        image,
      };
    }));

    // Insert responses into the in_review table
    const stmt = db.prepare(`
      INSERT INTO in_review (spanish, english, image)
      VALUES (@spanish, @english, @image)
    `);

    const insertMany = db.transaction((responses) => {
      for (const response of responses) {
        stmt.run(response);
      }
    });

    insertMany(allResponses);

    return { response: allResponses };
  } catch (error) {
    console.error('Error calling ChatGPT API:', error);
    return Response.json({ error: 'Failed to get response from ChatGPT' }, { status: 500 });
  }
};



const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export default function Index() {
  const [userPrompt, setUserPrompt] = useState('');
  const fetcher = useFetcher<{ response: Phrase[] }>();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetcher.submit({ prompt: userPrompt }, { method: 'post' });
  };

  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    // redirect the user to the review page if the fetcher has data
    if (fetcher.data?.response) {
      navigateRef.current('/generate/review');
    }
  }, [fetcher.data?.response]);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Spanish Flashcard Generator
      </Typography>
      <form onSubmit={handleSubmit}>
        <StyledTextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          label="Enter your prompt"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          aria-label="Enter your prompt"
        />
        <StyledButton
          variant="contained"
          color="primary"
          type="submit"
          disabled={fetcher.state === 'submitting'}
          aria-label="Generate Response"
        >
          {fetcher.state === 'submitting' ? (
            <>
              <CircularProgress size={24} color="inherit" sx={{ marginRight: 1 }} />
              <span className="sr-only">Generating response...</span>
            </>
          ) : (
            'Generate Response'
          )}
        </StyledButton>
      </form>
      {fetcher.data && fetcher.state !== 'submitting' && (
        <Outlet context={{ data: fetcher.data.response }} />
      )}
    </Container>
  );
}
