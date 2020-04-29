import {
  isHasAttachData,
  isHasDoWork,
  isHasFinalAuthorize,
  isHasInitPreContext,
  isHasPreAuthorize,
  isHasRespond,
  isHasSanitizeBody,
  isHasSanitizeParams,
  isHasSanitizeResponse,
} from './core';
import { WithFinalAuth, WithPreAuth } from './subclassers';
import {
  HasAttachData,
  HasDoWork,
  HasFinalAuthorize,
  HasInitPreContext,
  HasPreAuthorize,
  HasRespond,
  HasSanitizeBody,
  HasSanitizeParams,
  HasSanitizeResponse,
  MightHaveFinalAuthorize,
  MightHavePreAuthorize,
  MightHaveRespond,
  MightHaveSanitizeResponse,
  OptionallyHasAttachData,
  OptionallyHasDoWork,
  OptionallyHasInitPreContext,
  OptionallyHasSanitizeBody,
  OptionallyHasSanitizeParams,
  PromiseResolveOrSync,
} from './types';

type FunctionTaking<TIn> = (param: TIn) => any;

type HasTypedFunctionOn<T, K extends string> = Record<K, FunctionTaking<T>>;

export function fromWrappedInstanceMethod<
  TIn,
  TOut extends ReturnType<TInstance[TMethodName]>,
  TInstance extends HasTypedFunctionOn<TIn, TMethodName>,
  TMethodName extends string
>(instanceMethodName: TMethodName) {
  // tslint:disable-next-line:only-arrow-functions
  return function(instance: TInstance) {
    // tslint:disable-next-line:only-arrow-functions
    return Promise.resolve(function(arg: TIn): Promise<TOut> {
      return Promise.resolve(instance[instanceMethodName](arg) as TOut);
    });
  };
}

export function WithNoopPreAuth() {
  return WithPreAuth(() => true);
}

export function NoopFinalAuth() {
  return WithFinalAuth(() => true);
}

// @todo: implement all the other HTPipe*'s - note that each one will be slightly different based on their specifics...
// i.e. can return bool vs not, possibly async vs sync only, mandatory vs not mandatory...
// then the final master HTPipe will just build an object out of all the sub-HTPipe*'s

type InitPreContextIn<T extends HasInitPreContext<any, any>> = Parameters<
  T['initPreContext']
>[0];
type InitPreContextOut<T extends HasInitPreContext<any, any>> = ReturnType<
  T['initPreContext']
>;

type SanitizeParamsContextIn<
  T extends HasSanitizeParams<any, any>
> = Parameters<T['sanitizeParams']>[0];
type SanitizeParamsContextOut<
  T extends HasSanitizeParams<any, any>
> = ReturnType<T['sanitizeParams']>;

type SanitizeBodyContextIn<T extends HasSanitizeBody<any, any>> = Parameters<
  T['sanitizeBody']
>[0];
type SanitizeBodyContextOut<T extends HasSanitizeBody<any, any>> = ReturnType<
  T['sanitizeBody']
>;

type PreAuthorizeContextIn<T extends HasPreAuthorize<any, any>> = Parameters<
  T['preAuthorize']
>[0];
type PreAuthorizeContextOut<T extends HasPreAuthorize<any, any>> = ReturnType<
  T['preAuthorize']
>;
type PreAuthorizeContextOutObjectCase<
  T extends HasPreAuthorize<any, any>
> = ReturnType<T['preAuthorize']>;
type PreAuthorizeContextOutFalseCase<
  T extends HasPreAuthorize<any, any>
> = false & ReturnType<T['preAuthorize']>;

type AttachDataIn<T extends HasAttachData<any, any>> = Parameters<
  T['attachData']
>[0];
type AttachDataOut<T extends HasAttachData<any, any>> = PromiseResolveOrSync<
  ReturnType<T['attachData']>
>;

type FinalAuthorizeContextIn<
  T extends HasFinalAuthorize<any, any>
> = Parameters<T['finalAuthorize']>[0];
type FinalAuthorizeContextOut<
  T extends HasFinalAuthorize<any, any>
> = PromiseResolveOrSync<ReturnType<T['finalAuthorize']>>;
type FinalAuthorizeContextOutObjectCase<
  T extends HasFinalAuthorize<any, any>
> = object & PromiseResolveOrSync<ReturnType<T['finalAuthorize']>>;
type FinalAuthorizeContextOutFalseCase<
  T extends HasFinalAuthorize<any, any>
> = false & PromiseResolveOrSync<ReturnType<T['finalAuthorize']>>;

type DoWorkContextIn<T extends HasDoWork<any, any>> = Parameters<
  T['doWork']
>[0];
type DoWorkContextOut<T extends HasDoWork<any, any>> = PromiseResolveOrSync<
  ReturnType<T['doWork']>
>;
type DoWorkContextOutObjectCase<T extends HasDoWork<any, any>> = object &
  PromiseResolveOrSync<ReturnType<T['doWork']>>;

type RespondContextIn<T extends HasRespond<any, any>> = Parameters<
  T['respond']
>[0];
type RespondContextOut<T extends HasRespond<any, any>> = ReturnType<
  T['respond']
>;

type SanitizeResponseContextIn<
  T extends HasSanitizeResponse<any, any>
> = Parameters<T['sanitizeResponse']>[0];
type SanitizeResponseContextOut<
  T extends HasSanitizeResponse<any, any>
> = ReturnType<T['sanitizeResponse']>;

// @note must wrap types with arrays to avoid distribution over naked type conditionals blowing up exponentially - see
// https://github.com/Microsoft/TypeScript/issues/29368#issuecomment-453529532
type PipedPreContext<TLeft, TRight> = [TLeft] extends [
  HasInitPreContext<any, any>
]
  ? [TRight] extends [HasInitPreContext<any, any>]
    ? HasInitPreContext<
        InitPreContextIn<TLeft> &
          Omit<InitPreContextIn<TRight>, keyof InitPreContextOut<TLeft>>,
        InitPreContextOut<TRight> &
          Omit<InitPreContextOut<TLeft>, keyof InitPreContextOut<TRight>>
      >
    : { initPreContext: TLeft['initPreContext'] }
  : [TRight] extends [HasInitPreContext<any, any>]
  ? { initPreContext: TRight['initPreContext'] }
  : {};

// @note must wrap types with arrays to avoid distribution over naked type conditionals blowing up exponentially - see
// https://github.com/Microsoft/TypeScript/issues/29368#issuecomment-453529532
type PipedSanitizeParams<TLeft, TRight> = [TLeft] extends [
  HasSanitizeParams<any, any>
]
  ? [TRight] extends [HasSanitizeParams<any, any>]
    ? HasSanitizeParams<
        SanitizeParamsContextIn<TLeft>,
        SanitizeParamsContextOut<TRight>
      >
    : { sanitizeParams: TLeft['sanitizeParams'] }
  : [TRight] extends [HasSanitizeParams<any, any>]
  ? { sanitizeParams: TRight['sanitizeParams'] }
  : {};

// @note must wrap types with arrays to avoid distribution over naked type conditionals blowing up exponentially - see
// https://github.com/Microsoft/TypeScript/issues/29368#issuecomment-453529532
type PipedSanitizeBody<TLeft, TRight> = [TLeft] extends [
  HasSanitizeBody<any, any>
]
  ? [TRight] extends [HasSanitizeBody<any, any>]
    ? HasSanitizeBody<
        SanitizeBodyContextIn<TLeft>,
        SanitizeBodyContextOut<TRight>
      >
    : { sanitizeBody: TLeft['sanitizeBody'] }
  : [TRight] extends [HasSanitizeBody<any, any>]
  ? { sanitizeBody: TRight['sanitizeBody'] }
  : {};

// @note must wrap types with arrays to avoid distribution over naked type conditionals blowing up exponentially - see
// https://github.com/Microsoft/TypeScript/issues/29368#issuecomment-453529532
type PipedPreAuthorize<TLeft, TRight> = [TLeft] extends [
  HasPreAuthorize<any, any>
]
  ? [TRight] extends [HasPreAuthorize<any, any>]
    ? HasPreAuthorize<
        PreAuthorizeContextIn<TLeft> &
          Omit<
            PreAuthorizeContextIn<TRight>,
            PreAuthorizeContextOut<TLeft> extends boolean
              ? keyof {}
              : keyof PreAuthorizeContextOut<TLeft>
          >,
        PreAuthorizeContextOut<TLeft> extends boolean
          ? PreAuthorizeContextOut<TRight> extends boolean
            ? boolean // BOTH left AND right have preAuthorize that returns ONLY booleans - never objects
            :
                | PreAuthorizeContextOutObjectCase<TRight> // left's preAuthorize returns ONLY booleans but right's might return objects
                | (PreAuthorizeContextOutFalseCase<TLeft> & false)
                | (PreAuthorizeContextOutFalseCase<TRight> & false)
          : PreAuthorizeContextOut<TRight> extends boolean
          ?
              | PreAuthorizeContextOutObjectCase<TLeft> // right's preAuthorize returns ONLY booleans but left's might return objects
              | (PreAuthorizeContextOutFalseCase<TLeft> & false)
              | (PreAuthorizeContextOutFalseCase<TRight> & false)
          :
              | (PreAuthorizeContextOutObjectCase<TRight> & // NEITHER left NOR right's preAuthorize return strictly boolean - so both might return objects
                  Omit<
                    PreAuthorizeContextOutObjectCase<TLeft>,
                    keyof PreAuthorizeContextOutObjectCase<TRight>
                  >)
              | (PreAuthorizeContextOutFalseCase<TLeft> & false)
              | (PreAuthorizeContextOutFalseCase<TRight> & false)
      >
    : { preAuthorize: TLeft['preAuthorize'] }
  : [TRight] extends [HasPreAuthorize<any, any>]
  ? { preAuthorize: TRight['preAuthorize'] }
  : {};

