<!-- src/components/common/PartsArrayRemoveRules.vue -->
<template>
  <v-menu v-model="menu" :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" size="small" icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item @click="handleEdit">
        <v-icon class="text-primary">mdi-pencil</v-icon>
        <span class="text-primary pl-6">編集</span>
      </v-list-item>
      <v-list-item @click="handleDuplicate">
        <v-icon class="text-info">mdi-content-copy</v-icon>
        <span class="text-info pl-6">複製</span>
      </v-list-item>
      <v-list-item @click="removeList">
        <v-icon class="text-warning">mdi-playlist-remove</v-icon>
        <span class="text-warning pl-6">リストから除外</span>
      </v-list-item>
      <v-list-item @click="deleteItem">
        <v-icon class="text-error">mdi-delete</v-icon>
        <span class="text-error pl-6">データの削除</span>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type {
  OmikenEntry,
  OmikenCategory,
  OmikujiType,
  RulesType,
} from "@/types";
import Swal from "sweetalert2";

const props = defineProps<{
  selectCategory: OmikenCategory;
  rules: RulesType;
  item: OmikujiType;
}>();

const emit = defineEmits<{
  (e: "edit"): void;
  (e: "update:Omiken", payload: OmikenEntry<OmikenCategory>): void;
}>();

const menu = ref(false);

const handleEdit = () => {
  emit("edit");
  menu.value = false;
};

// アイテムの複製 // TODO 未完成、enabledIdsへの追加ができていない
const handleDuplicate = () => {
  if (props.selectCategory === "omikuji") {
    const duplicatedItem = JSON.parse(JSON.stringify(props.item));
    duplicatedItem.id = `${duplicatedItem.id}_copy`;
    duplicatedItem.name = `${duplicatedItem.name} (コピー)`;
    duplicatedItem.rulesId = props.rules.id;
    emit("update:Omiken", {
      type: "omikuji",
      addKeys: [duplicatedItem],
    });
  }
  menu.value = false;
};

// enabledIdsから除去
const removeList = () => {
  if (props.rules.id) {
    const update: Record<string, RulesType> = {
      [props.rules.id]: {
        ...props.rules,
        enabledIds: props.rules.enabledIds.filter(
          (id: string) => id !== props.item.id
        ),
      },
    };

    emit("update:Omiken", {
      type: "rules",
      update,
    });
  }
  menu.value = false;
};

const deleteItem = () => {
  menu.value = false;

  Swal.fire({
    title: `${props.item.name} を削除する`,
    text: 0 ? "" : "この設定を削除しますか？",
    icon: "warning",
    confirmButtonText: "OK",
    confirmButtonColor: "",
    showDenyButton: true,
    denyButtonColor: "",
    denyButtonText: "キャンセル",
  }).then((result) => {
    if (result.isConfirmed) {
      if (props.selectCategory === "omikuji") {
        emit("update:Omiken", {
          type: "omikuji",
          delKeys: [props.item.id],
        });
      }
    }
  });
};
</script>
