import { Button, CircularProgress, Container, styled, TextField, Typography } from '@mui/material';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { isRouteErrorResponse, Outlet, useFetcher, useNavigate, useRouteError } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import { makeImageGenerationPrompt } from '~/utils/make-prompt';
import type { PhraseForReview, PhraseRaw } from '~/types';
import { createPhraseAssistant, createPhraseThread, getAssistantId, getChatGPTImage, getChatGPTResponse, getThreadId, retrieveExistingPhraseAssistant, retrieveExistingPhraseThread } from '~/server/chatgpt-api.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // check the cookies for an assistant id
  let assistantId = request.headers.get('Cookie')?.split('; ').find(row => row.startsWith('assistantId='))?.split('=')[1];
  if (!assistantId) {
    await createPhraseAssistant();
  } else {
    await retrieveExistingPhraseAssistant(assistantId);
  }
  assistantId = await getAssistantId();

  // check the cookies for a thread id
  let threadId = request.headers.get('Cookie')?.split('; ').find(row => row.startsWith('threadId='))?.split('=')[1];
  if (!threadId) {
    await createPhraseThread();
  } else {
    await retrieveExistingPhraseThread(threadId);
  }
  threadId = await getThreadId();

  return new Response(JSON.stringify({ assistantId, threadId }), {
    headers: [
      // set to longest max age possible
      ['Set-Cookie', `assistantId=${assistantId}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 365}`],
      ['Set-Cookie', `threadId=${threadId}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 365}`],
    ],
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const userPrompt: string = formData.get('prompt') as string;

  try {
    const response_assistant = await getChatGPTResponse(userPrompt ?? "");
    const responseAsArray: PhraseRaw[] = JSON.parse(response_assistant).phrases;
    const allResponses: PhraseForReview[] = await Promise.all(responseAsArray.map(async (phrase: PhraseRaw) => {
      const imageGenerationPrompt = makeImageGenerationPrompt(phrase.imagePrompt);
      const image = await getChatGPTImage(imageGenerationPrompt) ?? "";
      return {
        spanish: phrase.spanish,
        english: phrase.english,
        image,
        imagePrompt: phrase.imagePrompt,
      };
    }));

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
  const fetcher = useFetcher<{ response: PhraseForReview[] }>();

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
      setTimeout(() => {
        navigateRef.current('/generate/review');
      }, 200);
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
          onClick={() => {
            // Only navigate if the user is not already on this page
            if (window.location.pathname !== '/generate') {
              navigateRef.current('/generate');
            }
          }}
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


export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