// @note must wrap types with arrays to avoid distribution over naked type conditionals blowing up exponentially - see
// https://github.com/Microsoft/TypeScript/issues/29368#issuecomment-453529532
type PipedAttachData<TLeft, TRight> = [TLeft] extends [HasAttachData<any, any>]
  ? [TRight] extends [HasAttachData<any, any>]
    ? HasAttachData<
        AttachDataIn<TLeft> &
          Omit<AttachDataIn<TRight>, keyof AttachDataOut<TLeft>>,
        AttachDataOut<TRight> &
          Omit<AttachDataOut<TLeft>, keyof AttachDataOut<TRight>>
      >
    : { attachData: TLeft['attachData'] }
  : [TRight] extends [HasAttachData<any, any>]
  ? { attachData: TRight['attachData'] }
  : {};

// @note must wrap types with arrays to avoid distribution over naked type conditionals blowing up exponentially - see
// https://github.com/Microsoft/TypeScript/issues/29368#issuecomment-453529532
type PipedFinalAuthorize<TLeft, TRight> = [TLeft] extends [
  HasFinalAuthorize<any, any>
]
  ? [TRight] extends [HasFinalAuthorize<any, any>]
    ? HasFinalAuthorize<
        FinalAuthorizeContextIn<TLeft> &
          Omit<
            FinalAuthorizeContextIn<TRight>,
            FinalAuthorizeContextOut<TLeft> extends boolean
              ? keyof {}
              : keyof FinalAuthorizeContextOut<TLeft>
          >,
        FinalAuthorizeContextOut<TLeft> extends boolean
          ? FinalAuthorizeContextOut<TRight> extends boolean
            ? boolean // BOTH left AND right have finalAuthorize that returns ONLY booleans - never objects
            :
                | FinalAuthorizeContextOutObjectCase<TRight> // left's finalAuthorize returns ONLY booleans but right's might return objects
                | (FinalAuthorizeContextOutFalseCase<TLeft> & false)
                | (FinalAuthorizeContextOutFalseCase<TRight> & false)
          : FinalAuthorizeContextOut<TRight> extends boolean
          ?
              | FinalAuthorizeContextOutObjectCase<TLeft> // right's finalAuthorize returns ONLY booleans but left's might return objects
              | (FinalAuthorizeContextOutFalseCase<TLeft> & false)
              | (FinalAuthorizeContextOutFalseCase<TRight> & false)
          :
              | (FinalAuthorizeContextOutObjectCase<TRight> & // NEITHER left NOR right's finalAuthorize return strictly boolean - so both might return objects
                  Omit<
                    FinalAuthorizeContextOutObjectCase<TLeft>,
                    keyof FinalAuthorizeContextOutObjectCase<TRight>
                  >)
              | (FinalAuthorizeContextOutFalseCase<TLeft> & false)
              | (FinalAuthorizeContextOutFalseCase<TRight> & false)
      >
    : { finalAuthorize: TLeft['finalAuthorize'] }
  : [TRight] extends [HasFinalAuthorize<any, any>]
  ? { finalAuthorize: TRight['finalAuthorize'] }
  : {};

// @note must wrap types with arrays to avoid distribution over naked type conditionals blowing up exponentially - see
// https://github.com/Microsoft/TypeScript/issues/29368#issuecomment-453529532
type PipedDoWork<TLeft, TRight> = [TLeft] extends [HasDoWork<any, any>]
  ? [TRight] extends [HasDoWork<any, any>]
    ? HasDoWork<
        DoWorkContextIn<TLeft> &
          Omit<
            DoWorkContextIn<TRight>,
            DoWorkContextOut<TLeft> extends void
              ? keyof {}
              : keyof DoWorkContextOut<TLeft>
          >,
        DoWorkContextOut<TLeft> extends void
          ? DoWorkContextOut<TRight> extends void
            ? void // BOTH left AND right have doWork that returns ONLY void - never objects
            : DoWorkContextOutObjectCase<TRight> // left's doWork returns ONLY void but right's might return objects
          : DoWorkContextOut<TRight> extends void
          ? DoWorkContextOutObjectCase<TLeft> // right's doWork returns ONLY void but left's might return objects
          : DoWorkContextOutObjectCase<TRight> & // NEITHER left NOR right's doWork return void - so both might return objects
              Omit<
                DoWorkContextOutObjectCase<TLeft>,
                keyof DoWorkContextOutObjectCase<TRight>
              >
      >
    : { doWork: TLeft['doWork'] }
  : [TRight] extends [HasDoWork<any, any>]
  ? { doWork: TRight['doWork'] }
  : {};

// @note must wrap types with arrays to avoid distribution over naked type conditionals blowing up exponentially - see
// https://github.com/Microsoft/TypeScript/issues/29368#issuecomment-453529532
type PipedRespond<TLeft, TRight> = [TLeft] extends [HasRespond<any, any>]
  ? [TRight] extends [HasRespond<any, any>]
    ? HasRespond<RespondContextIn<TLeft>, RespondContextOut<TRight>>
    : { respond: TLeft['respond'] }
  : [TRight] extends [HasRespond<any, any>]
  ? { respond: TRight['respond'] }
  : {};

// @note must wrap types with arrays to avoid distribution over naked type conditionals blowing up exponentially - see
// https://github.com/Microsoft/TypeScript/issues/29368#issuecomment-453529532
type PipedSanitizeResponse<TLeft, TRight> = [TLeft] extends [
  HasSanitizeResponse<any, any>
]
  ? [TRight] extends [HasSanitizeResponse<any, any>]
    ? HasSanitizeResponse<
        SanitizeResponseContextIn<TLeft>,
        SanitizeResponseContextOut<TRight>
      >
    : { sanitizeResponse: TLeft['sanitizeResponse'] }
  : [TRight] extends [HasSanitizeResponse<any, any>]
  ? { sanitizeResponse: TRight['sanitizeResponse'] }
  : {};

type ClashlessInitPreContext<TLeft, TRight> = OptionallyHasInitPreContext<
  any,
  TRight extends HasInitPreContext<any, any>
    ? Pick<
        Parameters<TRight['initPreContext']>[0],
        keyof ReturnType<
          TLeft extends HasInitPreContext<any, any>
            ? TLeft['initPreContext']
            : () => {}
        >
      >
    : any
>;

type ClashlessSanitizeParams<TLeft, TRight> = OptionallyHasSanitizeParams<
  any,
  TRight extends HasSanitizeParams<any, any>
    ? Parameters<TRight['sanitizeParams']>[0]
    : any
>;

type ClashlessSanitizeBody<TLeft, TRight> = OptionallyHasSanitizeBody<
  any,
  TRight extends HasSanitizeBody<any, any>
    ? Parameters<TRight['sanitizeBody']>[0]
    : any
>;

type ClashlessPreAuthorize<TLeft, TRight> = MightHavePreAuthorize<
  any,
  | boolean
  | (TRight extends HasPreAuthorize<any, any>
      ? Pick<
          Parameters<TRight['preAuthorize']>[0],
          keyof ReturnType<
            TLeft extends HasPreAuthorize<any, any>
              ? TLeft['preAuthorize']
              : () => {}
          >
        >
      : any)
>;

type ClashlessAttachData<TLeft, TRight> = OptionallyHasAttachData<
  any,
  TRight extends HasAttachData<any, any>
    ? Pick<
        Parameters<TRight['attachData']>[0],
        keyof PromiseResolveOrSync<
          ReturnType<
            TLeft extends HasAttachData<any, any>
              ? TLeft['attachData']
              : () => {}
          >
        >
      >
    : any
>;

type ClashlessFinalAuthorize<TLeft, TRight> = MightHaveFinalAuthorize<
  any,
  | boolean
  | (TRight extends HasFinalAuthorize<any, any>
      ? Pick<
          Parameters<TRight['finalAuthorize']>[0],
          keyof PromiseResolveOrSync<
            ReturnType<
              TLeft extends HasFinalAuthorize<any, any>
                ? TLeft['finalAuthorize']
                : () => {}
            >
          >
        >
      : any)
>;

type ClashlessDoWork<TLeft, TRight> = OptionallyHasDoWork<
  any,
  | void
  | (TRight extends HasDoWork<any, any>
      ? Pick<
          Parameters<TRight['doWork']>[0],
          keyof PromiseResolveOrSync<
            ReturnType<
              TLeft extends HasDoWork<any, any> ? TLeft['doWork'] : () => {}
            >
          >
        >
      : any)
>;

type ClashlessRespond<TLeft, TRight> = MightHaveRespond<
  any,
  TRight extends HasRespond<any, any> ? Parameters<TRight['respond']>[0] : any
>;

type ClashlessSanitizeResponse<TLeft, TRight> = MightHaveSanitizeResponse<
  any,
  TRight extends HasSanitizeResponse<any, any>
    ? Parameters<TRight['sanitizeResponse']>[0]
    : any
>;

// no parameter - returns empty object
export function HTPipe(): {};

// one parameter - returns a new object with all the valid lifecycle stages of the parameter
export function HTPipe<
  T extends OptionallyHasInitPreContext<any, any> &
    OptionallyHasSanitizeParams<any, any> &
    OptionallyHasSanitizeBody<any, any> &
    MightHavePreAuthorize<any, any> &
    OptionallyHasAttachData<any, any> &
    MightHaveFinalAuthorize<any, any> &
    OptionallyHasDoWork<any, any> &
    MightHaveRespond<any, any> &
    MightHaveSanitizeResponse<any, any>
  // @fixme: refactor - export a union type in types.ts for this
>(
  obj: T
): Pick<
  T,
  | 'initPreContext'
  | 'sanitizeParams'
  | 'sanitizeBody'
  | 'preAuthorize'
  | 'attachData'
  | 'finalAuthorize'
  | 'doWork'
  | 'respond'
  | 'sanitizeResponse'
>;

