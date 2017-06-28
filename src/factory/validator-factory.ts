import { ValidatorFn, Validators } from '@angular/forms';

import { Validation, Email, Max, Min, MaxLength, MinLength, Pattern, Required } from '../validation';

export class ValidatorFactory {

  public constructor(private validation: Validation) { }

  public createEmailValidator(): ValidatorFn {
    return Validators.email;
  }

  public createMaxValidator(): ValidatorFn {
    return Validators.max((<Max>this.validation).value);
  }

  public createMinValidator(): ValidatorFn {
    return Validators.min((<Min>this.validation).value);
  }

  public createMaxLengthValidator(): ValidatorFn {
    return Validators.maxLength((<MaxLength>this.validation).value);
  }

  public createMinLengthValidator(): ValidatorFn {
    return Validators.minLength((<MinLength>this.validation).value);
  }

  public createPatternValidator(): ValidatorFn {
    return Validators.pattern((<Pattern>this.validation).value);
  }

  public createRequiredValidator(): ValidatorFn {
    return !(<Required>this.validation).requiredTrue ? Validators.required : Validators.requiredTrue;
  }
}
