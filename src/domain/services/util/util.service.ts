import { injectable } from '@infra/container';

import { toastError, toastSuccess } from '@ui/presentation/Toast';

@injectable
export class UtilService {
  constructor() {}

  toastSuccess(text: string, id?: string) {
    toastSuccess(text, id ?? crypto.randomUUID());
  }

  toastError(text: string, id?: string) {
    toastError(text, id ?? crypto.randomUUID());
  }
}