// two parameters with automatic type guessing or right - all or nothing!
// @todo: add the ability for each stage to get outputs of previous stages too!
export function HTPipe<
  TLeft extends OptionallyHasInitPreContext<any, any> &
    OptionallyHasSanitizeParams<any, any> &
    OptionallyHasSanitizeBody<any, any> &
    MightHavePreAuthorize<any, any> &
    OptionallyHasAttachData<any, any> &
    MightHaveFinalAuthorize<any, any> &
    OptionallyHasDoWork<any, any> &
    MightHaveRespond<any, any> &
    MightHaveSanitizeResponse<any, any>,
  TRight extends (TLeft extends HasInitPreContext<any, any>
    ? OptionallyHasInitPreContext<ReturnType<TLeft['initPreContext']>, any>
    : {}) &
    (TLeft extends HasSanitizeParams<any, any>
      ? OptionallyHasSanitizeParams<ReturnType<TLeft['sanitizeParams']>, any>
      : {}) &
    (TLeft extends HasSanitizeBody<any, any>
      ? OptionallyHasSanitizeBody<ReturnType<TLeft['sanitizeBody']>, any>
      : {}) &
    (TLeft extends HasPreAuthorize<any, any>
      ? MightHavePreAuthorize<ReturnType<TLeft['preAuthorize']>, any>
      : {}) &
    (TLeft extends HasAttachData<any, any>
      ? OptionallyHasAttachData<
          PromiseResolveOrSync<ReturnType<TLeft['attachData']>>,
          any
        >
      : {}) &
    (TLeft extends HasFinalAuthorize<any, any>
      ? MightHaveFinalAuthorize<
          PromiseResolveOrSync<ReturnType<TLeft['finalAuthorize']>>,
          any
        >
      : {}) &
    (TLeft extends HasDoWork<any, any>
      ? OptionallyHasDoWork<
          PromiseResolveOrSync<ReturnType<TLeft['doWork']>>,
          any
        >
      : {}) &
    (TLeft extends HasRespond<any, any>
      ? MightHaveRespond<ReturnType<TLeft['respond']>, any>
      : {}) &
    (TLeft extends HasSanitizeResponse<any, any>
      ? MightHaveSanitizeResponse<ReturnType<TLeft['sanitizeResponse']>, any>
      : {})
>(
  left: TLeft,
  right: TRight
): PipedPreContext<TLeft, TRight> &
  PipedSanitizeParams<TLeft, TRight> &
  PipedSanitizeBody<TLeft, TRight> &
  PipedPreAuthorize<TLeft, TRight> &
  PipedAttachData<TLeft, TRight> &
  PipedFinalAuthorize<TLeft, TRight> &
  PipedDoWork<TLeft, TRight> &
  PipedRespond<TLeft, TRight> &
  PipedSanitizeResponse<TLeft, TRight>;

// two parameters with possibly added inputs
export function HTPipe<
  TLeft extends ClashlessInitPreContext<TLeft, TRight> &
    ClashlessSanitizeParams<TLeft, TRight> &
    ClashlessSanitizeBody<TLeft, TRight> &
    ClashlessPreAuthorize<TLeft, TRight> &
    ClashlessAttachData<TLeft, TRight> &
    ClashlessFinalAuthorize<TLeft, TRight> &
    ClashlessDoWork<TLeft, TRight> &
    ClashlessRespond<TLeft, TRight> &
    ClashlessSanitizeResponse<TLeft, TRight>,
  TRight extends OptionallyHasInitPreContext<any, any> &
    OptionallyHasSanitizeParams<any, any> &
    OptionallyHasSanitizeBody<any, any> &
    MightHavePreAuthorize<any, any> &
    OptionallyHasAttachData<any, any> &
    MightHaveFinalAuthorize<any, any> &
    OptionallyHasDoWork<any, any> &
    MightHaveRespond<any, any> &
    MightHaveSanitizeResponse<any, any>
>(
  left: TLeft,
  right: TRight
): PipedPreContext<TLeft, TRight> &
  PipedSanitizeParams<TLeft, TRight> &
  PipedSanitizeBody<TLeft, TRight> &
  PipedPreAuthorize<TLeft, TRight> &
  PipedAttachData<TLeft, TRight> &
  PipedFinalAuthorize<TLeft, TRight> &
  PipedDoWork<TLeft, TRight> &
  PipedRespond<TLeft, TRight> &
  PipedSanitizeResponse<TLeft, TRight>;

// three parameters with possibly added inputs
export function HTPipe<
  T3 extends ClashlessInitPreContext<T3, PipedPreContext<T2, T1>> &
    ClashlessSanitizeParams<T3, PipedSanitizeParams<T2, T1>> &
    ClashlessSanitizeBody<T3, PipedSanitizeBody<T2, T1>> &
    ClashlessPreAuthorize<T3, PipedPreAuthorize<T2, T1>> &
    ClashlessAttachData<T3, PipedAttachData<T2, T1>> &
    ClashlessFinalAuthorize<T3, PipedFinalAuthorize<T2, T1>> &
    ClashlessDoWork<T3, PipedDoWork<T2, T1>> &
    ClashlessRespond<T3, PipedRespond<T2, T1>> &
    ClashlessSanitizeResponse<T3, PipedSanitizeResponse<T2, T1>>,
  T2 extends ClashlessInitPreContext<T2, T1> &
    ClashlessSanitizeParams<T2, T1> &
    ClashlessSanitizeBody<T2, T1> &
    ClashlessPreAuthorize<T2, T1> &
    ClashlessAttachData<T2, T1> &
    ClashlessFinalAuthorize<T2, T1> &
    ClashlessDoWork<T2, T1> &
    ClashlessRespond<T2, T1> &
    ClashlessSanitizeResponse<T2, T1>,
  T1 extends OptionallyHasInitPreContext<any, any> &
    OptionallyHasSanitizeParams<any, any> &
    OptionallyHasSanitizeBody<any, any> &
    MightHavePreAuthorize<any, any> &
    OptionallyHasAttachData<any, any> &
    MightHaveFinalAuthorize<any, any> &
    OptionallyHasDoWork<any, any> &
    MightHaveRespond<any, any> &
    MightHaveSanitizeResponse<any, any>
>(
  obj3: T3,
  obj2: T2,
  obj1: T1
): PipedPreContext<T3, PipedPreContext<T2, T1>> &
  PipedSanitizeParams<T3, PipedSanitizeParams<T2, T1>> &
  PipedSanitizeBody<T3, PipedSanitizeBody<T2, T1>> &
  PipedPreAuthorize<T3, PipedPreAuthorize<T2, T1>> &
  PipedAttachData<T3, PipedAttachData<T2, T1>> &
  PipedFinalAuthorize<T3, PipedFinalAuthorize<T2, T1>> &
  PipedDoWork<T3, PipedDoWork<T2, T1>> &
  PipedRespond<T3, PipedRespond<T2, T1>> &
  PipedSanitizeResponse<T3, PipedSanitizeResponse<T2, T1>>;

// four parameters with possibly added inputs
export function HTPipe<
  T4 extends ClashlessInitPreContext<
    T4,
    PipedPreContext<T3, PipedPreContext<T2, T1>>
  > &
    ClashlessSanitizeParams<
      T4,
      PipedSanitizeParams<T3, PipedSanitizeParams<T2, T1>>
    > &
    ClashlessSanitizeBody<
      T4,
      PipedSanitizeBody<T3, PipedSanitizeBody<T2, T1>>
    > &
    ClashlessPreAuthorize<
      T4,
      PipedPreAuthorize<T3, PipedPreAuthorize<T2, T1>>
    > &
    ClashlessAttachData<T4, PipedAttachData<T3, PipedAttachData<T2, T1>>> &
    ClashlessFinalAuthorize<
      T4,
      PipedFinalAuthorize<T3, PipedFinalAuthorize<T2, T1>>
    > &
    ClashlessDoWork<T4, PipedDoWork<T3, PipedDoWork<T2, T1>>> &
    ClashlessRespond<T4, PipedRespond<T3, PipedRespond<T2, T1>>> &
    ClashlessSanitizeResponse<
      T4,
      PipedSanitizeResponse<T3, PipedSanitizeResponse<T2, T1>>
    >,
  T3 extends ClashlessInitPreContext<T3, PipedPreContext<T2, T1>> &
    ClashlessSanitizeParams<T3, PipedSanitizeParams<T2, T1>> &
    ClashlessSanitizeBody<T3, PipedSanitizeBody<T2, T1>> &
    ClashlessPreAuthorize<T3, PipedPreAuthorize<T2, T1>> &
    ClashlessAttachData<T3, PipedAttachData<T2, T1>> &
    ClashlessFinalAuthorize<T3, PipedFinalAuthorize<T2, T1>> &
    ClashlessDoWork<T3, PipedDoWork<T2, T1>> &
    ClashlessRespond<T3, PipedRespond<T2, T1>> &
    ClashlessSanitizeResponse<T3, PipedSanitizeResponse<T2, T1>>,
  T2 extends ClashlessInitPreContext<T2, T1> &
    ClashlessSanitizeParams<T2, T1> &
    ClashlessSanitizeBody<T2, T1> &
    ClashlessPreAuthorize<T2, T1> &
    ClashlessAttachData<T2, T1> &
    ClashlessFinalAuthorize<T2, T1> &
    ClashlessDoWork<T2, T1> &
    ClashlessRespond<T2, T1> &
    ClashlessSanitizeResponse<T2, T1>,
  T1 extends OptionallyHasInitPreContext<any, any> &
    OptionallyHasSanitizeParams<any, any> &
    OptionallyHasSanitizeBody<any, any> &
    MightHavePreAuthorize<any, any> &
    OptionallyHasAttachData<any, any> &
    MightHaveFinalAuthorize<any, any> &
    OptionallyHasDoWork<any, any> &
    MightHaveRespond<any, any> &
    MightHaveSanitizeResponse<any, any>
>(
  obj4: T4,
  obj3: T3,
  obj2: T2,
  obj1: T1
): PipedPreContext<T4, PipedPreContext<T3, PipedPreContext<T2, T1>>> &
  PipedSanitizeParams<
    T4,
    PipedSanitizeParams<T3, PipedSanitizeParams<T2, T1>>
  > &
  PipedSanitizeBody<T4, PipedSanitizeBody<T3, PipedSanitizeBody<T2, T1>>> &
  PipedPreAuthorize<T4, PipedPreAuthorize<T3, PipedPreAuthorize<T2, T1>>> &
  PipedAttachData<T4, PipedAttachData<T3, PipedAttachData<T2, T1>>> &
  PipedFinalAuthorize<
    T4,
    PipedFinalAuthorize<T3, PipedFinalAuthorize<T2, T1>>
  > &
  PipedDoWork<T4, PipedDoWork<T3, PipedDoWork<T2, T1>>> &
  PipedRespond<T4, PipedRespond<T3, PipedRespond<T2, T1>>> &
  PipedSanitizeResponse<
    T4,
    PipedSanitizeResponse<T3, PipedSanitizeResponse<T2, T1>>
  >;

