import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";
import User from "../../../../entities/User";

@ValidatorConstraint({ async: true })
export class DoesUsernameExistConstraint
  implements ValidatorConstraintInterface {
  validate(username: string) {
    return User.findOne({ where: { username } }).then(user => {
      return !user;
    });
  }
}

export default function DoesUsernameExist(
  validationOptions?: ValidationOptions
) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: DoesUsernameExistConstraint
    });
  };
}
