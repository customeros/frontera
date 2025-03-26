import merge from 'lodash/merge';
import { Entity } from '@store/record';
import { computed, observable, runInAction } from 'mobx';
import { DocumentDatum } from '@infra/repositories/realtime/document';

import { DocumentsStore } from './Documents.store';

export class Document extends Entity<DocumentDatum> {
  @observable accessor value: DocumentDatum = Document.default();

  constructor(store: DocumentsStore, data: DocumentDatum) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super(store as any, data);
  }

  @computed
  get id() {
    return this.value.id;
  }

  set id(value: string) {
    runInAction(() => {
      this.value.id = value;
    });
  }

  toUpdatePayload() {
    return {
      id: this.value.id!,
      name: this.value.name!,
      icon: this.value.icon!,
      color: this.value.color!,
    };
  }

  static default(payload?: Partial<DocumentDatum>): DocumentDatum {
    return merge(
      {
        id: crypto.randomUUID(),
        name: '',
        icon: '',
        color: '',
        userId: '',
        tenant: '',
        updatedAt: '',
        insertedAt: '',
        organizationId: '',
      },
      payload ?? {},
    );
  }
}