export function HTPipe(...objs: any[]) {
  if (objs.length === 0) {
    return {};
  }
  if (objs.length === 1) {
    // @todo: consider removing this explicitness and repetition by calling HTPipe(obj[0], {}) instead
    return {
      initPreContext: objs[0].initPreContext,
      attachData: objs[0].attachData,
    };
  }
  if (objs.length === 2) {
    const left = objs[0];
    const right = objs[1];
    return {
      ...((isHasInitPreContext(left) && isHasInitPreContext(right)
        ? {
            initPreContext: (context: any) => {
              const leftOut = left.initPreContext(context) || {};
              const rightIn = {
                ...context,
                // ...leftOut,
                ...(leftOut as {}),
              };
              const rightOut = right.initPreContext(rightIn) || {};
              return {
                // ...leftOut,
                ...(leftOut as {}),
                // ...rightOut
                ...(rightOut as {}),
              };
            },
          }
        : isHasInitPreContext(left)
        ? { initPreContext: left.initPreContext }
        : isHasInitPreContext(right)
        ? { initPreContext: right.initPreContext }
        : {}) as PipedPreContext<any, any>),
      ...((isHasSanitizeParams(left) && isHasSanitizeParams(right)
        ? {
            sanitizeParams: (context: any) => {
              const leftOut = left.sanitizeParams(context) || {};
              const rightIn = leftOut;
              const rightOut = right.sanitizeParams(rightIn) || {};
              return rightOut as {};
            },
          }
        : isHasSanitizeParams(left)
        ? { sanitizeParams: left.sanitizeParams }
        : isHasSanitizeParams(right)
        ? { sanitizeParams: right.sanitizeParams }
        : {}) as PipedSanitizeParams<any, any>),
      ...((isHasSanitizeBody(left) && isHasSanitizeBody(right)
        ? {
            sanitizeBody: (context: any) => {
              const leftOut = left.sanitizeBody(context) || {};
              const rightIn = leftOut;
              const rightOut = right.sanitizeBody(rightIn) || {};
              return rightOut as {};
            },
          }
        : isHasSanitizeBody(left)
        ? { sanitizeBody: left.sanitizeBody }
        : isHasSanitizeBody(right)
        ? { sanitizeBody: right.sanitizeBody }
        : {}) as PipedSanitizeBody<any, any>),
      ...((isHasPreAuthorize(left) && isHasPreAuthorize(right)
        ? {
            preAuthorize: (context: any) => {
              const leftOut = left.preAuthorize(context);
              const leftPassed = authorizationPassed(
                leftOut as boolean | object
              );
              if (!leftPassed) {
                return false;
              }
              const leftContextOut =
                leftOut === true ? {} : (leftOut as object);
              const rightIn = {
                ...context,
                ...leftContextOut,
              };
              const rightOut = right.preAuthorize(rightIn);
              const rightPassed = authorizationPassed(
                rightOut as boolean | object
              );
              if (!rightPassed) {
                return false;
              }
              if (leftOut === true && rightOut === true) {
                return true;
              }
              const rightContextOut =
                rightOut === true ? {} : (rightOut as object);
              return {
                ...leftContextOut,
                ...rightContextOut,
              };
            },
          }
        : isHasPreAuthorize(left)
        ? { preAuthorize: left.preAuthorize }
        : isHasPreAuthorize(right)
        ? { preAuthorize: right.preAuthorize }
        : {}) as PipedPreAuthorize<any, any>),
      ...((isHasAttachData(left) && isHasAttachData(right)
        ? {
            attachData: async (context: any) => {
              const leftOut =
                (await Promise.resolve(left.attachData(context))) || {};
              const rightIn = {
                ...context,
                // ...leftOut
                ...(leftOut as {}),
              };
              const rightOut =
                (await Promise.resolve(right.attachData(rightIn))) || {};
              return {
                // ...leftOut,
                ...(leftOut as {}),
                // ...rightOut
                ...(rightOut as {}),
              };
            },
          }
        : isHasAttachData(left)
        ? { attachData: left.attachData }
        : isHasAttachData(right)
        ? { attachData: right.attachData }
        : {}) as PipedAttachData<any, any>),
      ...((isHasFinalAuthorize(left) && isHasFinalAuthorize(right)
        ? {
            finalAuthorize: async (context: any) => {
              const leftOut = await Promise.resolve(
                left.finalAuthorize(context)
              );
              const leftPassed = authorizationPassed(
                leftOut as boolean | object
              );
              if (!leftPassed) {
                return false;
              }
              const leftContextOut =
                leftOut === true ? {} : (leftOut as object);
              const rightIn = {
                ...context,
                ...leftContextOut,
              };
              const rightOut = await Promise.resolve(
                right.finalAuthorize(rightIn)
              );
              const rightPassed = authorizationPassed(
                rightOut as boolean | object
              );
              if (!rightPassed) {
                return false;
              }
              if (leftOut === true && rightOut === true) {
                return true;
              }
              const rightContextOut =
                rightOut === true ? {} : (rightOut as object);
              return {
                ...leftContextOut,
                ...rightContextOut,
              };
            },
          }
        : isHasFinalAuthorize(left)
        ? { finalAuthorize: left.finalAuthorize }
        : isHasFinalAuthorize(right)
        ? { finalAuthorize: right.finalAuthorize }
        : {}) as PipedFinalAuthorize<any, any>),
      ...((isHasDoWork(left) && isHasDoWork(right)
        ? {
            doWork: async (context: any) => {
              const leftOut =
                (await Promise.resolve(left.doWork(context))) || {};
              const rightIn = {
                ...context,
                ...(leftOut as object),
              };
              const rightOut =
                (await Promise.resolve(right.doWork(rightIn))) || {};
              return { ...(leftOut as object), ...(rightOut as object) };
            },
          }
        : isHasDoWork(left)
        ? { doWork: left.doWork }
        : isHasDoWork(right)
        ? { doWork: right.doWork }
        : {}) as PipedDoWork<any, any>),
      ...((isHasRespond(left) && isHasRespond(right)
        ? {
            respond: (context: any) => {
              const leftOut = left.respond(context);
              const rightOut = right.respond(leftOut.unsafeResponse);
              return {
                unsafeResponse: rightOut.unsafeResponse,
                status:
                  rightOut.status === undefined
                    ? leftOut.status
                    : rightOut.status,
              };
            },
          }
        : isHasRespond(left)
        ? { respond: left.respond }
        : isHasRespond(right)
        ? { respond: right.respond }
        : {}) as PipedRespond<any, any>),
      ...((isHasSanitizeResponse(left) && isHasSanitizeResponse(right)
        ? {
            sanitizeResponse: (context: any) => {
              const leftOut = left.sanitizeResponse(context) || {};
              const rightOut = right.sanitizeResponse(leftOut) || {};
              return rightOut;
            },
          }
        : isHasSanitizeResponse(left)
        ? { sanitizeResponse: left.sanitizeResponse }
        : isHasSanitizeResponse(right)
        ? { sanitizeResponse: right.sanitizeResponse }
        : {}) as PipedSanitizeResponse<any, any>),
    };
  }

  return objs.reduce((prev: any, curr: any) => HTPipe(prev, curr), {});
}

// left has attachData AND right has attachData AND left's return keys that exist in right's parameters are assignable to right's correspondingly
export function HTPipeAttachData<
  TLeft extends HasAttachData<
    any,
    TRight extends HasAttachData<any, any>
      ? Pick<
          Parameters<TRight['attachData']>[0],
          keyof PromiseResolveOrSync<
            ReturnType<
              TLeft extends HasAttachData<any, any>
                ? TLeft['attachData']
                : () => {}
            >
          >
        >
      : any
  >,
  TRight extends HasAttachData<any, any>,
  TContextInLeft extends Parameters<TLeft['attachData']>[0],
  TContextInRight extends Parameters<TRight['attachData']>[0],
  TContextOutLeft extends PromiseResolveOrSync<ReturnType<TLeft['attachData']>>,
  TContextOutRight extends PromiseResolveOrSync<
    ReturnType<TRight['attachData']>
  >
>(
  left: TLeft,
  right: TRight
): HasAttachData<
  TContextInLeft & Omit<TContextInRight, keyof TContextOutLeft>,
  TContextOutRight & Omit<TContextOutLeft, keyof TContextOutRight>
>;

// left has attachData and right does not
// if right has attachData, left's return keys that exist in right's parameters must be assignable to right's correspondingly
// this conditional type is necessary to disqualify left-and-right cases that fell through the first overload because of the type incompatibility so they aren't grouped in with the left-only cases
export function HTPipeAttachData<
  TLeft extends HasAttachData<
    any,
    TRight extends HasAttachData<any, any>
      ? Pick<
          Parameters<TRight['attachData']>[0],
          keyof PromiseResolveOrSync<
            ReturnType<
              TLeft extends HasAttachData<any, any>
                ? TLeft['attachData']
                : () => {}
            >
          >
        >
      : any
  >,
  TRight extends OptionallyHasAttachData<any, any>,
  TContextInLeft extends Parameters<TLeft['attachData']>[0],
  TContextOutLeft extends PromiseResolveOrSync<ReturnType<TLeft['attachData']>>
>(left: TLeft, right: TRight): HasAttachData<TContextInLeft, TContextOutLeft>;

