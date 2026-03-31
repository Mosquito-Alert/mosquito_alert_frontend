import {
  AbilityBuilder,
  createMongoAbility,
  type ForcedSubject,
  type MongoAbility,
} from '@casl/ability'
import {
  type UserPermission,
  type AnnotationPermission,
  type IdentificationTaskPermission,
  type ReviewPermission,
  type MessagePermission,
  type Annotation,
  type Country,
  type IdentificationTask,
  type Message,
  CountryPermissionRole,
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

export default function defineAbilityFor(userPermission: UserPermission | null) {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

  function grantAnnotationPermissions(
    role: CountryPermissionRole,
    perms: AnnotationPermission,
    countryId?: number,
  ) {
    // TODO: remove this once the backend support a Reviwer adding annotations.
    if (perms.add && role !== CountryPermissionRole.Reviewer) {
      can('add', 'Annotation')
      // can('add_annotation', 'IdentificationTask', buildCountryCondition(countryId))
      can('add', 'IdentificationTask', ['annotations'], buildCountryCondition(countryId))
    }
    if (perms.change) can('change', 'Annotation', buildCountryCondition(countryId))
    if (perms.view) {
      can('view', 'Annotation', buildCountryCondition(countryId))
      can('view', 'IdentificationTask', buildCountryCondition(countryId))
    }
    if (perms.delete) can('delete', 'Annotation', buildCountryCondition(countryId))

    if (perms.mark_as_executive) {
      can('change', 'Annotation', ['is_executive'], buildCountryCondition(countryId))
      can('change', 'IdentificationTask', ['is_executive'], buildCountryCondition(countryId))
    } else {
      cannot('change', 'Annotation', ['is_executive'], buildCountryCondition(countryId))
      cannot('change', 'IdentificationTask', ['is_executive'], buildCountryCondition(countryId))
    }
  }

  function grantIdentificationTaskPermissions(
    perms: IdentificationTaskPermission,
    countryId?: number,
  ) {
    if (perms.add) can('add', 'IdentificationTask', buildCountryCondition(countryId))
    if (perms.change) can('change', 'IdentificationTask', buildCountryCondition(countryId))
    if (perms.view) can('view', 'IdentificationTask', buildCountryCondition(countryId))
    if (perms.delete) can('delete', 'IdentificationTask', buildCountryCondition(countryId))
  }

  function grantReviewPermissions(perms: ReviewPermission, countryId?: number) {
    const countryCondition = buildCountryCondition(countryId)
    const remappedCountryCondition = countryCondition
      ? Object.fromEntries(
          Object.entries(countryCondition).map(([key, value]) => [
            `identification_task.${key}`,
            value,
          ]),
        )
      : {}
    if (perms.add) {
      can('add', 'Review', {
        'identification_task.review': null,
        ...remappedCountryCondition,
      })
    }
    if (perms.change) {
      can('change', 'Review', {
        'identification_task.review': { $ne: null },
        ...remappedCountryCondition,
      })
    }
    if (perms.view) can('view', 'Review', buildCountryCondition(countryId))
    if (perms.delete) can('delete', 'Review', buildCountryCondition(countryId))
  }

  function grantMessagePermissions(perms: MessagePermission) {
    if (perms.add) can('add', 'Message')
    if (perms.change) can('change', 'Message')
    if (perms.view) can('view', 'Message')
    if (perms.delete) can('delete', 'Message')
  }

  function buildCountryCondition(countryId?: number) {
    return countryId ? { 'observation.location.country.id': countryId } : undefined
  }

  if (!userPermission) return build()

  const { general, countries = [] } = userPermission
  const annotationPerms = general.permissions.annotation ?? {}
  const taskPerms = general.permissions.identification_task ?? {}
  const reviewPerms = general.permissions.review ?? {}
  const messagePerms = general.permissions.message ?? {}

  if (general?.is_staff) {
    can('view', 'Annotation')
    can('view', 'IdentificationTask')
    can('view', 'Review')
  }

  grantAnnotationPermissions(general.role, annotationPerms)
  grantIdentificationTaskPermissions(taskPerms)
  grantReviewPermissions(reviewPerms)
  grantMessagePermissions(messagePerms)

  for (const { country, permissions, role } of countries) {
    const countryId = country.id
    const countryAnnotationPerms = permissions.annotation ?? {}
    const countryTaskPerms = permissions.identification_task ?? {}
    const countryReviewPerms = permissions.review ?? {}

    grantAnnotationPermissions(role, countryAnnotationPerms, countryId)
    grantIdentificationTaskPermissions(countryTaskPerms, countryId)
    grantReviewPermissions(countryReviewPerms, countryId)
  }

  return build()
}
