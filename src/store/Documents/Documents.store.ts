import { Store } from '@store/_store';
import { RootStore } from '@store/root';
import { Transport } from '@infra/transport';
import { DocumentDatum } from '@infra/repositories/realtime/document';

import { Document } from './Document.dto';

export class DocumentsStore extends Store<DocumentDatum, Document> {
  constructor(
    public readonly root: RootStore,
    public readonly transport: Transport,
  ) {
    super(root, transport, {
      name: 'Documents',
      getId: (datum) => datum.id,
      factory: Document,
    });
  }
}
