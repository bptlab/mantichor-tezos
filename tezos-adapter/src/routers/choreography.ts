import { Router } from 'express';
import * as connector from '../connector';
import { deployChoreography, executeFunction, getActiveTasks } from '../connector/ContractHelper';
import {
  ChoreographyMappings, getMappingsForChoreography,
  XMLWithRole, XMLWithRoleMapping,
} from '../models/RoleMapping';

const router = Router();

const choreographyRoleMappings: ChoreographyMappings[] = [];

router.post('/choreographies', async (request, response) => {
  const { xml, id, mappings }: XMLWithRoleMapping = request.body;
  choreographyRoleMappings.push({ mappings, id });
  const address = await deployChoreography(xml, await connector.getDefaultAccount());
  response.send({
    address,
  });
});

router.post('/choreographies/:choreographyId/tasks/execute', async (request, response) => {
  const { choreographyId } = request.params;
  const { task, xml, id, role }: XMLWithRole = request.body;
  const mappings = getMappingsForChoreography(choreographyRoleMappings, id);
  const account = connector.getAccount(role, mappings);
  // TODO: Implement task hierarchy
  if (await executeFunction(xml, choreographyId, await account, task[0])) {
    response.sendStatus(200);
  } else {
    response.sendStatus(500);
  }
});

router.post('/choreographies/:choreographyId/tasks', async (request, response) => {
  const { choreographyId } = request.params;
  const { enabled } = request.query;
  const { xml } = request.body;
  const tasks = await getActiveTasks(xml, choreographyId);
  response.send({ tasks });
});

export default router;
