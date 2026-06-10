import {
  AbilityBuilder,
  createMongoAbility,
  type ForcedSubject,
  type MongoAbility,
} from '@casl/ability'
import {
  type Permissions,
  type AnnotationPermission,
  type IdentificationTaskPermission,
  type ReviewPermission,
  type MessagePermission,
  type Annotation,
  type Country,
  type IdentificationTask,
  type Message,
} from 'mosquito-alert'

type Actions = 'add' | 'view' | 'change' | 'delete'
type Subjects =
  | Annotation
  | Country
  | IdentificationTask
  | Message
  | 'Annotation'
  | 'Review'
  | 'Country'
  | 'IdentificationTask'
  | 'Message'
export type AppAbility = MongoAbility<[Actions, Subjects | ForcedSubject<Exclude<Subjects, 'all'>>]>

export default function defineAbilityFor(permissions: Permissions | null) {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

  function grantAnnotationPermissions(perms: AnnotationPermission) {
    // TODO: remove this once the backend support a Reviwer adding annotations.
    if (perms.add) {
      can('add', 'Annotation')
      can('add', 'IdentificationTask', ['annotations'])
    }
    if (perms.change) can('change', 'Annotation')
    if (perms.view) {
      can('view', 'Annotation')
      // can('view', 'IdentificationTask')
    }
    if (perms.delete) can('delete', 'Annotation')
  }

  function grantIdentificationTaskPermissions(perms: IdentificationTaskPermission) {
    if (perms.add) can('add', 'IdentificationTask')
    if (perms.change) can('change', 'IdentificationTask')
    if (perms.view) can('view', 'IdentificationTask')
    if (perms.delete) can('delete', 'IdentificationTask')
  }

  function grantReviewPermissions(perms: ReviewPermission) {
    if (perms.add) {
      can('add', 'Review', {
        'identification_task.review': null,
      })
    }
    if (perms.change) {
      can('change', 'Review', {
        'identification_task.review': { $ne: null },
      })
    }
    if (perms.view) can('view', 'Review')
    if (perms.delete) can('delete', 'Review')
  }

  function grantMessagePermissions(perms: MessagePermission) {
    if (perms.add) can('add', 'Message')
    if (perms.change) can('change', 'Message')
    if (perms.view) can('view', 'Message')
    if (perms.delete) can('delete', 'Message')
  }

  if (!permissions) return build()

  grantAnnotationPermissions(permissions.annotation)
  grantIdentificationTaskPermissions(permissions.identification_task)
  grantReviewPermissions(permissions.review)
  grantMessagePermissions(permissions.message)

  return build()
}
