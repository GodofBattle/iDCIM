/**
 * Define Site Infomation
 */
import { Module, VuexModule, Mutation } from 'vuex-module-decorators';

@Module({
    name: 'site',
    namespaced: true,
    stateFactory: true
})
export default class SiteStore extends VuexModule {
    is_sidebar: Boolean = true;

    get isSidebar() {
        return this.is_sidebar;
    }

    @Mutation
    toggle() {
        this.is_sidebar = !this.is_sidebar;
    }
}
