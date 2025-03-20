import { Tracer } from '@infra/tracer';
import { injectable } from '@infra/container';
import { DocumentRepository } from '@infra/repositories/realtime/document';

import { unwrap } from '@utils/unwrap';

@injectable
export class DocumentService {
  private repository = DocumentRepository.getInstance();

  constructor() {}

  async listOrganizationDocuments(organizationId: string) {
    const span = Tracer.span('DocumentService.listOrganizationDocuments');

    const [res, err] = await unwrap(
      this.repository.getOrganizationDocuments({ organizationId }),
    );

    if (err) {
      console.error(
        'DocumentService.listOrganizationDocuments: Could not load organization documents',
      );

      span.end();

      return [];
    }

    const data = res?.organizationDocuments;

    if (!data) {
      console.error(
        'DocumentService.listOrganizationDocuments: No organization documents found',
      );

      span.end();

      return [];
    }

    span.end();

    return data;
  }
}