// right has attachData and left does not
// this conditional type is necessary to disqualify left-and-right cases that fell through the first overload because of the type incompatibility so they aren't grouped in with the right-only cases
export function HTPipeAttachData<
  TLeft extends OptionallyHasAttachData<
    any,
    TRight extends HasAttachData<any, any>
      ? Pick<
          Parameters<TRight['attachData']>[0],
          keyof PromiseResolveOrSync<
            ReturnType<
              TLeft extends HasAttachData<any, any>
                ? TLeft['attachData']
                : () => {}
            >
          >
        >
      : any
  >,
  TRight extends HasAttachData<any, any>,
  TContextInRight extends Parameters<TRight['attachData']>[0],
  TContextOutRight extends PromiseResolveOrSync<
    ReturnType<TRight['attachData']>
  >
>(left: TLeft, right: TRight): HasAttachData<TContextInRight, TContextOutRight>;

// right and left doesn't have attachData
// this conditional type is necessary to disqualify left-and-right cases that fell through the first overload because of the type incompatibility so they aren't grouped in with the right-only cases
export function HTPipeAttachData<
  TLeft extends OptionallyHasAttachData<
    any,
    TRight extends HasAttachData<any, any>
      ? Pick<
          Parameters<TRight['attachData']>[0],
          keyof PromiseResolveOrSync<
            ReturnType<
              TLeft extends HasAttachData<any, any>
                ? TLeft['attachData']
                : () => {}
            >
          >
        >
      : any
  >,
  TRight extends OptionallyHasAttachData<any, any>
>(left: TLeft, right: TRight): {};

// main function
export function HTPipeAttachData<
  TLeft extends OptionallyHasAttachData<any, any>,
  TRight extends OptionallyHasAttachData<any, any>,
  TContextInLeft extends TLeft extends HasAttachData<any, any>
    ? Parameters<TLeft['attachData']>[0]
    : never,
  TContextInRight extends TRight extends HasAttachData<any, any>
    ? Parameters<TRight['attachData']>[0]
    : never,
  TContextOutLeft extends TLeft extends HasAttachData<any, any>
    ? PromiseResolveOrSync<ReturnType<TLeft['attachData']>>
    : never,
  TContextOutRight extends TRight extends HasAttachData<any, any>
    ? PromiseResolveOrSync<ReturnType<TRight['attachData']>>
    : never
>(left: TLeft, right: TRight) {
  if (isHasAttachData(left) && isHasAttachData(right)) {
    return {
      attachData: async (
        context: TContextOutLeft extends TContextInRight
          ? TContextInLeft
          : TContextInRight & TContextInLeft
      ) => {
        const leftOut = (await Promise.resolve(left.attachData(context))) || {};
        const rightIn = {
          ...context,
          ...leftOut,
        };
        const rightOut =
          (await Promise.resolve(right.attachData(rightIn))) || {};
        return { ...leftOut, ...rightOut };
      },
    };
  } else if (isHasAttachData(left)) {
    // return { attachData: (context: TContextInLeft) => left.attachData(context) };
    return { attachData: left.attachData };
  } else if (isHasAttachData(right)) {
    // return { attachData: (context: TContextInRight) => right.attachData(context) };
    return { attachData: right.attachData };
  } else {
    return {};
  }
}

function authorizationPassed<TAuthOut extends boolean | object>(
  authOut: TAuthOut
) {
  return (
    authOut === true ||
    (authOut && typeof authOut === 'object' && Object.keys(authOut).length > 0)
  );
}

// left has preAuthorize and right has preAuthorize
export function HTPipePreAuthorize<
  TLeft extends HasPreAuthorize<
    any,
    | boolean
    | (TRight extends HasPreAuthorize<any, any>
        ? Pick<
            Parameters<TRight['preAuthorize']>[0],
            keyof ReturnType<
              TLeft extends HasPreAuthorize<any, any>
                ? TLeft['preAuthorize']
                : () => {}
            >
          >
        : any)
  >,
  TRight extends HasPreAuthorize<any, any>,
  TContextInLeft extends Parameters<TLeft['preAuthorize']>[0],
  TContextInRight extends Parameters<TRight['preAuthorize']>[0],
  TContextOutLeft extends ReturnType<TLeft['preAuthorize']>,
  TContextOutRight extends ReturnType<TRight['preAuthorize']>
>(
  left: TLeft,
  right: TRight
): HasPreAuthorize<
  TContextInLeft &
    Omit<
      TContextInRight,
      TContextOutLeft extends boolean ? keyof {} : keyof TContextOutLeft
    >,
  TContextOutRight &
    Omit<
      TContextOutLeft,
      TContextOutRight extends boolean ? keyof {} : keyof TContextOutRight
    >
>;

// left has preAuthorize and right does not
export function HTPipePreAuthorize<
  TLeft extends HasPreAuthorize<
    any,
    | boolean
    | (TRight extends HasPreAuthorize<any, any>
        ? Pick<
            Parameters<TRight['preAuthorize']>[0],
            keyof ReturnType<
              TLeft extends HasPreAuthorize<any, any>
                ? TLeft['preAuthorize']
                : () => {}
            >
          >
        : any)
  >,
  TRight extends MightHavePreAuthorize<any, any>,
  TContextInLeft extends Parameters<TLeft['preAuthorize']>[0],
  TContextOutLeft extends ReturnType<TLeft['preAuthorize']>
>(left: TLeft, right: TRight): HasPreAuthorize<TContextInLeft, TContextOutLeft>;

// right has preAuthorize and left does not
export function HTPipePreAuthorize<
  TLeft extends MightHavePreAuthorize<
    any,
    | boolean
    | (TRight extends HasPreAuthorize<any, any>
        ? Pick<
            Parameters<TRight['preAuthorize']>[0],
            keyof ReturnType<
              TLeft extends HasPreAuthorize<any, any>
                ? TLeft['preAuthorize']
                : () => {}
            >
          >
        : any)
  >,
  TRight extends HasPreAuthorize<any, any>,
  TContextInRight extends Parameters<TRight['preAuthorize']>[0],
  TContextOutRight extends ReturnType<TRight['preAuthorize']>
>(
  left: TLeft,
  right: TRight
): HasPreAuthorize<TContextInRight, TContextOutRight>;

// right and left doesn't have preAuthorize
export function HTPipePreAuthorize<
  TLeft extends MightHavePreAuthorize<
    any,
    | boolean
    | (TRight extends HasPreAuthorize<any, any>
        ? Pick<
            Parameters<TRight['preAuthorize']>[0],
            keyof ReturnType<
              TLeft extends HasPreAuthorize<any, any>
                ? TLeft['preAuthorize']
                : () => {}
            >
          >
        : any)
  >,
  TRight extends MightHavePreAuthorize<any, any>
>(left: TLeft, right: TRight): {};

// main preAuthorize HTPipe
export function HTPipePreAuthorize<
  TLeft extends MightHavePreAuthorize<any, any>,
  TRight extends MightHavePreAuthorize<any, any>,
  TContextInLeft extends TLeft extends HasPreAuthorize<any, any>
    ? Parameters<TLeft['preAuthorize']>[0]
    : never,
  TContextInRight extends TRight extends HasPreAuthorize<any, any>
    ? Parameters<TRight['preAuthorize']>[0]
    : never,
  TContextOutLeft extends TLeft extends HasPreAuthorize<any, any>
    ? ReturnType<TLeft['preAuthorize']>
    : never,
  TContextOutRight extends TRight extends HasPreAuthorize<any, any>
    ? ReturnType<TRight['preAuthorize']>
    : never
>(left: TLeft, right: TRight) {
  if (isHasPreAuthorize(left) && isHasPreAuthorize(right)) {
    return {
      preAuthorize: (
        context: TContextOutLeft extends TContextInRight
          ? TContextInLeft
          : TContextInRight & TContextInLeft
      ) => {
        const leftOut = left.preAuthorize(context);
        const leftPassed = authorizationPassed(leftOut);
        if (!leftPassed) {
          return false;
        }
        const leftContextOut = leftPassed === true ? {} : leftOut;
        const rightIn = {
          ...context,
          ...leftContextOut,
        };
        const rightOut = right.preAuthorize(rightIn);
        const rightPassed = authorizationPassed(rightOut);
        if (!rightPassed) {
          return false;
        }
        if (leftOut === true && rightOut === true) {
          return true;
        }
        const rightContextOut = rightOut === true ? {} : rightOut;
        return {
          ...leftContextOut,
          ...rightContextOut,
        };
      },
    };
  } else if (isHasPreAuthorize(left)) {
    return {
      preAuthorize: left.preAuthorize,
    };
  } else if (isHasPreAuthorize(right)) {
    return {
      preAuthorize: right.preAuthorize,
    };
  } else {
    return {};
  }
}

// left has finalAuthorize and right has finalAuthorize
export function HTPipeFinalAuthorize<
  TLeft extends HasFinalAuthorize<
    any,
    | boolean
    | (TRight extends HasFinalAuthorize<any, any>
        ? Pick<
            Parameters<TRight['finalAuthorize']>[0],
            keyof PromiseResolveOrSync<
              ReturnType<
                TLeft extends HasFinalAuthorize<any, any>
                  ? TLeft['finalAuthorize']
                  : () => {}
              >
            >
          >
        : any)
  >,
  TRight extends HasFinalAuthorize<any, any>,
  TContextInLeft extends Parameters<TLeft['finalAuthorize']>[0],
  TContextInRight extends Parameters<TRight['finalAuthorize']>[0],
  TContextOutLeft extends PromiseResolveOrSync<
    ReturnType<TLeft['finalAuthorize']>
  >,
  TContextOutRight extends PromiseResolveOrSync<
    ReturnType<TRight['finalAuthorize']>
  >
>(
  left: TLeft,
  right: TRight
): HasFinalAuthorize<
  TContextInLeft &
    Omit<
      TContextInRight,
      TContextOutLeft extends boolean ? keyof {} : keyof TContextOutLeft
    >,
  TContextOutRight &
    Omit<
      TContextOutLeft,
      TContextOutRight extends boolean ? keyof {} : keyof TContextOutRight
    >
>;

