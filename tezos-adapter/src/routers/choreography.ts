import { Router } from 'express';
import { ContractGenerator } from '../translator/ContractGenerator';
import { Contract } from './../models/Contract';

const router = Router();

router.post('/choreographies', async (request, response) => {
  const { xml, id } = request.body;
  const contracts: Contract[] = await ContractGenerator
    .generateContractsFromBPMN(xml);

  const address = 'no address yet';
  // TODO: Deploy contract
  response.send({
    address,
  });
});

router.post('/choreographies/{choreographyId}/tasks/execute', (request, response) => {
  const { choreographyId } = request.params;
  const { task } = request.body;

  // `task` is an array of strings
  // TODO: Execute given tasks
  response.status(500).send({message: 'Execute Tasks is not implemented yet'});
});

router.get('/choreographies/{choreographyId}/tasks:', (request, response) => {
  const { choreographyId } = request.params;
  const { enabled } = request.query;

  // `enabled` specifies requested tasks
  // TODO: List accessible tasks
  response.status(500).send({message: 'Get Tasks is not implemented yet'});
});

export default router;
