export type Constructor<T = {}> = new (...args: any[]) => T;

export type PromiseOrSync<T> = Promise<T> | T;
export type PromiseResolveOrSync<T> = T extends Promise<infer U> ? U : T;

export interface HipWorkResponse<ResponseShape> {
  unsafeResponse: ResponseShape;
  status?: number;
}

export type AllAsyncStageKeys = 'attachData' | 'finalAuthorize' | 'doWork';
export type AllSyncStageKeys =
  | 'initPreContext'
  | 'sanitizeParams'
  | 'sanitizeQueryParams'
  | 'sanitizeBody'
  | 'preAuthorize'
  | 'respond'
  | 'sanitizeResponse';
export type AllStageKeys = AllAsyncStageKeys | AllSyncStageKeys;

export interface OptionallyHasInitPreContext<TUnsafe, TContextInit> {
  initPreContext?: (unsafe: TUnsafe) => TContextInit;
}

// @todo: maybe this needs some rework to ensure it's not express-biased
export interface HasInitPreContext<TUnsafe, TContextInit> {
  initPreContext: (unsafe: TUnsafe) => TContextInit;
}

// @todo: should all these contexts be constrained to be object-like?

export interface OptionallyHasSanitizeParams<TUnsafeParams, TSafeParams> {
  sanitizeParams?: (unsafeParams: TUnsafeParams) => TSafeParams;
}

export interface HasSanitizeParams<TUnsafeParams, TSafeParams> {
  sanitizeParams: (unsafeParams: TUnsafeParams) => TSafeParams;
}

export interface OptionallyHasSanitizeQueryParams<
  TUnsafeQueryParams,
  TSafeQueryParams
> {
  sanitizeQueryParams?: (
    unsafeQueryParams: TUnsafeQueryParams
  ) => TSafeQueryParams;
}

export interface HasSanitizeQueryParams<TUnsafeQueryParams, TSafeQueryParams> {
  sanitizeQueryParams: (
    unsafeQueryParams: TUnsafeQueryParams
  ) => TSafeQueryParams;
}

export interface OptionallyHasSanitizeBody<TUnsafeBody, TSafeBody> {
  sanitizeBody?: (unsafeBody: TUnsafeBody) => TSafeBody;
}

export interface HasSanitizeBody<TUnsafeBody, TSafeBody> {
  sanitizeBody: (unsafeBody: TUnsafeBody) => TSafeBody;
}

// @todo: should TContextOut be constrained to be object-like or booly?
export interface HasPreAuthorize<TContextIn, TContextOut> {
  preAuthorize: (context: TContextIn) => TContextOut;
}

export interface MightHavePreAuthorize<TContextIn, TContextOut> {
  preAuthorize?: (context: TContextIn) => TContextOut;
}

export interface OptionallyHasAttachData<TContextIn, TContextOut> {
  attachData?: (context: TContextIn) => PromiseOrSync<TContextOut>;
}

export interface HasAttachData<TContextIn, TContextOut> {
  attachData: (context: TContextIn) => PromiseOrSync<TContextOut>;
}

// @todo: should TContextOut be constrained to be object-like or booly?
export interface MightHaveFinalAuthorize<TContextIn, TContextOut> {
  finalAuthorize?: (context: TContextIn) => PromiseOrSync<TContextOut>;
}

export interface HasFinalAuthorize<TContextIn, TContextOut> {
  finalAuthorize: (context: TContextIn) => PromiseOrSync<TContextOut>;
}

export interface OptionallyHasDoWork<TContextIn, TContextOut> {
  doWork?: (context: TContextIn) => PromiseOrSync<TContextOut>;
}

export interface HasDoWork<TContextIn, TContextOut> {
  doWork: (context: TContextIn) => PromiseOrSync<TContextOut>;
}

export interface MightHaveRespond<TContextIn, TUnsafeResponse> {
  respond?: (context: TContextIn) => HipWorkResponse<TUnsafeResponse>;
}

export interface HasRespond<TContextIn, TUnsafeResponse> {
  respond: (context: TContextIn) => HipWorkResponse<TUnsafeResponse>;
}

