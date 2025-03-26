import { injectable } from '@infra/container';

import { toastError, toastSuccess } from '@ui/presentation/Toast';

@injectable
export class UtilService {
  constructor() {}

  toastSuccess(text: string) {
    toastSuccess(text, crypto.randomUUID());
  }

  toastError(text: string) {
    toastError(text, crypto.randomUUID());
  }
}
