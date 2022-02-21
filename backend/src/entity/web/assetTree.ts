import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class AssetTree {
    @Field(() => String)
    key: string;

    @Field(() => String, { nullable: null })
    parent_key: string | null;

    @Field(() => String)
    label: string;

    @Field(() => String)
    alias: string;

    @Field(() => Int, { nullable: true })
    order: number;

    @Field(() => [AssetTree]!, { nullable: true })
    children: AssetTree[] | null;

    @Field(() => AssetTree, { nullable: true })
    parent: AssetTree | null;

    constructor({ key, label, alias, order, parent = null, children = null, parent_key = null }) {
        this.key = key;
        this.label = label;
        this.alias = alias;
        this.order = order;
        this.parent = parent;
        this.parent_key = parent_key;
        this.children = children !== null ? children : new Array<AssetTree>();
    }
}