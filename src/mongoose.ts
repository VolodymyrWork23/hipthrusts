import Boom from '@hapi/boom';
import { Constructor } from './types';
// tslint:disable-next-line:no-var-requires
const mask = require('json-mask');

interface ModelWithFindById<TInstance = any> {
  findById(id: string): { exec(): Promise<TInstance> };
}

interface HasValidateSync {
  validateSync(paths?: any, options?: any): { errors: any[] };
}
interface HasToObject<T> {
  toObject(options?: any): T;
}

export function htMongooseFactory(mongoose: any) {
  function findByIdRequired(Model: ModelWithFindById) {
    // tslint:disable-next-line:only-arrow-functions
    return async function(id: string) {
      // prevent accidental searching for all from previous stages
      // (e.g. if someone forgot to make id param required in schema so
      // validation passes when it shouldn't - this example is b/c
      // mongoose won't initialize with invalid ObjectIds passed to it.
      if (!id || !id.toString()) {
        throw Boom.badRequest('Missing dependent resource ID');
      }
      const result = await Model.findById(id).exec();
      if (!result) {
        throw Boom.notFound('Resource not found');
      }
      return result;
    };
  }

  function stripIdTransform(doc: any, ret: { _id: any }, options: any) {
    delete ret._id;
    return ret;
  }

  function deepWipeDefault(obj: any): any {
    if (Array.isArray(obj)) {
      // if this looks weird, realize that "enum" takes an array ;)
      return obj.map(elm => deepWipeDefault(elm));
    } else if (typeof obj === 'object' && !obj.instanceOfSchema) {
      return Object.keys(obj).reduce((acc, key) => {
        return {
          ...acc,
          ...(key === 'default' ? {} : { [key]: deepWipeDefault(obj[key]) }),
        };
      }, {});
    } else {
      return obj;
    }
  }

  function dtoSchemaObj(schemaConfigObject: any, maskConfig: string) {
    return deepWipeDefault(mask(schemaConfigObject, maskConfig));
  }

  type DocumentFactory<T> = (
    obj: any,
    ...rest: any
  ) => HasValidateSync & HasToObject<T>;

  function documentFactoryFrom(schemaConfigObject: any, name = '') {
    const schema = new mongoose.Schema(schemaConfigObject, {
      _id: false,
      id: false,
    });

    const MyModel = mongoose.model(name, schema);
    return (initializerPojo: any) => new MyModel(initializerPojo);
    // return (initializerPojo: any) => new mongoose.Document(initializerPojo, schema);
    // switch the 2 lines above with the one line when this issue is fixed and released
    // https://github.com/Automattic/mongoose/issues/8272
    // also remove name parameter
  }

  // @note for docs: NEVER use _id - mongoose gives it special treatment
  // also, ALWAYS rememver to make required fields required cause mongoose will STRIP invalid fields first!
  // figure out how to make that security gotcha harder to happen
  function WithParamsSanitized<
    TSafeParam extends ReturnType<TInstance['toObject']>,
    TDocFactory extends DocumentFactory<any>,
    TInstance extends ReturnType<TDocFactory>
  >(DocFactory: TDocFactory) {
    // tslint:disable-next-line:only-arrow-functions
    return function<TSuper extends Constructor>(Super: TSuper) {
      return class WithSanitizedParams extends Super {
        constructor(...args: any[]) {
          super(...args);
        }
        public sanitizeParams(unsafeParams: any) {
          const doc = DocFactory(unsafeParams);
          const validateErrors = doc.validateSync();
          if (validateErrors !== undefined) {
            throw Boom.badRequest('Params not valid');
          }
          // @tswtf: why do I need to force this?!
          return doc.toObject({ transform: stripIdTransform }) as TSafeParam;
        }
      };
    };
  }

  // @note: sanitize body validates modified only!  This is cause you usually will only send fields to update.
  function WithBodySanitized<
    TSafeBody extends ReturnType<TInstance['toObject']>,
    TDocFactory extends DocumentFactory<any>,
    TInstance extends ReturnType<TDocFactory>
  >(DocFactory: TDocFactory) {
    // tslint:disable-next-line:only-arrow-functions
    return function<TSuper extends Constructor>(Super: TSuper) {
      return class WithSanitizedBody extends Super {
        constructor(...args: any[]) {
          super(...args);
        }
        public sanitizeBody(unsafeBody: any) {
          const doc = DocFactory(unsafeBody);
          const validateErrors = doc.validateSync(undefined, {
            validateModifiedOnly: true,
          });
          if (validateErrors !== undefined) {
            throw Boom.badRequest('Body not valid');
          }
          // @tswtf: why do I need to force this?!
          return doc.toObject({ transform: stripIdTransform }) as TSafeBody;
        }
      };
    };
  }

  function WithResponseSanitized<
    TSafeResponse extends ReturnType<TInstance['toObject']>,
    TDocFactory extends DocumentFactory<any>,
    TInstance extends ReturnType<TDocFactory>
  >(DocFactory: TDocFactory) {
    // tslint:disable-next-line:only-arrow-functions
    return function<TSuper extends Constructor>(Super: TSuper) {
      return class WithSanitizedResponse extends Super {
        constructor(...args: any[]) {
          super(...args);
        }
        public sanitizeResponse(unsafeResponse: any) {
          const doc = DocFactory(unsafeResponse);
          // @tswtf: why do I need to force this?!
          return doc.toObject() as TSafeResponse;
        }
      };
    };
  }

  function WithParamsSanitizedTo<
    TSuper extends Constructor,
    TSafeParam extends ReturnType<TInstance['toObject']>,
    TDocFactory extends DocumentFactory<any>,
    TInstance extends ReturnType<TDocFactory>
  >(Super: TSuper, DocFactory: TDocFactory) {
    WithParamsSanitized(DocFactory)(Super);
  }

  function WithBodySanitizedTo<
    TSuper extends Constructor,
    TSafeBody extends ReturnType<TInstance['toObject']>,
    TDocFactory extends DocumentFactory<any>,
    TInstance extends ReturnType<TDocFactory>
  >(Super: TSuper, DocFactory: TDocFactory) {
    WithBodySanitized(DocFactory)(Super);
  }

  function WithResponseSanitizedTo<
    TSuper extends Constructor,
    TSafeResponse extends ReturnType<TInstance['toObject']>,
    TDocFactory extends DocumentFactory<any>,
    TInstance extends ReturnType<TDocFactory>
  >(Super: TSuper, DocFactory: TDocFactory) {
    WithResponseSanitized(DocFactory)(Super);
  }

  async function updateEntityTop(objectToUpdate: any, dataToUpdate: any) {
    objectToUpdate.set(dataToUpdate);
    await objectToUpdate.save();
    return objectToUpdate;
  }

  return {
    WithBodySanitized,
    WithBodySanitizedTo,
    WithParamsSanitized,
    WithParamsSanitizedTo,
    WithResponseSanitized,
    WithResponseSanitizedTo,
    documentFactoryFrom,
    dtoSchemaObj,
    findByIdRequired,
    stripIdTransform,
    updateEntityTop,
  };
}
