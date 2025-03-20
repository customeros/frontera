import { observable } from 'mobx';
import { Entity } from '@store/record';
import { DocumentDatum } from '@infra/repositories/realtime/document';

import { DocumentsStore } from './Documents.store';

export class Document extends Entity<DocumentDatum> {
  @observable accessor value: DocumentDatum = Document.default();

  constructor(store: DocumentsStore, data: DocumentDatum) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super(store as any, data);
  }
}
