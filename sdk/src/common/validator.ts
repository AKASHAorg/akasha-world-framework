import { SafeParseError, z } from "zod";
import { throwError } from './error-handling';

export const validate = (...schemas: z.ZodSchema[]) => {
  return (target: any, propertyName: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      args.forEach((arg, index) => {
        if (schemas[index]) {
          const result = schemas[index].safeParse(arg);
          if (!result.success) {
            // @todo: pretty format arg
            throwError(result.error.toString(), [
              'sdk',
              'validate',
              target.constructor.name,
              propertyName.toString(),
              arg.toString(),
            ]);
          }
        }
      });
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
};
