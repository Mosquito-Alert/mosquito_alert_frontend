<template>
  <div class="card">
    <div class="flex">
      <div class="flex flex-1 flex-col gap-4">
        <!-- * FROM -->
        <div class="flex items-center gap-2">
          <span>From:</span>
          <div v-if="messagesStore.messageDetail" class="flex items-center">
            <UserAvatar :user="messagesStore.messageDetail.sender_user" />
            <div class="ml-2 leading-6 text-color font-medium">
              {{
                messagesStore.messageDetail.sender_user.full_name ||
                messagesStore.messageDetail.sender_user.username
              }}
            </div>
          </div>
          <Skeleton v-else />
          <div class="ml-auto">
            <InputGroup>
              <InputGroupAddon>
                <i class="pi pi-language" />
              </InputGroupAddon>
              <Select
                :options="messagesStore.messageDetailAvailableLanguages"
                v-model="messagesStore.messageDetailSelectedLanguage"
                :optionLabel="(value) => getLanguageName(value)"
              />
            </InputGroup>
          </div>
        </div>

        <!-- * TO -->
        <div
          :class="{
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4':
              target === MessageTarget.Audience,
            'flex flex-col gap-4': target === MessageTarget.Users,
          }"
        >
          <!-- RECIPIENTS -->
          <div class="col-span-1 md:col-span-1 lg:col-span-3 w-full">
            <div class="mb-2">
              To
              <span v-if="!messagesStore.loadingMessageDetail" class="text-muted-color">
                ({{ messagesStore.recipientsTotalReadCount }} reads of
                {{ messagesStore.recipientsTotalCount }})
              </span>
              :
            </div>
            <div class="flex flex-1 flex-wrap gap-2 overflow-auto max-h-48">
              <Skeleton v-if="messagesStore.loadingMessageDetail" />
              <VirtualScroller
                v-else
                :items="recipients"
                :itemSize="itemSize"
                :loading="messagesStore.loadingRecipients"
                @scroll="onScroll"
                class="border border-surface-200 dark:border-surface-700 rounded w-full h-48!"
              >
                <template v-slot:item="{ item }">
                  <Skeleton v-if="!item" height="40px" class="m-1" />
                  <MessageRecipientChip
                    v-else
                    :user="item.user"
                    :has_read="item.has_read"
                    class="m-0.5"
                  />
                </template>
                <template v-slot:loader>
                  <Skeleton height="40px" class="m-1" />
                </template>
              </VirtualScroller>
            </div>
          </div>

          <!-- TARGET -->
          <div class="col-span-1 md:col-span-1 lg:col-span-2 w-full">
            <div class="flex flex-row items-center gap-2 mb-2">
              <span>Target:</span>
              <div class="flex flex-1 flex-wrap gap-2 overflow-auto max-h-48">
                <!-- Target recipients will be displayed here -->
                <Skeleton v-if="messagesStore.loadingMessageDetail" />
                <div v-else class="flex flex-wrap gap-2">
                  <span class="text-muted-color"> {{ getTarget() }} </span>
                </div>
              </div>
            </div>
            <div
              v-if="target === MessageTarget.Audience"
              class="filters flex flex-col gap-1 w-full py-1 px-3 bg-gray-100 rounded-lg"
            >
              <div class="text-sm font-medium italic text-gray-600 flex">
                {{ filtersAsChips.length }} active filter{{ filtersAsChips.length > 1 ? 's' : '' }}:
              </div>
              <div class="chips flex flex-wrap gap-1.5">
                <Chip
                  v-for="chip in filtersAsChips"
                  :key="chip.key"
                  :pt="{
                    root: getChipMessageStyle(chip.key),
                  }"
                >
                  {{ chip.label }}
                  <button
                    v-if="chip.key == ChipMessageKey.GEOMETRY"
                    type="button"
                    class="ml-1 text-gray-500 hover:text-gray-700 cursor-pointer"
                    @click="() => (geometryVisible = !geometryVisible)"
                  >
                    <i v-if="!geometryVisible" class="pi pi-eye"></i>
                    <i v-else class="pi pi-eye-slash"></i>
                  </button>
                </Chip>
              </div>
            </div>
          </div>
        </div>

        <!-- * DATE -->
        <div class="flex">
          <span v-if="messagesStore.messageDetail" class="text-muted-color">{{
            formatLocalDateTime(messagesStore.messageDetail.created_at)
          }}</span>
          <Skeleton v-else />
        </div>
      </div>
    </div>
    <Divider />
    <div v-if="messagesStore.messageDetail">
      <h2 class="text-2xl font-bold mb-4">
        {{ getTitle() }}
      </h2>
      <div v-html="getBody()"></div>
    </div>
    <div v-else class="flex items-center justify-center h-full w-full py-10">
      <ProgressSpinner />
    </div>
  </div>

  <Dialog v-model:visible="geometryVisible" header="Filtered region">
    <div class="audience-map w-4xl h-96 md:h-125">
      <MessageMapFilter
        class="flex"
        ref="messageMapFilter"
        :selectedRegion="{
          geometry: messagesStore.messageDetailAudience?.in_area,
          centroid: { lat: 0, lon: 0 },
        }"
      />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import MessageMapFilter from '@/components/messages/MessageMapFilter.vue'
