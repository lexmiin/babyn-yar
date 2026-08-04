import * as v from 'valibot'
import { Metadata } from './metadata'

export namespace UserSchema {
  const Email = v.pipe(v.string(), v.email())
  const FullName = v.pipe(v.string(), v.minLength(3))

  const Password = v.pipe(
    v.string(),
    v.minLength(8),
    v.maxLength(72),
    v.regex(
      /^[\x20-\x7e]+$/,
      'Пароль може містити лише друковані ASCII-символи'
    )
  )

  const OptionalPassword = v.pipe(
    v.string(),
    v.transform(value => (value.length > 0 ? value : undefined)),
    v.undefinedable(Password)
  )

  export const User = v.pipe(
    v.object({
      id: v.number(),
      fullName: FullName,
      email: Email,
      permissions: v.array(v.string()),
      createdAt: v.string(),
      updatedAt: v.string()
    }),
    v.transform(input => ({
      ...input,
      createdAt: new Date(input.createdAt),
      updatedAt: new Date(input.updatedAt)
    }))
  )

  export const Settings = v.object({
    fullName: FullName,
    email: Email,
    password: OptionalPassword
  })

  export const Register = v.object({
    email: Email,
    fullName: FullName,
    password: Password,
    permission: v.union([v.literal('admin'), v.literal('publisher')])
  })

  export const Edit = v.object({
    email: Email,
    fullName: FullName,
    permission: v.union([v.literal('admin'), v.literal('publisher')])
  })

  export const ResetPasswordRequest = v.object({
    password: Password
  })

  export const ResetPassword = v.pipe(
    v.object({
      password: Password,
      passwordConfirmation: Password
    }),
    v.forward(
      v.partialCheck(
        [['password'], ['passwordConfirmation']],
        input => input.password === input.passwordConfirmation,
        'Паролі не збігаються'
      ),
      ['passwordConfirmation']
    )
  )

  export const DetailResponse = v.object({
    user: User
  })

  export const Filters = v.object({
    page: v.optional(v.pipe(v.number(), v.minValue(1)))
  })

  export const ListResponse = v.object({
    users: v.array(User),
    metadata: Metadata
  })

  export const Login = v.object({
    password: v.pipe(v.string(), v.minLength(8)),
    email: v.pipe(v.string(), v.email())
  })

  export type User = v.InferOutput<typeof User>
  export type DetailResponse = v.InferOutput<typeof DetailResponse>
  export type ListResponse = v.InferOutput<typeof ListResponse>
  export type Settings = v.InferOutput<typeof Settings>
  export type Register = v.InferInput<typeof Register>
  export type Edit = v.InferOutput<typeof Edit>
  export type ResetPasswordRequest = v.InferOutput<typeof ResetPasswordRequest>
  export type ResetPassword = v.InferOutput<typeof ResetPassword>
  export type Filters = v.InferInput<typeof Filters>
  export type Login = v.InferInput<typeof Login>
}
