import { Router } from 'express';
import * as connector from '../connector';
import { deployChoreography, executeFunction, getActiveTasks } from '../connector/ContractHelper';
import { Contract } from '../models/Contract';
import { ContractGenerator } from '../translator/ContractGenerator';

const router = Router();
const account = connector.createAccount();

router.post('/choreographies', async (request, response) => {
  const { xml, id } = request.body;
  const address = await deployChoreography(xml, await account);
  response.send({
    address,
  });
});

router.post('/choreographies/:choreographyId/tasks/execute', async (request, response) => {
  const { choreographyId } = request.params;
  const { tasks, xml } = request.body;
  // TODO: Implement task hierarchy
  await executeFunction(xml, choreographyId, await account, tasks[0]);
  response.sendStatus(200);
});

router.post('/choreographies/:choreographyId/tasks', async (request, response) => {
  const { choreographyId } = request.params;
  const { enabled } = request.query;
  const { xml } = request.body;
  const tasks = await getActiveTasks(xml, choreographyId);
  response.send({tasks});
});

export default router;
