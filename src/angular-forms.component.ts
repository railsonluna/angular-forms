import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter,
  Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';

import { AngularForms, Status } from '.';
import { Group } from './group';
import { DependencyService, Select, SelectService, Question } from './question';
import { ReactiveFormsFactory } from './factory';
import { StringUtils } from './util';

@Component({
  selector: 'rb-angular-forms',
  template: `
    <form *ngIf="Status['READY'] === status" class="rb-angular-forms" [formGroup]="formGroup" [ngClass]="{ 'read-only': readOnly }">
      <ng-container *ngFor="let group of groups">

        <ng-container [ngSwitch]="group.type">

          <ng-container *ngSwitchCase="'group'">
            <fieldset class="rb-fieldset rb-fieldset-{{ group.code }}" [formGroup]="formGroup.get(group.code)">
              <legend *ngIf="'Ungrouped' !== group.description">{{ group.description }}</legend>

              <ng-container *ngFor="let question of group.questions">

                <ng-container [ngSwitch]="question.type">

                  <ng-template ngSwitchCase="checkbox">
                    <div class="form-group" [hidden]="hideQuestion(question, formGroup.get(group.code))">
                      <ng-container *ngIf="!readOnly; else readOnlyCheckbox">
                        <div class="checkbox">
                          <label>
                            <input type="checkbox" [id]="question.name" [name]="question.name" [formControlName]="question.name" />
                            <span [ngClass]="{ 'required-control': question.isRequired() }">
                              {{ question.description }}
                            </span>
                          </label>
                          <rb-validation-message [validations]="question.validations"
                                                 [control]="formGroup.get(group.code).get(question.name)"
                                                 [submitted]="submitted">
                          </rb-validation-message>
                        </div> <!--/.checkbox-->
                      </ng-container> <!--/!readOnly-->

                      <ng-template #readOnlyCheckbox>
                        <label>
                          <i class="rb-ico rb-ico-square rb-ico-{{ question.answer ? 'checked' : 'unchecked' }}" aria-hidden="true"></i>
                          {{ question.description }}
                        </label>
                      </ng-template> <!--/readOnly-->
                    </div> <!--/.form-group-->
                  </ng-template> <!--/checkbox-->

                  <ng-template ngSwitchCase="radio">
                    <div class="form-group" [hidden]="hideQuestion(question, formGroup.get(group.code))">
                      <ng-container *ngIf="!readOnly; else readOnlyRadio">
                        <label [ngClass]="{ 'required-control': question.isRequired() }">
                          {{ question.description }}
                        </label>
                        <div class="radio" *ngFor="let option of question.options">
                          <label>
                            <input type="radio" [id]="question.name" [name]="question.name" [value]="option" [formControlName]="question.name" />
                            {{ option }}
                          </label>
                        </div> <!--/.radio-->
                        <rb-validation-message [validations]="question.validations"
                                               [control]="formGroup.get(group.code).get(question.name)"
                                               [submitted]="submitted">
                        </rb-validation-message>
                      </ng-container> <!--/!readOnly-->

                      <ng-template #readOnlyRadio>
                        <label>{{ question.description }}</label>
                        <span>{{ question.answer || 'NOT_INFORMED' | translate }}</span>
                      </ng-template> <!--/readOnly-->
                    </div> <!--/.form-group-->
                  </ng-template> <!--/radio-->

                  <ng-template ngSwitchCase="select">
                    <div class="form-group" [hidden]="hideQuestion(question, formGroup.get(group.code))">
                      <ng-container *ngIf="!readOnly; else readOnlySelect">
                        <label [for]="question.name" [ngClass]="{ 'required-control': question.isRequired() }">
                          {{ question.description }}
                        </label>
                        <select [id]="question.name" class="form-control" [name]="question.name" #selectQuestion #question.name
                                [formControlName]="question.name"
                                (change)="onChangeOptionSelect(selectQuestion, formGroup.get(group.code).get(question.name), question)">
                          <option disabled [value]="null">
                            {{ question.placeholder ? question.placeholder : '' }}
                          </option>
                          <option *ngFor="let option of question.options" [value]="option['value'] || option">
                            {{ option['description'] || option }}
                          </option>
                        </select>
                        <ng-container *ngIf="question.editableOption && question.editableOption.length">
                          <input [hidden]="question.editableOption !== selectQuestion.value"
                                 type="text" [id]="question.name" class="form-control editable-option" [name]="question.name"
                                 [formControlName]="question.name" />
                        </ng-container>
                        <rb-validation-message [validations]="question.validations"
                                               [control]="formGroup.get(group.code).get(question.name)"
                                               [submitted]="submitted">
                        </rb-validation-message>
                      </ng-container> <!--!readOnly-->

                      <ng-template #readOnlySelect>
                        <label>{{ question.description }}</label>
                        <span>{{ question.answer || 'NOT_INFORMED' | translate }}</span>
                      </ng-template> <!--/readOnly-->
                    </div> <!--/.form-group-->
                  </ng-template> <!--/select-->

                  <ng-template ngSwitchCase="textarea">
                    <div class="form-group" [hidden]="hideQuestion(question, formGroup.get(group.code))">
                      <ng-container *ngIf="!readOnly; else readOnlyTextarea">
                        <label [for]="question.name" [ngClass]="{ 'required-control': question.isRequired() }">
                          {{ question.description }}
                        </label>
                        <textarea [id]="question.name" class="form-control" [name]="question.name" rows="5"
                                  placeholder="{{ question.placeholder ? question.placeholder : '' }}"
                                  [formControlName]="question.name">
                        </textarea>
                        <rb-validation-message [validations]="question.validations"
                                               [control]="formGroup.get(group.code).get(question.name)"
                                               [submitted]="submitted">
                        </rb-validation-message>
                      </ng-container> <!--!readOnly-->

                      <ng-template #readOnlyTextarea>
                        <label>{{ question.description }}</label>
                        <span>{{ question.answer || 'NOT_INFORMED' | translate }}</span>
                      </ng-template> <!--/readOnly-->
                    </div> <!--/.form-group-->
                  </ng-template> <!--/textarea-->

                  <ng-template ngSwitchCase="text" ngSwitchDefault>
                    <div class="form-group" [hidden]="hideQuestion(question, formGroup.get(group.code))">
                      <ng-container *ngIf="!readOnly; else readOnlyText">
                        <label [for]="question.name" [ngClass]="{ 'required-control': question.isRequired() }">
                          {{ question.description }}
                        </label>

                        <rb-tooltip *ngIf="question.tooltip"
                            [tooltip]="question.tooltip"
                            [control]="formGroup.get(group.code).get(question.name)">
                        </rb-tooltip>

                        <input type="text" [id]="question.name" class="form-control" [name]="question.name"
                               placeholder="{{ question.placeholder ? question.placeholder : '' }}"
                               [formControlName]="question.name" [mask]="question.mask" #question.name />

                        <rb-validation-message [validations]="question.validations"
                                               [control]="formGroup.get(group.code).get(question.name)"
                                               [submitted]="submitted">
                        </rb-validation-message>

                      </ng-container> <!--!readOnly-->

                      <ng-template #readOnlyText>
                        <label>{{ question.description }}</label>
                        <span>{{ question.answer || 'NOT_INFORMED' | translate }}</span>
                      </ng-template> <!--readOnly-->
                    </div> <!--/.form-group-->
                  </ng-template> <!--/text-->
                </ng-container> <!--/ngSwitch-questionType-->

              </ng-container> <!--/ngFor-question-->
            </fieldset>
          </ng-container> <!--/ngSwitchCase-fieldset-->

          <ng-container *ngSwitchDefault>
            <rb-data-table [group]="group" [formGroup]="formGroup" [formGroupSubmitted]="submitted" [readOnly]="readOnly"
              (error)="onError($event)">
            </rb-data-table>
          </ng-container>

        </ng-container> <!--/ngSwitch-groupType-->

      </ng-container> <!--groups-->
    </form>
  `
})
export class AngularFormsComponent implements OnInit, OnChanges, AfterViewChecked {

