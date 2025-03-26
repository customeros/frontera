import { runInAction } from 'mobx';
import { Store } from '@store/_store';
import { RootStore } from '@store/root';
import { Transport } from '@infra/transport';
import { DocumentDatum } from '@infra/repositories/realtime/document';
import { DocumentRepository } from '@infra/repositories/realtime/document';

import { unwrap } from '@utils/unwrap';

import { Document } from './Document.dto';

export class DocumentsStore extends Store<DocumentDatum, Document> {
  private repository = DocumentRepository.getInstance();

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

  invalidate = async (id: string) => {
    const [res, err] = await unwrap(this.repository.getDocument({ id }));

    if (err) {
      console.error(err);

      return;
    }

    if (res?.document) {
      const data = res.document;

      runInAction(() => {
        this.value.set(data.id, new Document(this, data));
      });
    }
  };
}
