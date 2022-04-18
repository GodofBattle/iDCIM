<template>
    <div id="asset-table">
        <DataTable
            :value="assetList"
            :scrollable="true"
            scroll-height="flex"
            :table-style="{ width: '100%', height: '100%' }"
            data-key="ID"
        >
            <Column
                field="IDX"
                header="IDX"
                :styles="{ 'flex-grow': 1, 'flex-basis': 0 }"
            >
                <template #body="slotProps">
                    <Avatar class="i-asset-index">
                        <span>{{ slotProps.index + 1 }}</span>
                        <Badge class="i-asset-comm-status"></Badge>
                    </Avatar>
                </template>
            </Column>
            <Column
                field="NAME"
                header="자산명"
                :styles="{ 'flex-grow': 1, 'flex-basis': '100%' }"
            >
            </Column>
        </DataTable>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from '@/plugins/nuxt-class-component';
import BadgeDirective from 'primevue/badgedirective';

@Component<AssetTable>({
    directives: { badge: BadgeDirective },
})
export default class AssetTable extends Vue {
    assetList: Array<any> = [
        { ID: 1, IDX: 0, NAME: '가' },
        { ID: 2, IDX: 1, NAME: '나' },
        { ID: 3, IDX: 2, NAME: '다' },
        { ID: 4, IDX: 3, NAME: '라' },
        { ID: 5, IDX: 4, NAME: '마' },
        { ID: 6, IDX: 5, NAME: '바' },
        { ID: 7, IDX: 6, NAME: '사' },
        { ID: 8, IDX: 7, NAME: '아' },
        { ID: 9, IDX: 7, NAME: '아' },
        { ID: 10, IDX: 7, NAME: '아' },
        { ID: 11, IDX: 7, NAME: '아' },
        { ID: 12, IDX: 7, NAME: '아' },
        { ID: 13, IDX: 7, NAME: '아' },
    ];
}
</script>

<style lang="scss" scoped>
#asset-table::v-deep {
    .i-asset-index {
        position: relative;

        .i-asset-comm-status {
            position: absolute;
            top: 0;
            right: 0;
            transform-origin: 100% 0;
            transform: translate(40%, -20%);
        }
    }
}
</style>