  public readonly Status: Object = Status;

  public formGroup: FormGroup;
  public submitted: boolean = false;

  @Input() public groups: Group<any>[] = [];
  @Input() public lang: string = 'en-US';
  @Input() public readOnly: boolean = false;

  @Output() public error: EventEmitter<Error> = new EventEmitter();
  @Output() public ready: EventEmitter<boolean> = new EventEmitter();

  private _status: Status;

  public constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private translateService: TranslateService
  ) { }

  public ngOnInit(): void {
    this.configTranslate();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['groups']) {
      const groups: Group<any>[] = changes['groups'].currentValue;

      if (!!groups) {
        this._status = Status.LOADING;
        this.load()
          .then(() => {
            this._status = Status.READY;
            this.ready.emit();
          })
          .catch((error: Error) => {
            this._status = Status.ERROR;
            this.printErrorLog(error);
            this.error.emit(error);
          });
      } else {
        this.clear();
      }
    }
  }

  public ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  public getGroupByCode(code: string): Group<any> {
    for (const group of this.groups) {
      if (group.code === code) {
        return group;
      }
    }
  }

  public hideQuestion(question: Question<any>, formGroup: FormGroup): boolean {
    return DependencyService.hideQuestion(question, formGroup);
  }

  public onChangeOptionSelect(htmlFormControl: HTMLInputElement, formControl: FormControl, question: Select): void {
    SelectService.onChangeOption(htmlFormControl, formControl, question);
  }

  public submit(): void {
    this.submitted = true;
  }

  public getForm(): { valid: boolean, value: Object } {
    return { valid: this.isValid(), value: this.getAnswersGroups() };
  }

  public isPristine(): boolean {
    return this.formGroup.pristine;
  }

  public isDirty(): boolean {
    return this.formGroup.dirty;
  }

  public isValid(): boolean {
    return this.formGroup.valid;
  }

  public getAnswersGroups(): Object {
    const answersGroups: Object = this.formGroup.value;

    Object.keys(answersGroups).forEach((groupIndex: string) => {
      if (answersGroups[groupIndex] instanceof Array) {
        (<Array<Object>>answersGroups[groupIndex]).map((answersGroup: Object) => this.convertAnswersOfGroupToString(answersGroup));

        return;
      }

      answersGroups[groupIndex] = this.convertAnswersOfGroupToString(answersGroups[groupIndex]);
    });

    return answersGroups;
  }

  public getAnswers(): Object {
    const answersGroups: Object = this.getAnswersGroups();
    const answers: Object = {};

    Object.keys(answersGroups).forEach((groupIndex: string) => {
      if (answersGroups[groupIndex] instanceof Array) {
        answers[groupIndex] = answersGroups[groupIndex];

        return;
      }

      Object.keys(answersGroups[groupIndex])
        .forEach((questionIndex: string) => answers[questionIndex] = answersGroups[groupIndex][questionIndex]);
    });

    return answers;
  }

  public onError(error: Error): void {
    this.clear();
    this.printErrorLog(error);
    this.error.emit(error);
  }

  public get status(): Status {
    return this._status;
  }

  private configTranslate(): void {
    this.translateService.addLangs(['en-US', 'pt-BR']);
    this.translateService.setDefaultLang('en-US');
    this.translateService.use(this.lang || 'en-US');
  }

  private async load(): Promise<void> {
    return new Promise<void>(async (resolve: () => void, reject: (error: Error) => void) => {
      try {
        this.groups = await AngularForms.fromJson(this.groups);
        this.formGroup = await ReactiveFormsFactory.createFormGroupFromGroups(this.groups);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  private convertAnswersOfGroupToString(answersGroup: Object): Object {
    Object.keys(answersGroup)
      .forEach((questionIndex: string) => answersGroup[questionIndex] = StringUtils.convertToString(answersGroup[questionIndex]));

    return answersGroup;
  }

  private clear(): void {
    this._status = null;
    this.formGroup = null;
  }

  private printErrorLog(error: Error): void {
    console.error(`[AngularForms] ${error.name} :: ${error.message}`);
  }
}
