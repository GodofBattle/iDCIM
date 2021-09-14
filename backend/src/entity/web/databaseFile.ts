import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class DataBaseFile {
    @Field(() => String)
    FILE_NAME: String;
    
    @Field(() => String)
    DATA: String;

    @Field(() => String)
    MIMETYPE: String;
}