export interface MightHaveSanitizeResponse<TUnsafeResponse, TResponse> {
  sanitizeResponse?: (context: TUnsafeResponse) => TResponse;
}

export interface HasSanitizeResponse<TUnsafeResponse, TResponse> {
  sanitizeResponse: (context: TUnsafeResponse) => TResponse;
}

export type HasAllRequireds = HasPreAuthorize<any, any> &
  HasFinalAuthorize<any, any> &
  HasRespond<any, any> &
  HasSanitizeResponse<any, any>;

export type HasAllNotRequireds = OptionallyHasInitPreContext<any, any> &
  OptionallyHasSanitizeParams<any, any> &
  OptionallyHasSanitizeQueryParams<any, any> &
  OptionallyHasSanitizeBody<any, any> &
  OptionallyHasAttachData<any, any> &
  OptionallyHasDoWork<any, any>;

export type HasAllStagesNotOptionals = HasInitPreContext<any, any> &
  HasSanitizeParams<any, any> &
  HasSanitizeQueryParams<any, any> &
  HasSanitizeBody<any, any> &
  HasPreAuthorize<any, any> &
  HasAttachData<any, any> &
  HasFinalAuthorize<any, any> &
  HasDoWork<any, any> &
  HasRespond<any, any> &
  HasSanitizeResponse<any, any>;

export type HasAllStagesOptionals = OptionallyHasInitPreContext<any, any> &
  OptionallyHasSanitizeParams<any, any> &
  OptionallyHasSanitizeQueryParams<any, any> &
  OptionallyHasSanitizeBody<any, any> &
  MightHavePreAuthorize<any, any> &
  OptionallyHasAttachData<any, any> &
  MightHaveFinalAuthorize<any, any> &
  OptionallyHasDoWork<any, any> &
  MightHaveRespond<any, any> &
  MightHaveSanitizeResponse<any, any>;

/*
type Funcs = {
  a: () => void;
  v: (text: string) => number;
};
type IPFuncs = IntersectProperties<Funcs>;
// type IPFuncs = (() => void) & ((text: string) => number) 👍
type Foo = { a: string; b: number };
type Bar = IntersectProperties<Foo>;
// type Bar = string & number 😕
*/

type IntersectProperties<T extends object> = keyof T extends never
  ? {}
  : { [K in keyof T]: (arg: T[K]) => void } extends Record<
      keyof T,
      (arg: infer A) => void
    >
  ? A
  : never;

type ReturnedTypeUpToPreAuthorize<TValue, TKey> = TKey extends 'body'
  ? HasSanitizeBody<any, TValue>
  : TKey extends 'params'
  ? HasSanitizeParams<any, TValue>
  : TKey extends 'queryParams'
  ? HasSanitizeQueryParams<any, TValue>
  : TKey extends 'preContext'
  ? HasInitPreContext<any, TValue>
  : {};

export type PreAuthReqsSatisfied<
  T extends HasPreAuthorize<any, any>
> = IntersectProperties<
  {
    [P in keyof Parameters<T['preAuthorize']>[0]]: ReturnedTypeUpToPreAuthorize<
      Parameters<T['preAuthorize']>[0][P],
      P
    >;
  }
>;

type OptionalAttachDataParams<T> = [T] extends [HasAttachData<any, any>]
  ? Parameters<T['attachData']>[0]
  : {};

type ReturnedSomewhereUpToAttachData<
  TOut,
  TValue,
  TKey extends string | symbol | number
> = [TOut] extends [HasPreAuthorize<any, Record<TKey, TValue>>]
  ? HasPreAuthorize<any, Record<TKey, TValue>>
  : never;

type AllInitKeys = 'preContext' | 'params' | 'queryParams' | 'body';

export type AttachDataReqsSatisfiedOptional<T> = IntersectProperties<
  {
    [P in keyof OptionalAttachDataParams<T>]: [P] extends [AllInitKeys]
      ? ReturnedTypeUpToPreAuthorize<OptionalAttachDataParams<T>[P], P>
      : ReturnedSomewhereUpToAttachData<T, OptionalAttachDataParams<T>[P], P>;
  }
