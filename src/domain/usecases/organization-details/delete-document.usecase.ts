import { Tracer } from '@infra/tracer';
import { action, observable } from 'mobx';
import { inject } from '@infra/container';
import { DocumentsStore } from '@store/Documents/Documents.store';
import { DocumentService } from '@domain/services/document/document.service';

export class DeleteDocumentUsecase {
  @inject(DocumentService) private service!: DocumentService;

  @observable public accessor isDeleteConfirmationOpen = false;

  constructor(private id: string, private store: DocumentsStore) {}

  @action
  toggleConfirmation = (value: boolean) => {
    const span = Tracer.span('DeleteDocumentUsecase.toggelConfirmation');

    this.isDeleteConfirmationOpen = value;
    span.end();
  };

  @action
  init = () => {
    const span = Tracer.span('DeleteDocumentUsecase.init');

    this.toggleConfirmation(false);
    span.end();
  };

  execute = async () => {
    const span = Tracer.span('DeleteDocumentUsecase.execute');

    const [_, err] = await this.service.deleteDocument(this.id);

    if (err) {
      console.error('DeleteDocumentUsecase.execute', err);

      span.end();

      return;
    }

    this.store.value.delete(this.id);

    this.init();

    span.end();
  };
}
