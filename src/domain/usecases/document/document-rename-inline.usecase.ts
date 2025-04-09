import { Tracer } from '@infra/tracer';
import { action, observable } from 'mobx';
import { inject } from '@infra/container';
import { Document } from '@store/Documents/Document.dto';
import { DocumentsStore } from '@store/Documents/Documents.store';
import { DocumentService } from '@domain/services/document/document.service';

export class DocumentRenameInlineUsecase {
  @inject(DocumentService) private service!: DocumentService;

  @observable private accessor document: Document | null = null;

  constructor(private store: DocumentsStore) {}

  @action
  setDocumentName = (value: string) => {
    const span = Tracer.span('DocumentRenameInlineUsecase.setDocumentName');

    if (!this.document) {
      console.error(
        'DocumentRenameInlineUsecase.execute: document must not be null',
      );

      span.end();

      return;
    }

    this.document.draft();
    this.document.value.name = value;
    this.document.commit({ syncOnly: true });

    span.end();
  };

  @action
  init = (docId: string) => {
    const span = Tracer.span('DocumentRenameInlineUsecase.init');

    this.document = this.store.getById(docId)!;
    span.end();
  };

  execute = async () => {
    const span = Tracer.span('DocumentRenameInlineUsecase.execute');

    if (!this.document) {
      console.error(
        'DocumentRenameInlineUsecase.execute: document must not be null',
      );

      span.end();

      return;
    }

    const [_, err] = await this.service.updateDocument(this.document);

    if (err) {
      console.error('DocumentRenameInlineUsecase.execute', err);

      span.end();

      return;
    }

    span.end();
  };
}
