import {
  NextFunction as ExpressNextFunction,
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import {
  assertHipthrustable,
  executeHipthrustable,
  HipRedirectException,
  withDefaultImplementations,
} from './core';
import {
  AttachDataReqsSatisfiedOptional,
  DoWorkReqsSatisfiedOptional,
  FinalAuthReqsSatisfied,
  HasAllNotRequireds,
  HasAllRequireds,
  PreAuthReqsSatisfied,
  RespondReqsSatisfied,
  SanitizeResponseReqsSatisfied,
} from './types';

export function hipExpressHandlerFactory<
  TConf extends HasAllNotRequireds &
    HasAllRequireds &
    PreAuthReqsSatisfied<TConf> &
    AttachDataReqsSatisfiedOptional<TConf> &
    FinalAuthReqsSatisfied<TConf> &
    DoWorkReqsSatisfiedOptional<TConf> &
    RespondReqsSatisfied<TConf> &
    SanitizeResponseReqsSatisfied<TConf>
>(handlingStrategy: TConf) {
  assertHipthrustable(handlingStrategy);
  const fullHipthrustable = withDefaultImplementations(handlingStrategy);
  return async (
    req: ExpressRequest,
    res: ExpressResponse,
    next: ExpressNextFunction
  ) => {
    try {
      const { response, status } = await executeHipthrustable(
        fullHipthrustable,
        { req, res },
        req.params,
        req.body
      );
      res.status(status).json(response);
    } catch (exception) {
      if (exception instanceof HipRedirectException) {
        res.redirect(exception.redirectCode, exception.redirectUrl);
      } else {
        next(exception);
      }
    }
  };
}
