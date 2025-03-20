import { Tracer } from '@infra/tracer';
import { inject } from '@infra/container';
import { Document } from '@store/Documents/Document.dto';
import { DocumentsStore } from '@store/Documents/Documents.store';
import { DocumentService } from '@domain/services/document/document.service';

export class DocumentsUsecase {
  @inject(DocumentService) private service!: DocumentService;

  constructor(private organizationId: string, private store: DocumentsStore) {}

  async init() {
    const span = Tracer.span('DocumentsUsecase.init');

    const data = await this.service.listOrganizationDocuments(
      this.organizationId,
    );

    if (data.length) {
      data.forEach((item) => {
        if (!item) return;
        if (this.store.value.has(item.id)) return;

        this.store.value.set(item.id, new Document(this.store, item));
      });
    }

    span.end();
  }
}