// left has finalAuthorize and right does not
export function HTPipeFinalAuthorize<
  TLeft extends HasFinalAuthorize<
    any,
    | boolean
    | (TRight extends HasFinalAuthorize<any, any>
        ? Pick<
            Parameters<TRight['finalAuthorize']>[0],
            keyof PromiseResolveOrSync<
              ReturnType<
                TLeft extends HasFinalAuthorize<any, any>
                  ? TLeft['finalAuthorize']
                  : () => {}
              >
            >
          >
        : any)
  >,
  TRight extends MightHaveFinalAuthorize<any, any>,
  TContextInLeft extends Parameters<TLeft['finalAuthorize']>[0],
  TContextOutLeft extends PromiseResolveOrSync<
    ReturnType<TLeft['finalAuthorize']>
  >
>(
  left: TLeft,
  right: TRight
): HasFinalAuthorize<TContextInLeft, TContextOutLeft>;

// right has finalAuthorize and left does not
export function HTPipeFinalAuthorize<
  TLeft extends MightHaveFinalAuthorize<
    any,
    | boolean
    | (TRight extends HasFinalAuthorize<any, any>
        ? Pick<
            Parameters<TRight['finalAuthorize']>[0],
            keyof PromiseResolveOrSync<
              ReturnType<
                TLeft extends HasFinalAuthorize<any, any>
                  ? TLeft['finalAuthorize']
                  : () => {}
              >
            >
          >
        : any)
  >,
  TRight extends HasFinalAuthorize<any, any>,
  TContextInRight extends Parameters<TRight['finalAuthorize']>[0],
  TContextOutRight extends PromiseResolveOrSync<
    ReturnType<TRight['finalAuthorize']>
  >
>(
  left: TLeft,
  right: TRight
): HasFinalAuthorize<TContextInRight, TContextOutRight>;

// right and left doesn't have preAuthorize
export function HTPipeFinalAuthorize<
  TLeft extends MightHaveFinalAuthorize<
    any,
    | boolean
    | (TRight extends HasFinalAuthorize<any, any>
        ? Pick<
            Parameters<TRight['finalAuthorize']>[0],
            keyof PromiseResolveOrSync<
              ReturnType<
                TLeft extends HasFinalAuthorize<any, any>
                  ? TLeft['finalAuthorize']
                  : () => {}
              >
            >
          >
        : any)
  >,
  TRight extends MightHaveFinalAuthorize<any, any>
>(left: TLeft, right: TRight): {};

// finalAuthorize main function
export function HTPipeFinalAuthorize<
  TLeft extends MightHaveFinalAuthorize<any, any>,
  TRight extends MightHaveFinalAuthorize<any, any>,
  TContextInLeft extends TLeft extends HasFinalAuthorize<any, any>
    ? Parameters<TLeft['finalAuthorize']>[0]
    : never,
  TContextInRight extends TRight extends HasFinalAuthorize<any, any>
    ? Parameters<TRight['finalAuthorize']>[0]
    : never,
  TContextOutLeft extends TLeft extends HasFinalAuthorize<any, any>
    ? PromiseResolveOrSync<ReturnType<TLeft['finalAuthorize']>>
    : never,
  TContextOutRight extends TRight extends HasFinalAuthorize<any, any>
    ? PromiseResolveOrSync<ReturnType<TRight['finalAuthorize']>>
    : never
>(left: TLeft, right: TRight) {
  if (isHasFinalAuthorize(left) && isHasFinalAuthorize(right)) {
    return {
      finalAuthorize: async (
        context: TContextOutLeft extends TContextInRight
          ? TContextInLeft
          : TContextInRight & TContextInLeft
      ) => {
        const leftOut = await Promise.resolve(left.finalAuthorize(context));
        const leftPassed = authorizationPassed(leftOut);
        if (!leftPassed) {
          return false;
        }
        const leftContextOut = leftOut === true ? {} : leftOut;
        const rightIn = {
          ...context,
          ...leftContextOut,
        };
        const rightOut = await Promise.resolve(right.finalAuthorize(rightIn));
        const rightPassed = authorizationPassed(rightOut);
        if (!rightPassed) {
          return false;
        }
        if (leftOut === true && rightOut === true) {
          return true;
        }
        const rightContextOut = rightOut === true ? {} : rightOut;
        return {
          ...leftContextOut,
          ...rightContextOut,
        };
      },
    };
  } else if (isHasFinalAuthorize(left)) {
    return { finalAuthorize: left.finalAuthorize };
  } else if (isHasFinalAuthorize(right)) {
    return { finalAuthorize: right.finalAuthorize };
  } else {
    return {};
  }
}

// left has initPreContext and right has initPreContext
export function HTPipeInitPreContext<
  TLeft extends HasInitPreContext<
    any,
    TRight extends HasInitPreContext<any, any>
      ? Pick<
          Parameters<TRight['initPreContext']>[0],
          keyof ReturnType<
            TLeft extends HasInitPreContext<any, any>
              ? TLeft['initPreContext']
              : () => {}
          >
        >
      : any
  >,
  TRight extends HasInitPreContext<any, any>,
  TContextInLeft extends Parameters<TLeft['initPreContext']>[0],
  TContextInRight extends Parameters<TRight['initPreContext']>[0],
  TContextOutLeft extends ReturnType<TLeft['initPreContext']>,
  TContextOutRight extends ReturnType<TRight['initPreContext']>
>(
  left: TLeft,
  right: TRight
): HasInitPreContext<
  TContextInLeft & Omit<TContextInRight, keyof TContextOutLeft>,
  TContextOutRight & Omit<TContextOutLeft, keyof TContextOutRight>
>;

// left has initPreContext and right doesn't
export function HTPipeInitPreContext<
  TLeft extends HasInitPreContext<
    any,
    TRight extends HasInitPreContext<any, any>
      ? Pick<
          Parameters<TRight['initPreContext']>[0],
          keyof ReturnType<
            TLeft extends HasInitPreContext<any, any>
              ? TLeft['initPreContext']
              : () => {}
          >
        >
      : any
  >,
  TRight extends OptionallyHasInitPreContext<any, any>,
  TContextInLeft extends Parameters<TLeft['initPreContext']>[0],
  TContextOutLeft extends ReturnType<TLeft['initPreContext']>
>(
  left: TLeft,
  right: TRight
): HasInitPreContext<TContextInLeft, TContextOutLeft>;

// right has initPreContext and left doesn't
export function HTPipeInitPreContext<
  TLeft extends OptionallyHasInitPreContext<
    any,
    TRight extends HasInitPreContext<any, any>
      ? Pick<
          Parameters<TRight['initPreContext']>[0],
          keyof ReturnType<
            TLeft extends HasInitPreContext<any, any>
              ? TLeft['initPreContext']
              : () => {}
          >
        >
      : any
  >,
  TRight extends HasInitPreContext<any, any>,
  TContextInRight extends Parameters<TRight['initPreContext']>[0],
  TContextOutRight extends ReturnType<TRight['initPreContext']>
>(
  left: TLeft,
  right: TRight
): HasInitPreContext<TContextInRight, TContextOutRight>;

// right and left doesn't have initPreContext
export function HTPipeInitPreContext<
  TLeft extends OptionallyHasInitPreContext<
    any,
    TRight extends HasInitPreContext<any, any>
      ? Pick<
          Parameters<TRight['initPreContext']>[0],
          keyof ReturnType<
            TLeft extends HasInitPreContext<any, any>
              ? TLeft['initPreContext']
              : () => {}
          >
        >
      : any
  >,
  TRight extends OptionallyHasInitPreContext<any, any>
>(left: TLeft, right: TRight): {};

// main initPreContext HTPipe function
export function HTPipeInitPreContext<
  TLeft extends OptionallyHasInitPreContext<any, any>,
  TRight extends OptionallyHasInitPreContext<any, any>,
  TContextInLeft extends TLeft extends HasInitPreContext<any, any>
    ? Parameters<TLeft['initPreContext']>[0]
    : never,
  TContextInRight extends TRight extends HasInitPreContext<any, any>
    ? Parameters<TRight['initPreContext']>[0]
    : never,
  TContextOutLeft extends TLeft extends HasInitPreContext<any, any>
    ? ReturnType<TLeft['initPreContext']>
    : never,
  TContextOutRight extends TRight extends HasInitPreContext<any, any>
    ? ReturnType<TRight['initPreContext']>
    : never
>(left: TLeft, right: TRight) {
  if (isHasInitPreContext(left) && isHasInitPreContext(right)) {
    return {
      initPreContext: (
        context: TContextOutLeft extends TContextInRight
          ? TContextInLeft
          : TContextInRight & TContextInLeft
      ) => {
        const leftOut = left.initPreContext(context) || {};
        const rightIn = {
          ...context,
          ...leftOut,
        };
        const rightOut = right.initPreContext(rightIn) || {};
        return {
          ...leftOut,
          ...rightOut,
        };
      },
    };
  } else if (isHasInitPreContext(left)) {
    return { initPreContext: left.initPreContext };
  } else if (isHasInitPreContext(right)) {
    return { initPreContext: right.initPreContext };
  } else {
    return {};
  }
}

// left has doWork and right has doWork
export function HTPipeDoWork<
  TLeft extends HasDoWork<
    any,
    | void
    | (TRight extends HasDoWork<any, any>
        ? Pick<
            Parameters<TRight['doWork']>[0],
            keyof PromiseResolveOrSync<
              ReturnType<
                TLeft extends HasDoWork<any, any> ? TLeft['doWork'] : () => {}
              >
            >
          >
        : any)
  >,
  TRight extends HasDoWork<any, any>,
  TContextInLeft extends Parameters<TLeft['doWork']>[0],
  TContextInRight extends Parameters<TRight['doWork']>[0],
  TContextOutLeft extends PromiseResolveOrSync<ReturnType<TLeft['doWork']>>,
  TContextOutRight extends PromiseResolveOrSync<ReturnType<TLeft['doWork']>>
>(
  left: TLeft,
  right: TRight
): HasDoWork<
  TContextInLeft &
    Omit<
      TContextInRight,
      TContextOutLeft extends void ? keyof {} : keyof TContextOutLeft
    >,
  TContextOutRight &
    Omit<
      TContextOutLeft,
      TContextOutRight extends void ? keyof {} : keyof TContextOutRight
    >
>;