>;

type ReturnedSomewhereUpToFinalAuthorize<
  TOut,
  TValue,
  TKey extends string | symbol | number
> = [TOut] extends [HasAttachData<any, Record<TKey, TValue>>]
  ? HasAttachData<any, Record<TKey, TValue>>
  : [TOut] extends [HasPreAuthorize<any, Record<TKey, TValue>>]
  ? HasPreAuthorize<any, Record<TKey, TValue>>
  : never;

export type FinalAuthReqsSatisfied<
  T extends HasFinalAuthorize<any, any>
> = IntersectProperties<
  {
    [P in keyof Parameters<T['finalAuthorize']>[0]]: [P] extends [AllInitKeys]
      ? ReturnedTypeUpToPreAuthorize<Parameters<T['finalAuthorize']>[0][P], P>
      : ReturnedSomewhereUpToFinalAuthorize<
          T,
          Parameters<T['finalAuthorize']>[0][P],
          P
        >;
  }
>;

type OptionalDoWorkParams<T> = [T] extends [HasDoWork<any, any>]
  ? Parameters<T['doWork']>[0]
  : {};

type ReturnedSomewhereUpToDoWork<
  TOut,
  TValue,
  TKey extends string | symbol | number
> = [TOut] extends [HasFinalAuthorize<any, Record<TKey, TValue>>]
  ? HasFinalAuthorize<any, Record<TKey, TValue>>
  : [TOut] extends [HasAttachData<any, Record<TKey, TValue>>]
  ? HasAttachData<any, Record<TKey, TValue>>
  : [TOut] extends [HasPreAuthorize<any, Record<TKey, TValue>>]
  ? HasPreAuthorize<any, Record<TKey, TValue>>
  : never;

export type DoWorkReqsSatisfiedOptional<T> = IntersectProperties<
  {
    [P in keyof OptionalDoWorkParams<T>]: [P] extends [AllInitKeys]
      ? ReturnedTypeUpToPreAuthorize<OptionalDoWorkParams<T>, P>
      : ReturnedSomewhereUpToDoWork<T, OptionalDoWorkParams<T>[P], P>;
  }
>;

type ReturnedSomewhereUpToRespond<
  TOut,
  TValue,
  TKey extends string | symbol | number
> = [TOut] extends [HasDoWork<any, Record<TKey, TValue>>]
  ? HasDoWork<any, TValue>
  : [TOut] extends [HasFinalAuthorize<any, Record<TKey, TValue>>]
  ? HasFinalAuthorize<any, Record<TKey, TValue>>
  : [TOut] extends [HasAttachData<any, Record<TKey, TValue>>]
  ? HasAttachData<any, Record<TKey, TValue>>
  : [TOut] extends [HasPreAuthorize<any, Record<TKey, TValue>>]
  ? HasPreAuthorize<any, Record<TKey, TValue>>
  : never;

export type RespondReqsSatisfied<
  T extends HasRespond<any, any>
> = IntersectProperties<
  {
    [P in keyof Parameters<T['respond']>[0]]: [P] extends [AllInitKeys]
      ? ReturnedTypeUpToPreAuthorize<Parameters<T['respond']>[0][P], P>
      : ReturnedSomewhereUpToRespond<T, Parameters<T['respond']>[0][P], P>;
  }
>;

type ReturnedSomewhereUpToSanitizeResponse<TOut, TValue> = [TOut] extends [
  HasRespond<any, TValue>
]
  ? HasRespond<any, TValue>
  : never;

export type SanitizeResponseReqsSatisfied<
  T extends HasSanitizeResponse<any, any>
> = IntersectProperties<
  {
    [P in keyof Parameters<
      T['sanitizeResponse']
    >[0]]: ReturnedSomewhereUpToSanitizeResponse<
      T,
      Record<P, Parameters<T['sanitizeResponse']>[0][P]>
    >;
  }
>;
