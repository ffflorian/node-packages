import {ActionResult} from './ActionResult.js';

export interface RepositoryResult {
  actionResults: ActionResult[];
  repositorySlug: string;
}
