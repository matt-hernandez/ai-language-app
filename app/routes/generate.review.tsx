import { Alert, Button, Divider, Paper, styled } from '@mui/material';
import { Form, useActionData, useOutletContext } from '@remix-run/react';
import type { Phrase } from '~/types';
import PhraseInReview from '~/components/PhraseInReview';
import type { ActionFunctionArgs } from '@remix-run/node';
import { MAX_PHRASES_IN_REVIEW } from '~/constants';
import { Fragment, useState } from 'react';
import sharp from 'sharp';
import CSVDownload from '~/components/CSVDownload';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
}));

async function generateCSV(phrases: Phrase[]) {
  // Create CSV content without headers
  const rows = phrases.map(phrase =>
    `${phrase.english}|${phrase.spanish}|<img src="data:image/jpeg;base64,${phrase.image}" />`
  );
  const csvContent = rows.join('\n');
  return csvContent;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  // generate an array of numbers from 0 to 19
  const numbers = Array.from({ length: MAX_PHRASES_IN_REVIEW }, (_, i) => i);
  const phrases = await Promise.all(numbers.map(async (number) => {
    const spanish = formData.get(`${number}-spanish`) as string;
    const english = formData.get(`${number}-english`) as string;
    const image: string = formData.get(`${number}-image`) as string;
    const imageBuffer = Buffer.from(image, 'base64');
    const resizedImageBuffer = await sharp(imageBuffer)
      .toFormat('jpeg')
      .resize(600, 600)
      .toBuffer();
    const resizedImage = resizedImageBuffer.toString('base64');
    return { spanish, english, image: resizedImage };
  }));

  // Generate CSV after all insertions
  const csvContent = await generateCSV(phrases);
  return { success: true, csvContent };
}

export default function Review() {
  const outletContext = useOutletContext<{ data: Phrase[] }>();
  const data = outletContext?.data;
  const [phrases, setPhrases] = useState(data);
  const actionData = useActionData<typeof action>();
  console.log(phrases);
  if (actionData?.success && phrases.length > 0) {
    setPhrases([]);
  }

  return (
    <>
      {phrases && !actionData?.success && (
        <StyledPaper>
          <Form method="post">
            {data.map((phrase: Phrase, index: number) => (
              <Fragment key={phrase.english}>
                <PhraseInReview phrase={phrase} index={index} />
                <Divider sx={{ my: 2 }} />
              </Fragment>
            ))}
            <Button type="submit" variant="contained" disabled={actionData?.success} color={actionData?.success ? "success" : "primary"} sx={{ mt: 2 }}>
              {actionData?.success ? "Done!" : "Accept all"}
            </Button>
          </Form>
        </StyledPaper>
      )}
      {actionData?.success && (
        <>
          <Alert severity="success">Done!</Alert>
          <CSVDownload csvContent={actionData.csvContent} />
        </>
      )}
    </>
  )
}