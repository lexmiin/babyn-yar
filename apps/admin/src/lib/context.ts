import { getContext, setContext } from 'svelte'
import type { Getter } from './runes'
import type { UserSchema } from '@babyn-yar/schema'

export type LoggedUserContext = UserSchema.User | undefined

export type TableRowContext = {
  href?: string
}

export type FieldContext = {
  // Passed as Getter if field is disabled/enabled programmatically
  disabled: Getter<boolean>
}

export type ComboxContext<T> = {
  getValue: (option: T) => string
  displayValue: (option: T) => string
}

const tableRowCtxKey = Symbol('TableRow')
const fieldCtxKey = Symbol('Field')
const loggedUserCtxKey = Symbol('LoggedUser')
const comboboxCtxKey = Symbol('ComboxContext')

export function setTableRowContext(ctx: TableRowContext) {
  setContext(tableRowCtxKey, ctx)
}
export function getTableRowContext(): TableRowContext {
  return getContext(tableRowCtxKey)
}

export function setFieldContext(ctx: FieldContext) {
  setContext(fieldCtxKey, ctx)
}
export function getFieldContext(): FieldContext | undefined {
  return getContext(fieldCtxKey)
}

export function setLoggedUserContext(ctx: Getter<LoggedUserContext>) {
  setContext(loggedUserCtxKey, ctx)
}
export function getLoggedUserContext() {
  const user = getContext<Getter<LoggedUserContext>>(loggedUserCtxKey)()
  if (!user) {
    throw new Error('getLoggedUserContext must be used with LoggedUserContext')
  }
  return user
}

export function setComboboxContext<T>(ctx: ComboxContext<T>) {
  setContext(comboboxCtxKey, ctx)
}
export function getComboboxContext<T>(): ComboxContext<T> {
  return getContext(comboboxCtxKey)
}
