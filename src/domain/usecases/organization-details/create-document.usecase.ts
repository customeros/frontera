import { Tracer } from '@infra/tracer';
import { inject } from '@infra/container';
import { Document } from '@store/Documents/Document.dto';
import { SessionStore } from '@store/Session/Session.store';
import { DocumentsStore } from '@store/Documents/Documents.store';
import { DocumentService } from '@domain/services/document/document.service';

export class CreateDocumentUsecase {
  @inject(DocumentService) private service!: DocumentService;

  constructor(
    private organizationId: string,
    private sessionStore: SessionStore,
    private documentsStore: DocumentsStore,
  ) {}

  execute = async ({ onSuccess }: { onSuccess: (docId: string) => void }) => {
    const span = Tracer.span('CreateDocumentUsecase.execute');

    const tenant = this.sessionStore.value.tenant;
    const userId = this.sessionStore.value.profile.id;

    const [res, err] = await this.service.createOrganizationDocument(
      this.organizationId,
      tenant,
      userId,
    );

    if (err) {
      console.error('CreateDocumentUsecase.execute', err);

      span.end();

      return;
    }

    if (res?.createDocument) {
      const data = res.createDocument;

      this.documentsStore.value.set(
        data.id,
        new Document(this.documentsStore, data),
      );
      this.documentsStore.sync({ action: 'APPEND', ids: [data.id] });
      onSuccess(data.id);
    }

    span.end();
  };
}
