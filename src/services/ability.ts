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
  type Annotation,
  type Country,
  type IdentificationTask,
  IdentificationTaskStatus,
} from 'mosquito-alert'

type Actions = 'add' | 'view' | 'change' | 'delete'
type Subjects =
  | Annotation
  | Country
  | IdentificationTask
  | 'Annotation'
  | 'Review'
  | 'Country'
  | 'IdentificationTask'

export type AppAbility = MongoAbility<[Actions, Subjects | ForcedSubject<Exclude<Subjects, 'all'>>]>

export default function defineAbilityFor(userPermission: UserPermission | null) {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

  function grantAnnotationPermissions(perms: AnnotationPermission, countryId?: number) {
    if (perms.add) {
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

    if (perms.mark_as_decisive) {
      can('change', 'Annotation', ['is_decisive'], buildCountryCondition(countryId))
      can('change', 'IdentificationTask', ['is_decisive'], buildCountryCondition(countryId))
    } else {
      cannot('change', 'Annotation', ['is_decisive'], buildCountryCondition(countryId))
      cannot('change', 'IdentificationTask', ['is_decisive'], buildCountryCondition(countryId))
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
    if (perms.add) {
      const countryCondition = buildCountryCondition(countryId)
      const remappedCountryCondition = countryCondition
        ? Object.fromEntries(
            Object.entries(countryCondition).map(([key, value]) => [
              `identification_task.${key}`,
              value,
            ]),
          )
        : {}
      can('add', 'Review', {
        'identification_task.status': {
          $in: [
            IdentificationTaskStatus.Conflict,
            IdentificationTaskStatus.Done,
            IdentificationTaskStatus.Review,
          ],
        },
        'identification_task.review': null,
        ...remappedCountryCondition,
      })
    }
    if (perms.change) can('change', 'Review', buildCountryCondition(countryId))
    if (perms.view) can('view', 'Review', buildCountryCondition(countryId))
    if (perms.delete) can('delete', 'Review', buildCountryCondition(countryId))
  }

  function buildCountryCondition(countryId?: number) {
    return countryId ? { 'observation.location.country.id': countryId } : undefined
  }

  if (!userPermission) return build()

  const { general, countries = [] } = userPermission
  const annotationPerms = general.permissions.annotation ?? {}
  const taskPerms = general.permissions.identification_task ?? {}
  const reviewPerms = general.permissions.review ?? {}

  if (general?.is_staff) {
    can('view', 'Annotation')
    can('view', 'IdentificationTask')
    can('view', 'Review')
  }

  grantAnnotationPermissions(annotationPerms)
  grantIdentificationTaskPermissions(taskPerms)
  grantReviewPermissions(reviewPerms)

  for (const { country, permissions } of countries) {
    const countryId = country.id
    const countryAnnotationPerms = permissions.annotation ?? {}
    const countryTaskPerms = permissions.identification_task ?? {}
    const countryReviewPerms = permissions.review ?? {}

    grantAnnotationPermissions(countryAnnotationPerms, countryId)
    grantIdentificationTaskPermissions(countryTaskPerms, countryId)
    grantReviewPermissions(countryReviewPerms, countryId)
  }

  return build()
}
