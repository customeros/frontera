/* eslint-disable @typescript-eslint/no-explicit-any */
import { Store } from '../store/store';
import { Policy, FetchContext } from './policy';

type FieldResolver<V, R> = (fieldValue: V) => R;

type AggregationSpec<T> = {
  [K in keyof T]?: FieldResolver<T[K], any>;
};

type AggregateConstructor<T> = new () => Aggregate<T>;

type AggregatedFields<TSpec extends AggregationSpec<any>> = {
  [K in keyof TSpec]: TSpec[K] extends FieldResolver<any, infer R> ? R : never;
};

type AggregateOf<
  TEntity,
  TSpec extends AggregationSpec<any>,
  TAggregateClass extends Aggregate<TEntity>,
> = TAggregateClass & AggregatedFields<TSpec> & { base: TEntity };

export abstract class Aggregate<TBase> {
  base!: TBase;
}

export class AggregatePolicy<
  TEntity,
  TSpec extends AggregationSpec<TEntity>,
  TAggregateClass extends Aggregate<TEntity> = Aggregate<TEntity>,
> extends Policy<TEntity> {
  public readonly _aggregateType!: AggregateOf<TEntity, TSpec, TAggregateClass>;

  constructor(
    private AggregateClass: AggregateConstructor<TEntity>,
    private aggregationSpec: TSpec,
  ) {
    super();
  }

  onAttach(_store: Store<TEntity>): void {
    // optional: could setup visibility listeners, etc.
  }

  getAggregate(
    ctx: FetchContext,
  ): AggregateOf<TEntity, TSpec, TAggregateClass> | undefined {
    const entry = ctx.store.get(ctx.key);

    if (!entry) return undefined;

    const aggregate = new this.AggregateClass() as Aggregate<TEntity> &
      AggregatedFields<TSpec>;

    aggregate.base = entry;

    for (const field in this.aggregationSpec) {
      const resolver = this.aggregationSpec[field];

      if (!resolver) continue;

      Object.defineProperty(aggregate, field, {
        get() {
          return resolver((entry as any)[field]);
        },
        enumerable: true,
        configurable: true,
      });
    }

    return aggregate as AggregateOf<TEntity, TSpec, TAggregateClass>;
  }
}
