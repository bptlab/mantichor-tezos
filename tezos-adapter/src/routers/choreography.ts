import { Router } from 'express';
import { ChoreographyPreprocessor } from '../translator/ChoreographyPreprocessor';

const router = Router();
router.post('/deployChoreography', (request, response) => {
  const { xml } = request.body;
  ChoreographyPreprocessor.parseXml(xml);
  const address = 'no address yet'; // TODO: Deploy
  response.send({
    address,
  });
});

export default router;
