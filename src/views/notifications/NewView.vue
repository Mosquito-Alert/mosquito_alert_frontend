<template>
  <div class="card">
    <div class="flex flex-row">
      <h4 class="m-0!">New notification</h4>
      <div class="flex ml-auto gap-2">
        <Select v-model="selectedLanguage" :options="languages" showClear optionLabel="name"
          placeholder="Select a language" class="w-full md:w-56">
          <template #dropdownicon>
            <i class="pi pi-language" />
          </template></Select>
        <Button label="Send" icon="pi pi-send" iconPos="right" />
      </div>
    </div>
  </div>
  <div class="grid grid-cols-12 gap-8">
    <div class="col-span-12 xl:col-span-6">
      <div class="flex flex-col card gap-2">
        <FloatLabel variant="in">
          <InputText id="in_label" v-model="messageTitle" type="text" class="w-full" />
          <label for="in_label">Title</label>
        </FloatLabel>
        <Editor v-model="messageBody" editorStyle="height: 520px" :pt="pt">
          <!-- <template v-slot:toolbar>
            <span class="ql-formats">
              <select class="ql-header">
                <option selected></option>
                <option value="3"></option>
                <option value="4"></option>
                <option value="5"></option>
              </select>

              <select class="ql-size">
                <option value="small"></option>
                <option selected></option>
                <option value="large"></option>
              </select>

            </span>
            <span class="ql-formats">
              <button v-tooltip.bottom="'Bold'" class="ql-bold"></button>
              <button v-tooltip.bottom="'Italic'" class="ql-italic"></button>
              <button v-tooltip.bottom="'Underline'" class="ql-underline"></button>
            </span>
            <span class="ql-formats">
              <select class="ql-color"></select>

              <select class="ql-background"></select>
            </span>
            <span class="ql-formats">
              <button class="ql-list" value="ordered"></button>
              <button class="ql-list" value="bullet"></button>
              <select class="ql-align">
                <option selected></option>
                <option value="center"></option>
                <option value="right"></option>
                <option value="justify"></option>
              </select>
            </span>

          </template> -->
        </Editor>
      </div>
    </div>
    <div class="col-span-12 xl:col-span-6">
      <div class="card">
        <!-- <Tag severity="secondary" value="Preview" rounded /> -->

        <h4 class="m-0! break-all">{{ messageTitle }}</h4>
        <div class="mt-4" v-html="messageBody"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const messageTitle = ref<string>("");
const messageBody = ref<string>("");

const imageOnClick = {
  // Here we attach a custom click handler
  onClick: (event, options) => {
    event.preventDefault()
    const url = prompt("Enter image URL:")
    if (url) {
      const quill = options.instance.quill // PrimeVue exposes quill instance
      const range = quill.getSelection()
      quill.insertEmbed(range.index, "image", url, "user")
    }
  }
}

const pt = {
  image: {
    // Here we attach a custom click handler
    onClick: (event, options) => {
      event.preventDefault()
      const url = prompt("Enter image URL:")
      if (url) {
        const quill = options.instance.quill // PrimeVue exposes quill instance
        const range = quill.getSelection()
        quill.insertEmbed(range.index, "image", url, "user")
      }
    }
  }
}

</script>
