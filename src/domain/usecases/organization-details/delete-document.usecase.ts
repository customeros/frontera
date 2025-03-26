import { Tracer } from '@infra/tracer';
import { inject } from '@infra/container';
import { UtilService } from '@domain/services';
import { action, observable, runInAction } from 'mobx';
import { DocumentsStore } from '@store/Documents/Documents.store';
import { DocumentService } from '@domain/services/document/document.service';

export class DeleteDocumentUsecase {
  @inject(DocumentService) private service!: DocumentService;
  @inject(UtilService) private util!: UtilService;

  @observable public accessor id: string | null = null;
  @observable public accessor isDeleteConfirmationOpen = false;

  constructor(private store: DocumentsStore) {}

  @action
  toggleConfirmation = (value: boolean) => {
    const span = Tracer.span('DeleteDocumentUsecase.toggelConfirmation');

    this.isDeleteConfirmationOpen = value;
    span.end();
  };

  @action
  init = (id: string) => {
    const span = Tracer.span('DeleteDocumentUsecase.init');

    this.id = id;
    this.toggleConfirmation(false);
    span.end();
  };

  execute = async () => {
    const span = Tracer.span('DeleteDocumentUsecase.execute');

    if (!this.id) {
      console.error(
        'DeleteDocumentUsecase.execute: document ID is missing. Aborting usecase.',
      );

      span.end();

      return;
    }

    const [_, err] = await this.service.deleteDocument(this.id);

    if (err) {
      console.error('DeleteDocumentUsecase.execute', err);

      span.end();

      this.util.toastError('We’re unable to archive this document');

      return;
    }

    runInAction(() => {
      this.id && this.store.value.delete(this.id);
    });
    this.store.sync({ action: 'DELETE', ids: [this.id] });
    this.util.toastSuccess('Archived document');
    this.toggleConfirmation(false);

    span.end();
  };
}
