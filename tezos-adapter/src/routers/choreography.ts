import { Router } from 'express';
import { isNullOrUndefined } from 'util';
import * as connector from '../connector';
import { deployChoreography, executeFunction, getActiveTasks } from '../connector/ContractHelper';
import { getAccountForAddress } from '../models/Account';
import {
  XMLWithRole, XMLWithRoleMapping,
} from '../models/RoleMapping';

const router = Router();

router.post('/choreographies', async (request, response) => {
  const { xml, id, mappings }: XMLWithRoleMapping = request.body;
  const address = await deployChoreography(xml, connector.getDefaultAccount(), mappings);
  response.send({
    address,
  });
});

router.post('/choreographies/:choreographyId/tasks/execute', async (request, response) => {
  const { choreographyId } = request.params;
  const { task, xml, id, address, mappings }: XMLWithRole = request.body;
  const account = await getAccountForAddress(address);
  if (isNullOrUndefined(account)) {
    console.info(`No account found for address ${address}!`);
    response.sendStatus(401);
  } else if (await executeFunction(xml, choreographyId, account, task[0], mappings)) {
    response.sendStatus(200);
  } else {
    response.sendStatus(500);
  }
});

router.post('/choreographies/:choreographyId/tasks', async (request, response) => {
  const { choreographyId } = request.params;
  const { enabled } = request.query;
  const { xml, mappings } = request.body;
  const tasks = await getActiveTasks(xml, choreographyId, mappings);
  response.send({ tasks });
});

export default router;
