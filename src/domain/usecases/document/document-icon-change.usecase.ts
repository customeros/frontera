import { Tracer } from '@infra/tracer';
import { action, observable } from 'mobx';
import { inject } from '@infra/container';
import { UtilService } from '@domain/services';
import { Document } from '@store/Documents/Document.dto';
import { DocumentsStore } from '@store/Documents/Documents.store';
import { DocumentService } from '@domain/services/document/document.service';

import { IconName } from '@ui/media/Icon';

export class DocumentIconChangeUsecase {
  @inject(DocumentService) private service!: DocumentService;
  @inject(UtilService) private util!: UtilService;

  @observable private accessor document: Document | null = null;

  constructor(private store: DocumentsStore) {
    const span = Tracer.span('UpdateDocumentUsecase.constructor');

    if (!document) {
      console.error(
        'UpdateDocumnetUsecase.constructor: document is missing. Aborting usecase.',
      );

      span.end();
    }

    span.end();
  }

  @action
  init = (docId: string) => {
    const span = Tracer.span('UpdateDocumentUsecase.init');

    this.document = this.store.getById(docId)!;
    span.end();
  };

  @action
  executeIconChange = async (icon: IconName) => {
    const span = Tracer.span('UpdateDocumentUsecase.executeIconChange');

    if (!this.document) {
      console.error(
        'UpdateDocumentUsecase.executeIconChange: document must not be null',
      );

      span.end();

      return;
    }

    this.document.draft();
    this.document.value.icon = icon;
    this.document.commit({ syncOnly: true });

    const [_, err] = await this.service.updateDocument(this.document);

    if (err) {
      console.error('UpdateDocumentUsecase.execute', err);

      span.end();

      return;
    }

    this.init(this.document.id);

    span.end();
  };

  @action
  executeColorChange = async (color: string) => {
    const span = Tracer.span('UpdateDocumentUsecase.executeColorChange');

    if (!this.document) {
      console.error(
        'UpdateDocumentUsecase.executeColorChange: document must not be null',
      );

      span.end();

      return;
    }

    this.document.draft();
    this.document.value.color = color;
    this.document.commit({ syncOnly: true });

    const [_, err] = await this.service.updateDocument(this.document);

    if (err) {
      console.error('UpdateDocumentUsecase.executeColorChange', err);

      span.end();

      return;
    }

    this.init(this.document.id);

    span.end();
  };
}
