import { Context } from '@nuxt/types';
import { ErrorResponse } from 'apollo-link-error';

export default ({ graphQLErrors, operation, forward, response }: ErrorResponse, nuxtContext: Context) => {
}