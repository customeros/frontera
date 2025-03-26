import { Tracer } from '@infra/tracer';
import { action, observable } from 'mobx';
import { inject } from '@infra/container';
import { UtilService } from '@domain/services';
import { Document } from '@store/Documents/Document.dto';
import { DocumentsStore } from '@store/Documents/Documents.store';
import { DocumentService } from '@domain/services/document/document.service';

export class DocumentRenameUsecase {
  @inject(DocumentService) private service!: DocumentService;
  @inject(UtilService) private util!: UtilService;

  @observable public accessor isRenameModalOpen = false;
  @observable public accessor renameValue = '';
  @observable public accessor renameValidation = '';
  @observable private accessor document: Document | null = null;

  constructor(private store: DocumentsStore) {
    const span = Tracer.span('RenameDocumentUsecase.constructor');

    if (!document) {
      console.error(
        'UpdateDocumnetUsecase.constructor: document is missing. Aborting usecase.',
      );

      span.end();
    }

    span.end();
  }

  @action
  toggleRename = (value: boolean) => {
    const span = Tracer.span('RenameDocumentUsecase.toggleRename');

    this.isRenameModalOpen = value;
    span.end();
  };

  @action
  setRenameValue = (value: string) => {
    const span = Tracer.span('RenameDocumentUsecase.setRenameValue');

    this.renameValue = value;
    this.validateRenameValue();

    span.end();
  };

  @action
  validateRenameValue = () => {
    const span = Tracer.span('RenameDocumentUsecase.validateRenameValue');

    if (this.renameValue.length === 0) {
      this.renameValidation = 'Even classified docs have names';
    } else {
      this.renameValidation = '';
    }

    span.end();
  };

  @action
  init = (docId: string, name: string) => {
    const span = Tracer.span('RenameDocumentUsecase.init');

    this.document = this.store.getById(docId)!;
    this.renameValue = name;
    this.validateRenameValue();
    this.toggleRename(false);
    span.end();
  };

  execute = async ({ onSuccess }: { onSuccess: () => void }) => {
    const span = Tracer.span('RenameDocumentUsecase.execute');

    if (!this.document) {
      console.error('RenameDocumentUsecase.execute: document must not be null');

      span.end();

      return;
    }

    this.document.draft();
    this.document.value.name = this.renameValue;
    this.document.commit({ syncOnly: true });

    const [_, err] = await this.service.updateDocument(this.document);

    if (err) {
      console.error('RenameDocumentUsecase.execute', err);

      span.end();

      return;
    }

    this.util.toastSuccess('Document renamed');
    onSuccess();

    span.end();
  };
}
