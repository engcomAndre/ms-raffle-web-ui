interface GoogleCredentialResponse {
  credential: string
  select_by: string
}

interface GooglePromptNotification {
  isNotDisplayed(): boolean
  isSkippedMoment(): boolean
  getDismissedReason(): string
  getMomentType(): string
}

interface GoogleInitializeConfig {
  client_id: string
  callback: (response: GoogleCredentialResponse) => void
  auto_select?: boolean
  cancel_on_tap_outside?: boolean
  use_fedcm_for_prompt?: boolean
  prompt_parent_id?: string
  context?: string
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: GoogleInitializeConfig) => void
          prompt: (callback: (notification: GooglePromptNotification) => void) => void
        }
      }
    }
  }
}

export {} 