import { ArgsType, Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class AssetTree {
    @Field(() => String)
    key: string;

    @Field(() => String, { nullable: true })
    parent_key: string | null;

    @Field(() => String)
    name: string;

    @Field(() => String)
    label: string;

    @Field(() => String)
    alias: string;

    @Field(() => Int, { nullable: true })
    order: number;

    @Field(() => String, { nullable: true })
    type: string;

    @Field(() => Boolean, { nullable: true })
    manipulable: boolean;

    @Field(() => [AssetTree]!, { nullable: true })
    children: AssetTree[] | null;

    constructor({ key, label, alias, order, parent = null, children = null, parent_key = null }) {
        this.key = key;
        this.label = label;
        this.alias = alias;
        this.order = order;
        this.parent_key = parent_key;
        this.children = children !== null ? children : new Array<AssetTree>();
    }
}

@ArgsType()
export class AssetTreeArgs {
    @Field(() => String, { nullable: true })
    parent_key: string | null;

    @Field(() => String, { nullable: true })
    label: string;

    @Field(() => String, { nullable: true })
    alias: string;

    @Field(() => Int, { nullable: true })
    order: number;
}