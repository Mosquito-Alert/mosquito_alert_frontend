import { IdentificationTaskStatus } from 'mosquito-alert'

export const getStatusSeverity = (status: string) => {
  switch (status) {
    case IdentificationTaskStatus.Open:
      return 'info'
    case IdentificationTaskStatus.Conflict:
      return 'danger'
    case IdentificationTaskStatus.Review:
      return 'warning'
    case IdentificationTaskStatus.Done:
      return 'success'
    case IdentificationTaskStatus.Archived:
      return 'secondary'
    default:
      return 'default' // optional fallback
  }
}