// left has doWork, right doesn't
export function HTPipeDoWork<
  TLeft extends HasDoWork<
    any,
    | void
    | (TRight extends HasDoWork<any, any>
        ? Pick<
            Parameters<TRight['doWork']>[0],
            keyof PromiseResolveOrSync<
              ReturnType<
                TLeft extends HasDoWork<any, any> ? TLeft['doWork'] : () => {}
              >
            >
          >
        : any)
  >,
  TRight extends OptionallyHasDoWork<any, any>,
  TContextInLeft extends Parameters<TLeft['doWork']>[0],
  TContextOutLeft extends PromiseResolveOrSync<TLeft['doWork']>
>(left: TLeft, right: TRight): HasDoWork<TContextInLeft, TContextOutLeft>;

// right has do doWork, left doesn't
export function HTPipeDoWork<
  TLeft extends OptionallyHasDoWork<
    any,
    | void
    | (TRight extends HasDoWork<any, any>
        ? Pick<
            Parameters<TRight['doWork']>[0],
            keyof PromiseResolveOrSync<
              ReturnType<
                TLeft extends HasDoWork<any, any> ? TLeft['doWork'] : () => {}
              >
            >
          >
        : any)
  >,
  TRight extends HasDoWork<any, any>,
  TContextInRight extends Parameters<TRight['doWork']>[0],
  TContextOutRight extends PromiseResolveOrSync<ReturnType<TRight['doWork']>>
>(left: TLeft, right: TRight): HasDoWork<TContextInRight, TContextOutRight>;

// right and left doesn't have doWork
export function HTPipeDoWork<
  TLeft extends OptionallyHasDoWork<
    any,
    | void
    | (TRight extends HasDoWork<any, any>
        ? Pick<
            Parameters<TRight['doWork']>[0],
            keyof PromiseResolveOrSync<
              ReturnType<
                TLeft extends HasDoWork<any, any> ? TLeft['doWork'] : () => {}
              >
            >
          >
        : any)
  >,
  TRight extends OptionallyHasDoWork<any, any>
>(left: TLeft, right: TRight): {};

// main doWork HTPipe
export function HTPipeDoWork<
  TLeft extends OptionallyHasDoWork<any, any>,
  TRight extends OptionallyHasDoWork<any, any>,
  TContextInLeft extends TLeft extends HasDoWork<any, any>
    ? Parameters<TLeft['doWork']>[0]
    : never,
  TContextInRight extends TRight extends HasDoWork<any, any>
    ? Parameters<TRight['doWork']>[0]
    : never,
  TContextOutLeft extends TLeft extends HasDoWork<any, any>
    ? PromiseResolveOrSync<ReturnType<TLeft['doWork']>>
    : never,
  TContextOutRight extends TRight extends HasDoWork<any, any>
    ? PromiseResolveOrSync<ReturnType<TRight['doWork']>>
    : never
>(left: TLeft, right: TRight) {
  if (isHasDoWork(left) && isHasDoWork(right)) {
    return {
      doWork: async (
        context: TContextOutLeft extends TContextInRight
          ? TContextInLeft
          : TContextInRight & TContextInLeft
      ) => {
        const leftOut = (await Promise.resolve(left.doWork(context))) || {};
        const rightIn = {
          ...context,
          ...leftOut,
        };
        const rightOut = (await Promise.resolve(right.doWork(rightIn))) || {};
        return { ...leftOut, ...rightOut };
      },
    };
  } else if (isHasDoWork(left)) {
    return { doWork: left.doWork };
  } else if (isHasDoWork(right)) {
    return { doWork: right.doWork };
  } else {
    return {};
  }
}

// left has respond and right has respond
export function HTPipeRespond<
  TLeft extends HasRespond<
    any,
    TRight extends HasRespond<any, any> ? Parameters<TRight['respond']>[0] : any
  >,
  TRight extends HasRespond<any, any>,
  TContextInLeft extends Parameters<TLeft['respond']>[0],
  TContextOutRight extends ReturnType<TRight['respond']>
>(left: TLeft, right: TRight): HasRespond<TContextInLeft, TContextOutRight>;

// left has respond and right doesn't
export function HTPipeRespond<
  TLeft extends HasRespond<
    any,
    TRight extends HasRespond<any, any> ? Parameters<TRight['respond']>[0] : any
  >,
  TRight extends MightHaveRespond<any, any>,
  TContextInLeft extends Parameters<TLeft['respond']>[0],
  TContextOutLeft extends ReturnType<TLeft['respond']>
>(left: TLeft, right: TRight): HasRespond<TContextInLeft, TContextOutLeft>;

// right has respond and left doesn't
export function HTPipeRespond<
  TLeft extends MightHaveRespond<
    any,
    TRight extends HasRespond<any, any> ? Parameters<TRight['respond']>[0] : any
  >,
  TRight extends HasRespond<any, any>,
  TContextInRight extends Parameters<TRight['respond']>[0],
  TContextOutRight extends ReturnType<TRight['respond']>
>(left: TLeft, right: TRight): HasRespond<TContextInRight, TContextOutRight>;

// right and left doesn't have respond
export function HTPipeRespond<
  TLeft extends MightHaveRespond<
    any,
    TRight extends HasRespond<any, any> ? Parameters<TRight['respond']>[0] : any
  >,
  TRight extends MightHaveRespond<any, any>
>(left: TLeft, right: TRight): {};

// main respond HTPipe function
export function HTPipeRespond<
  TLeft extends MightHaveRespond<any, any>,
  TRight extends MightHaveRespond<any, any>,
  TContextInLeft extends TLeft extends HasRespond<any, any>
    ? Parameters<TLeft['respond']>[0]
    : never
>(left: TLeft, right: TRight) {
  if (isHasRespond(left) && isHasRespond(right)) {
    return {
      respond: (context: TContextInLeft) => {
        const leftOut = left.respond(context);
        const rightOut = right.respond(leftOut.unsafeResponse);
        return {
          unsafeResponse: rightOut.unsafeResponse,
          status:
            rightOut.status === undefined ? leftOut.status : rightOut.status,
        };
      },
    };
  } else if (isHasRespond(left)) {
    return { respond: left.respond };
  } else if (isHasRespond(right)) {
    return { respond: right.respond };
  } else {
    return {};
  }
}

// left has sanitizeParams and right has sanitizeParams
export function HTPipeSanitizeParams<
  TLeft extends HasSanitizeParams<
    any,
    TRight extends HasSanitizeParams<any, any>
      ? Parameters<TRight['sanitizeParams']>[0]
      : any
  >,
  TRight extends HasSanitizeParams<any, any>,
  TContextInLeft extends Parameters<TLeft['sanitizeParams']>[0],
  TContextOutRight extends ReturnType<TRight['sanitizeParams']>
>(
  left: TLeft,
  right: TRight
): HasSanitizeParams<TContextInLeft, TContextOutRight>;

// left has sanitizeParams and right doesn't
export function HTPipeSanitizeParams<
  TLeft extends HasSanitizeParams<
    any,
    TRight extends HasSanitizeParams<any, any>
      ? Parameters<TRight['sanitizeParams']>[0]
      : any
  >,
  TRight extends OptionallyHasSanitizeParams<any, any>,
  TContextInLeft extends Parameters<TLeft['sanitizeParams']>[0],
  TContextOutLeft extends ReturnType<TLeft['sanitizeParams']>
>(
  left: TLeft,
  right: TRight
): HasSanitizeParams<TContextInLeft, TContextOutLeft>;

// right has sanitizeParams and left doesn't
export function HTPipeSanitizeParams<
  TLeft extends OptionallyHasSanitizeParams<
    any,
    TRight extends HasSanitizeParams<any, any>
      ? Parameters<TRight['sanitizeParams']>[0]
      : any
  >,
  TRight extends HasSanitizeParams<any, any>,
  TContextInRight extends Parameters<TRight['sanitizeParams']>[0],
  TContextOutRight extends ReturnType<TRight['sanitizeParams']>[0]
>(
  left: TLeft,
  right: TRight
): HasSanitizeParams<TContextInRight, TContextOutRight>;

// left and right doesn't have sanitizeParams
export function HTPipeSanitizeParams<
  TLeft extends OptionallyHasSanitizeParams<
    any,
    TRight extends HasSanitizeParams<any, any>
      ? Parameters<TRight['sanitizeParams']>[0]
      : any
  >,
  TRight extends OptionallyHasSanitizeParams<any, any>
>(left: TLeft, right: TRight): {};

// main sanitizeParams HTPipe function
export function HTPipeSanitizeParams<
  TLeft extends OptionallyHasSanitizeParams<any, any>,
  TRight extends OptionallyHasSanitizeParams<any, any>,
  TContextInLeft extends TLeft extends HasSanitizeParams<any, any>
    ? Parameters<TLeft['sanitizeParams']>[0]
    : never
>(left: TLeft, right: TRight) {
  if (isHasSanitizeParams(left) && isHasSanitizeParams(right)) {
    return {
      sanitizeParams: (context: TContextInLeft) => {
        const leftOut = left.sanitizeParams(context) || {};
        const rightOut = right.sanitizeParams(leftOut) || {};
        return rightOut;
      },
    };
  } else if (isHasSanitizeParams(left)) {
    return { sanitizeParams: left.sanitizeParams };
  } else if (isHasSanitizeParams(right)) {
    return { sanitizeParams: right.sanitizeParams };
  } else {
    return {};
  }
}

// left has sanitizeBody and right has sanitizeBody
export function HTPipeSanitizeBody<
  TLeft extends HasSanitizeBody<
    any,
    TRight extends HasSanitizeBody<any, any>
      ? Parameters<TRight['sanitizeBody']>[0]
      : any
  >,
  TRight extends HasSanitizeBody<any, any>,
  TContextInLeft extends Parameters<TLeft['sanitizeBody']>[0],
  TContextOutRight extends ReturnType<TRight['sanitizeBody']>
>(
  left: TLeft,
  right: TRight
): HasSanitizeBody<TContextInLeft, TContextOutRight>;

