import { Tracer } from '@infra/tracer';
import { injectable } from '@infra/container';
import { Document } from '@store/Documents/Document.dto';
import { DocumentRepository } from '@infra/repositories/realtime/document';
import { UpdateDocumentMutation } from '@infra/repositories/realtime/document/mutations/updateDocument.generated';
import { CreateOrganizationDocumentMutation } from '@infra/repositories/realtime/document/mutations/createOrganizationDocument.generated';

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

  createOrganizationDocument = async (
    organizationId: string,
    tenant: string,
    userId: string,
  ): Promise<[CreateOrganizationDocumentMutation | null, unknown]> => {
    const span = Tracer.span('DocumentService.createOrganizationDocument');

    const [res, err] = await unwrap(
      this.repository.createOrganizationDocument({
        input: {
          body: '<p></p>',
          color: 'grayModern',
          icon: 'file-05',
          name: 'New document',
          organizationId,
          lexicalState:
            '{"root":{"type":"root","children":[{"type":"paragraph","__format":0,"__style":0,"__indent":0,"__dir":"ltr","__textFormat":0,"__textStyle":"","children":[]}]}}',
          tenant,
          userId,
        },
      }),
    );

    if (err) {
      console.error(
        'DocumentService.createOrganizationDocument: Could not create document',
      );
    }

    span.end();

    return [res, err];
  };

  updateDocument = async (
    document: Document,
  ): Promise<[UpdateDocumentMutation | null, unknown]> => {
    const span = Tracer.span('DocumentService.updateDocument');

    const [res, err] = await unwrap(
      this.repository.updateDocument({ input: document.toUpdatePayload() }),
    );

    if (err) {
      console.error(
        'DocumentService.updateDocument: Could not update document',
      );
    }

    span.end();

    return [res, err];
  };

  deleteDocument = async (id: string) => {
    const span = Tracer.span('DocumentService.deleteDocument');

    const [res, err] = await unwrap(this.repository.deleteDocument({ id }));

    if (err) {
      console.error(
        'DocumentService.deleteDocument: Could not delete document',
      );
    }

    span.end();

    return [res, err];
  };
}