import MessageRecipientChip from '@/components/messages/MessageRecipientChip.vue'
import UserAvatar from '@/components/users/UserAvatar.vue'
import { formatLocalDateTime, formatLocalDateTimeShort } from '@/utils/DateUtils'
import { capitalize, getLanguageName } from '@/utils/Utils'
import { MessageTarget, type MessageRecipient } from 'mosquito-alert'
import {
  Chip,
  Divider,
  InputGroup,
  InputGroupAddon,
  ProgressSpinner,
  Select,
  Skeleton,
  VirtualScroller,
} from 'primevue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useMessagesStore } from '../../stores/messagesStore'
import { ChipMessageKey } from '../../types/types'
import { getChipMessageStyle } from '../../utils/constants'

const messagesStore = useMessagesStore()

// * Props
const props = defineProps<{
  messageId: number
}>()

// * State
const recipients = ref<MessageRecipient[]>([])
const geometryVisible = ref(false)
const target = computed(() => messagesStore.messageDetail?.target || 'N/A')
const filtersAsChips = computed(() => {
  const chips: { key: string; label: string }[] = []
  if (!messagesStore.messageDetailAudience) return chips

  const { in_area, last_login_after, locale } = messagesStore.messageDetailAudience

  if (in_area) {
    chips.push({ key: ChipMessageKey.GEOMETRY, label: 'Spatial Filter' })
  }
  if (last_login_after) {
    chips.push({
      key: ChipMessageKey.LAST_LOGIN,
      label: `Last login after ${formatLocalDateTimeShort(last_login_after)}`,
    })
  }
  if (locale) {
    chips.push({ key: `${ChipMessageKey.LOCALE_PREFIX}${locale}`, label: getLanguageName(locale) })
  }

  return chips
})

const pageSize = 25
const itemSize = 50
const loadingPages = new Set<number>()

// * Methods
const getTitle = () =>
  messagesStore.messageDetail?.content?.title?.[messagesStore.messageDetailSelectedLanguage] ||
  'No title'

const getBody = () =>
  messagesStore.messageDetail?.content?.body?.[messagesStore.messageDetailSelectedLanguage] ||
  'No content'

const getTarget = () => capitalize(target.value.replace(/_/g, ' '))

// Load a specific page of recipients, ensuring that we don't load the same page multiple times and that we respect the pagination limits.
const loadPage = async (page: number) => {
  if (loadingPages.has(page)) return
  if (messagesStore.recipientsPagination?.next === null && page > 1) return
  loadingPages.add(page)
  try {
    await messagesStore.fetchRecipients({ messageUuid: props.messageId, page, pageSize })
    recipients.value.splice((page - 1) * pageSize, pageSize, ...messagesStore.recipients)
  } catch (error) {
    console.error('Error fetching recipients:', error)
  } finally {
    loadingPages.delete(page)
  }
}

// Handle the scroll event to determine if we need to load more recipients based on the user's scroll position and the number of recipients already loaded.
const onScroll = (event: Event) => {
  const el = event.target as HTMLElement
  if (!el) return
  const loadedCount = recipients.value.filter(Boolean).length
  if (loadedCount >= messagesStore.recipientsTotalCount) return
  const loadedHeight = loadedCount * itemSize
  const nearLoadedEnd = el.scrollTop + el.clientHeight >= loadedHeight - itemSize * 3
  if (!nearLoadedEnd) return
  loadPage(Math.floor(loadedCount / pageSize) + 1)
}

onMounted(async () => {
  try {
    await messagesStore.fetchMessageDetail(props.messageId)
    recipients.value = Array.from({ length: messagesStore.recipientsStats.total })
    await loadPage(1)
    await messagesStore.fetchAudienceForMessage(props.messageId)
  } catch (error) {
    console.error('Error fetching message details:', error)
  }
})

onUnmounted(() => {
  messagesStore.clearMessageDetail()
})
</script>