// left has sanitizeBody and right doesn't
export function HTPipeSanitizeBody<
  TLeft extends HasSanitizeBody<
    any,
    TRight extends HasSanitizeBody<any, any>
      ? Parameters<TRight['sanitizeBody']>[0]
      : any
  >,
  TRight extends OptionallyHasSanitizeBody<any, any>,
  TContextInLeft extends Parameters<TLeft['sanitizeBody']>[0],
  TContextOutLeft extends ReturnType<TLeft['sanitizeBody']>
>(left: TLeft, right: TRight): HasSanitizeBody<TContextInLeft, TContextOutLeft>;

// right has sanitizeBody and left doesn't
export function HTPipeSanitizeBody<
  TLeft extends OptionallyHasSanitizeBody<
    any,
    TRight extends HasSanitizeBody<any, any>
      ? Parameters<TRight['sanitizeBody']>[0]
      : any
  >,
  TRight extends HasSanitizeBody<any, any>,
  TContextInRight extends Parameters<TRight['sanitizeBody']>[0],
  TContextOutRight extends ReturnType<TRight['sanitizeBody']>[0]
>(
  left: TLeft,
  right: TRight
): HasSanitizeBody<TContextInRight, TContextOutRight>;

// left and right doesn't have sanitizeBody
export function HTPipeSanitizeBody<
  TLeft extends OptionallyHasSanitizeBody<
    any,
    TRight extends HasSanitizeBody<any, any>
      ? Parameters<TRight['sanitizeBody']>[0]
      : any
  >,
  TRight extends OptionallyHasSanitizeBody<any, any>
>(left: TLeft, right: TRight): {};

// main sanitizeBody HTPipe function
export function HTPipeSanitizeBody<
  TLeft extends OptionallyHasSanitizeBody<any, any>,
  TRight extends OptionallyHasSanitizeBody<any, any>,
  TContextInLeft extends TLeft extends HasSanitizeBody<any, any>
    ? Parameters<TLeft['sanitizeBody']>[0]
    : never
>(left: TLeft, right: TRight) {
  if (isHasSanitizeBody(left) && isHasSanitizeBody(right)) {
    return {
      sanitizeBody: (context: TContextInLeft) => {
        const leftOut = left.sanitizeBody(context) || {};
        const rightOut = right.sanitizeBody(leftOut) || {};
        return rightOut;
      },
    };
  } else if (isHasSanitizeBody(left)) {
    return { sanitizeBody: left.sanitizeBody };
  } else if (isHasSanitizeBody(right)) {
    return { sanitizeBody: right.sanitizeBody };
  } else {
    return {};
  }
}

// left has sanitizeResponse and right has sanitizeResponse
export function HTPipeSanitizeResponse<
  TLeft extends HasSanitizeResponse<
    any,
    TRight extends HasSanitizeResponse<any, any>
      ? Parameters<TRight['sanitizeResponse']>[0]
      : any
  >,
  TRight extends HasSanitizeResponse<any, any>,
  TContextInLeft extends Parameters<TLeft['sanitizeResponse']>[0],
  TContextOutRight extends ReturnType<TRight['sanitizeResponse']>
>(
  left: TLeft,
  right: TRight
): HasSanitizeResponse<TContextInLeft, TContextOutRight>;

// left has sanitizeResponse and right doesn't
export function HTPipeSanitizeResponse<
  TLeft extends HasSanitizeResponse<
    any,
    TRight extends HasSanitizeResponse<any, any>
      ? Parameters<TRight['sanitizeResponse']>[0]
      : any
  >,
  TRight extends MightHaveSanitizeResponse<any, any>,
  TContextInLeft extends Parameters<TLeft['sanitizeResponse']>[0],
  TContextOutLeft extends ReturnType<TLeft['sanitizeResponse']>
>(
  left: TLeft,
  right: TRight
): HasSanitizeResponse<TContextInLeft, TContextOutLeft>;

// right has sanitizeResponse and left doesn't
export function HTPipeSanitizeResponse<
  TLeft extends MightHaveSanitizeResponse<
    any,
    TRight extends HasSanitizeResponse<any, any>
      ? Parameters<TRight['sanitizeResponse']>[0]
      : any
  >,
  TRight extends HasSanitizeResponse<any, any>,
  TContextInRight extends Parameters<TRight['sanitizeResponse']>[0],
  TContextOutRight extends ReturnType<TRight['sanitizeResponse']>[0]
>(
  left: TLeft,
  right: TRight
): HasSanitizeResponse<TContextInRight, TContextOutRight>;

// left and right doesn't have sanitizeResponse
export function HTPipeSanitizeResponse<
  TLeft extends MightHaveSanitizeResponse<
    any,
    TRight extends HasSanitizeResponse<any, any>
      ? Parameters<TRight['sanitizeResponse']>[0]
      : any
  >,
  TRight extends MightHaveSanitizeResponse<any, any>
>(left: TLeft, right: TRight): {};

// main sanitizeResponse HTPipe function
export function HTPipeSanitizeResponse<
  TLeft extends MightHaveSanitizeResponse<any, any>,
  TRight extends MightHaveSanitizeResponse<any, any>,
  TContextInLeft extends TLeft extends HasSanitizeResponse<any, any>
    ? Parameters<TLeft['sanitizeResponse']>[0]
    : never
>(left: TLeft, right: TRight) {
  if (isHasSanitizeResponse(left) && isHasSanitizeResponse(right)) {
    return {
      sanitizeResponse: (context: TContextInLeft) => {
        const leftOut = left.sanitizeResponse(context) || {};
        const rightOut = right.sanitizeResponse(leftOut) || {};
        return rightOut;
      },
    };
  } else if (isHasSanitizeResponse(left)) {
    return { sanitizeResponse: left.sanitizeResponse };
  } else if (isHasSanitizeResponse(right)) {
    return { sanitizeResponse: right.sanitizeResponse };
  } else {
    return {};
  }
}

type ClassExtender<TClassIn, TClassOut> = (ClassIn: TClassIn) => TClassOut;

// todo: Add an htMix too b/c this REQUIRES that a param has been provided
// by one of the previous subclassers in the pipe
export function HTPipeOld<ClassIn>(): ClassExtender<ClassIn, ClassIn>;
export function HTPipeOld<ClassIn, A>(
  fn1: ClassExtender<ClassIn, A>
): ClassExtender<ClassIn, A>;
export function HTPipeOld<ClassIn, A, B>(
  fn1: ClassExtender<ClassIn, A>,
  fn2: ClassExtender<A, B>
): ClassExtender<ClassIn, B>;
export function HTPipeOld<ClassIn, A, B, C>(
  fn1: ClassExtender<ClassIn, A>,
  fn2: ClassExtender<A, B>,
  fn3: ClassExtender<B, C>
): ClassExtender<ClassIn, C>;
export function HTPipeOld<ClassIn, A, B, C, D>(
  fn1: ClassExtender<ClassIn, A>,
  fn2: ClassExtender<A, B>,
  fn3: ClassExtender<B, C>,
  fn4: ClassExtender<C, D>
): ClassExtender<ClassIn, D>;
export function HTPipeOld<ClassIn, A, B, C, D, E>(
  fn1: ClassExtender<ClassIn, A>,
  fn2: ClassExtender<A, B>,
  fn3: ClassExtender<B, C>,
  fn4: ClassExtender<C, D>,
  fn5: ClassExtender<D, E>
): ClassExtender<ClassIn, E>;
export function HTPipeOld<ClassIn, A, B, C, D, E, F>(
  fn1: ClassExtender<ClassIn, A>,
  fn2: ClassExtender<A, B>,
  fn3: ClassExtender<B, C>,
  fn4: ClassExtender<C, D>,
  fn5: ClassExtender<D, E>,
  fn6: ClassExtender<E, F>
): ClassExtender<ClassIn, F>;
export function HTPipeOld<ClassIn, A, B, C, D, E, F, G>(
  fn1: ClassExtender<ClassIn, A>,
  fn2: ClassExtender<A, B>,
  fn3: ClassExtender<B, C>,
  fn4: ClassExtender<C, D>,
  fn5: ClassExtender<D, E>,
  fn6: ClassExtender<E, F>,
  fn7: ClassExtender<F, G>
): ClassExtender<ClassIn, G>;
export function HTPipeOld<ClassIn, A, B, C, D, E, F, G, H>(
  fn1: ClassExtender<ClassIn, A>,
  fn2: ClassExtender<A, B>,
  fn3: ClassExtender<B, C>,
  fn4: ClassExtender<C, D>,
  fn5: ClassExtender<D, E>,
  fn6: ClassExtender<E, F>,
  fn7: ClassExtender<F, G>,
  fn8: ClassExtender<G, H>
): ClassExtender<ClassIn, H>;
export function HTPipeOld<ClassIn, A, B, C, D, E, F, G, H, I>(
  fn1: ClassExtender<ClassIn, A>,
  fn2: ClassExtender<A, B>,
  fn3: ClassExtender<B, C>,
  fn4: ClassExtender<C, D>,
  fn5: ClassExtender<D, E>,
  fn6: ClassExtender<E, F>,
  fn7: ClassExtender<F, G>,
  fn8: ClassExtender<G, H>,
  fn9: ClassExtender<H, I>
): ClassExtender<ClassIn, I>;
export function HTPipeOld<ClassIn, A, B, C, D, E, F, G, H, I>(
  fn1: ClassExtender<ClassIn, A>,
  fn2: ClassExtender<A, B>,
  fn3: ClassExtender<B, C>,
  fn4: ClassExtender<C, D>,
  fn5: ClassExtender<D, E>,
  fn6: ClassExtender<E, F>,
  fn7: ClassExtender<F, G>,
  fn8: ClassExtender<G, H>,
  fn9: ClassExtender<H, I>,
  ...fns: Array<ClassExtender<any, any>>
): ClassExtender<ClassIn, {}>;

export function HTPipeOld(...fns: Array<ClassExtender<any, any>>) {
  if (!fns) {
    return (inClass: any) => inClass;
  }
  if (fns.length === 1) {
    return fns[0];
  }
  return function piped<TSuper>(Super: TSuper) {
    return fns.reduce((prev, fn) => fn(prev), Super);
  };
}

export * from './core';
export * from './express';
export * from './mongoose';
export * from './user';
export * from './subclassers';
